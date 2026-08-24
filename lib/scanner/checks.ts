/**
 * The security checks. Each is a read-only, non-destructive probe (GET only)
 * against a store the operator is auditing — the same class of externally
 * observable checks MageReport runs. Each returns a `Check`.
 *
 * A check should never throw; on network failure it returns an "unknown"
 * result so one flaky probe can't sink the whole scan. The runner also wraps
 * every check in a timeout as a backstop.
 */

import { fetchTarget, joinUrl } from "./fetch";
import { assessVersion } from "./version-db";
import type { Check, Detection } from "./types";

export interface CheckContext {
  baseUrl: string;
  detection: Detection;
  /** Homepage response fetched once during detection, reused by header checks. */
  homepageHeaders: Headers;
  homepageBody: string;
}

export interface CheckDef {
  id: string;
  title: string;
  run: (ctx: CheckContext) => Promise<Omit<Check, "check" | "title">>;
}

const ok = (resultString = "safe"): Omit<Check, "check" | "title"> => ({
  result: "ok",
  riskRating: "low",
  resultString,
});

/** A path is "exposed" if it returns 200 and the body looks like the real file, not a themed 404/redirect to homepage. */
async function probeExposed(baseUrl: string, path: string, mustInclude?: RegExp) {
  const res = await fetchTarget(joinUrl(baseUrl, path));
  const exposed = res.ok && (!mustInclude || mustInclude.test(res.body));
  return { exposed, res };
}

export const checks: CheckDef[] = [
  {
    id: "security.magversion",
    title: "Magento version",
    run: async ({ detection }) =>
      assessVersion(detection.platform, detection.versionString, detection.edition),
  },
  {
    id: "security.sslcheck",
    title: "SSL / HTTPS",
    run: async ({ baseUrl }) => {
      const https = baseUrl.replace(/^http:/i, "https:");
      const res = await fetchTarget(https, { allowProxyFallback: false });
      if (res.error || res.status === 0) return { result: "fail", riskRating: "high", resultString: "no valid HTTPS", indicators: res.error };
      // Check http downgrades/redirects to https.
      const httpRes = await fetchTarget(baseUrl.replace(/^https:/i, "http:"), { allowProxyFallback: false, method: "HEAD" });
      const redirectsToHttps = httpRes.url.startsWith("https:");
      if (!redirectsToHttps) return { result: "fail", riskRating: "medium", resultString: "HTTP not redirected to HTTPS" };
      return ok("ok");
    },
  },
  {
    id: "security.securityheaders",
    title: "Security headers",
    run: async ({ homepageHeaders }) => {
      const missing: string[] = [];
      if (!homepageHeaders.has("strict-transport-security")) missing.push("HSTS");
      if (!homepageHeaders.has("content-security-policy")) missing.push("CSP");
      if (!homepageHeaders.has("x-content-type-options")) missing.push("X-Content-Type-Options");
      if (!homepageHeaders.has("x-frame-options") && !homepageHeaders.has("content-security-policy"))
        missing.push("X-Frame-Options");
      if (missing.length === 0) return ok("all present");
      return {
        result: "fail",
        riskRating: missing.includes("HSTS") || missing.includes("CSP") ? "medium" : "low",
        resultString: `missing: ${missing.join(", ")}`,
      };
    },
  },
  {
    id: "security.openversioncontrol",
    title: "Exposed version control",
    run: async ({ baseUrl }) => {
      const { exposed, res } = await probeExposed(baseUrl, ".git/config", /\[core\]|repositoryformatversion/i);
      if (exposed) return { result: "fail", riskRating: "high", resultString: "/.git/ is publicly readable", indicators: res.url };
      return ok();
    },
  },
  {
    id: "security.opendev",
    title: "Exposed config / dev files",
    run: async ({ baseUrl }) => {
      // .env and app/etc/env.php leak DB creds & the crypt key.
      const probes: Array<[string, RegExp]> = [
        [".env", /APP_KEY|DB_PASSWORD|MAGE_/i],
        ["app/etc/env.php", /'key'|'crypt'|'db'/i],
        ["app/etc/local.xml", /<config|<crypt|<key>/i], // Magento 1
      ];
      for (const [path, sig] of probes) {
        const { exposed, res } = await probeExposed(baseUrl, path, sig);
        if (exposed) return { result: "fail", riskRating: "high", resultString: `${path} is publicly readable`, indicators: res.url };
      }
      return ok();
    },
  },
  {
    id: "security.opendownloader",
    title: "Unprotected /downloader",
    run: async ({ baseUrl, detection }) => {
      if (detection.platform === "magento2") return ok("n/a (Magento 2)");
      const { exposed, res } = await probeExposed(baseUrl, "downloader/", /Magento Connect Manager|Downloader/i);
      if (exposed) return { result: "fail", riskRating: "high", resultString: "/downloader/ is reachable", indicators: res.url };
      return ok();
    },
  },
  {
    id: "security.openmagmi",
    title: "Unprotected Magmi",
    run: async ({ baseUrl }) => {
      const { exposed, res } = await probeExposed(baseUrl, "magmi/web/magmi.php", /magmi|Magento Mass Importer/i);
      if (exposed) return { result: "fail", riskRating: "high", resultString: "Magmi is publicly reachable", indicators: res.url };
      return ok();
    },
  },
  {
    id: "security.opensetup",
    title: "Exposed Setup Wizard",
    run: async ({ baseUrl, detection }) => {
      if (detection.platform !== "magento2") return ok("n/a");
      // The M2 setup wizard shell references /setup/pub/ assets — a themed 404
      // won't, so this avoids false positives on the generic "Magento" title.
      const { exposed, res } = await probeExposed(baseUrl, "setup/", /\/setup\/pub\//i);
      if (exposed) return { result: "fail", riskRating: "high", resultString: "/setup/ wizard is publicly reachable", indicators: res.url };
      return ok();
    },
  },
  {
    id: "security.exposedapi",
    title: "Exposed REST API",
    run: async ({ baseUrl, detection }) => {
      if (detection.platform !== "magento2") return ok("n/a");
      // An unauthenticated products list should be 401. 200 + items => exposed.
      const res = await fetchTarget(joinUrl(baseUrl, "rest/V1/products?searchCriteria[pageSize]=1"));
      if (res.status === 200 && /"items"\s*:\s*\[/.test(res.body) && !/message/.test(res.body.slice(0, 200))) {
        return { result: "fail", riskRating: "high", resultString: "product data readable without auth", indicators: res.url };
      }
      return ok("requires auth");
    },
  },
  {
    id: "security.composer",
    title: "Exposed composer files",
    run: async ({ baseUrl }) => {
      const { exposed, res } = await probeExposed(baseUrl, "composer.json", /"require"|magento\//i);
      if (exposed) return { result: "fail", riskRating: "medium", resultString: "composer.json is public (leaks package versions)", indicators: res.url };
      return ok();
    },
  },
  {
    id: "security.phpinfo",
    title: "Exposed phpinfo",
    run: async ({ baseUrl }) => {
      for (const path of ["phpinfo.php", "pub/phpinfo.php", "info.php"]) {
        const { exposed, res } = await probeExposed(baseUrl, path, /phpinfo\(\)|PHP Version/i);
        if (exposed) return { result: "fail", riskRating: "medium", resultString: `${path} exposes server config`, indicators: res.url };
      }
      return ok();
    },
  },
];
