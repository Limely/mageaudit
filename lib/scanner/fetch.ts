/**
 * The fetch layer. Every probe goes through `fetchTarget`, which does a
 * direct browser-like request first and, only if that hits a WAF/Cloudflare
 * block, retries through ScrapingBee (premium proxy, no JS render — the right
 * mode for raw status/header probes). See scan.md for the two-tier rationale.
 */

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const DEFAULT_TIMEOUT_MS = 10_000;

export interface FetchResult {
  ok: boolean; // HTTP 2xx
  status: number; // 0 when the request never completed
  headers: Headers;
  body: string;
  url: string; // final URL after redirects
  /** True when the origin looks WAF-blocked (403/503/429 or a challenge page). */
  blocked: boolean;
  /** Set when the request threw (DNS, TLS, timeout). */
  error?: string;
  /** Which path served the response. */
  via: "direct" | "scrapingbee";
}

function looksBlocked(status: number, body: string): boolean {
  if (status === 403 || status === 429 || status === 503) return true;
  const b = body.slice(0, 2000).toLowerCase();
  return (
    b.includes("cf-browser-verification") ||
    b.includes("just a moment") ||
    b.includes("attention required! | cloudflare") ||
    b.includes("_cf_chl_opt")
  );
}

/** Join a base origin and a path safely (path may start with or without "/"). */
export function joinUrl(base: string, path: string): string {
  if (!path || path === "/") return base;
  return new URL(path, base.endsWith("/") ? base : base + "/").toString();
}

async function directFetch(url: string, timeoutMs: number, method: string): Promise<FetchResult> {
  try {
    const res = await fetch(url, {
      method,
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
      headers: { "User-Agent": UA, Accept: "*/*" },
    });
    // HEAD requests carry no body; GET probes need it for fingerprinting.
    const body = method === "HEAD" ? "" : await res.text();
    return {
      ok: res.ok,
      status: res.status,
      headers: res.headers,
      body,
      url: res.url || url,
      blocked: looksBlocked(res.status, body),
      via: "direct",
    };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      headers: new Headers(),
      body: "",
      url,
      blocked: false,
      error: e instanceof Error ? e.message : String(e),
      via: "direct",
    };
  }
}

async function scrapingBeeFetch(url: string, timeoutMs: number): Promise<FetchResult> {
  const key = process.env.SCRAPINGBEE_API_KEY;
  if (!key) return { ok: false, status: 0, headers: new Headers(), body: "", url, blocked: true, via: "direct" };

  const api = new URL("https://app.scrapingbee.com/api/v1/");
  api.searchParams.set("api_key", key);
  api.searchParams.set("url", url);
  api.searchParams.set("render_js", "false"); // raw bytes, not a rendered DOM
  api.searchParams.set("premium_proxy", "true"); // 10 credits — beats most WAFs
  api.searchParams.set("transparent_status_code", "true"); // pass through real 200/403/404
  api.searchParams.set("forward_headers_pure", "true");

  try {
    const res = await fetch(api, { signal: AbortSignal.timeout(timeoutMs + 20_000) });
    const body = await res.text();
    // ScrapingBee returns target headers prefixed with "Spb-"; rebuild them.
    const headers = new Headers();
    res.headers.forEach((v, k) => {
      if (k.toLowerCase().startsWith("spb-")) headers.set(k.slice(4), v);
    });
    return {
      ok: res.status >= 200 && res.status < 300,
      status: res.status,
      headers,
      body,
      url,
      blocked: false,
      via: "scrapingbee",
    };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      headers: new Headers(),
      body: "",
      url,
      blocked: false,
      error: e instanceof Error ? e.message : String(e),
      via: "scrapingbee",
    };
  }
}

export interface FetchOptions {
  timeoutMs?: number;
  method?: "GET" | "HEAD";
  /** Escalate to ScrapingBee when the direct request is blocked. Default true. */
  allowProxyFallback?: boolean;
}

/** Fetch a single path on the target store, with WAF fallback. */
export async function fetchTarget(url: string, opts: FetchOptions = {}): Promise<FetchResult> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, method = "GET", allowProxyFallback = true } = opts;
  const direct = await directFetch(url, timeoutMs, method);
  if (direct.blocked && allowProxyFallback && process.env.SCRAPINGBEE_API_KEY) {
    const viaBee = await scrapingBeeFetch(url, timeoutMs);
    if (viaBee.status > 0) return viaBee;
  }
  return direct;
}
