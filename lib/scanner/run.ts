/**
 * Scan orchestrator. Detects the platform, then fans out every check
 * concurrently and emits each result the moment it settles (out of order,
 * like MageReport's streaming) alongside the Limely enrichment. Finishes with
 * a rollup summary.
 *
 * `emit` is the transport seam: the route handler passes a callback that
 * writes each message to the HTTP stream.
 */

import { detect } from "./detect";
import { enrich } from "./limely";
import { checks, type CheckContext } from "./checks";
import type { Check, RiskRating, ScanMessage } from "./types";

/** Normalise user input into an absolute origin URL. */
export function normaliseUrl(input: string): string | null {
  let s = (input || "").trim();
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  try {
    const u = new URL(s);
    if (!u.hostname.includes(".")) return null;
    return u.origin + "/";
  } catch {
    return null;
  }
}

const PER_CHECK_TIMEOUT_MS = 20_000;

function withTimeout<T>(p: Promise<T>, ms: number, onTimeout: () => T): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((resolve) => setTimeout(() => resolve(onTimeout()), ms)),
  ]);
}

function rollup(results: Check[]): { total: number; high: number; medium: number; ok: number; overall: RiskRating } {
  const high = results.filter((r) => r.riskRating === "high").length;
  const medium = results.filter((r) => r.riskRating === "medium").length;
  const okCount = results.filter((r) => r.result === "ok").length;
  const overall: RiskRating = high > 0 ? "high" : medium > 0 ? "medium" : "low";
  return { total: results.length, high, medium, ok: okCount, overall };
}

export async function runScan(inputUrl: string, emit: (m: ScanMessage) => void): Promise<void> {
  const baseUrl = normaliseUrl(inputUrl);
  if (!baseUrl) {
    emit({ type: "error", message: "Please enter a valid store URL.", code: "bad_url" });
    return;
  }

  // 1. Fingerprint.
  let detection, homepage;
  try {
    ({ detection, homepage } = await detect(baseUrl));
  } catch {
    emit({ type: "error", message: "Could not reach the store.", code: "unreachable" });
    return;
  }

  if (!detection.isMagento) {
    if (homepage.blocked) {
      emit({
        type: "error",
        message: "The store is behind a firewall/CDN that blocked the scan. A proxy fetch is needed for this site.",
        code: "blocked",
      });
    } else {
      emit({ type: "error", message: "No Magento installation found at this URL.", code: "not_magento" });
    }
    return;
  }

  emit({
    type: "meta",
    canonicalUrl: detection.canonicalUrl,
    platform: detection.platform,
    edition: detection.edition,
    versionString: detection.versionString,
  });

  const ctx: CheckContext = {
    baseUrl: detection.canonicalUrl,
    detection,
    homepageHeaders: homepage.headers,
    homepageBody: homepage.body,
  };

  const collected: Check[] = [];

  // 2. Enrichment (Limely) + all checks run concurrently; stream as they land.
  const enrichmentTask = enrich(detection.canonicalUrl)
    .then((data) => emit({ type: "enrichment", data }))
    .catch(() => {});

  const checkTasks = checks.map((def) =>
    withTimeout(
      def.run(ctx).catch(() => ({ result: "unknown" as const, riskRating: "unknown" as const, resultString: "check failed" })),
      PER_CHECK_TIMEOUT_MS,
      () => ({ result: "unknown" as const, riskRating: "unknown" as const, resultString: "timed out" }),
    ).then((partial) => {
      const full: Check = { check: def.id, title: def.title, ...partial };
      collected.push(full);
      emit({ type: "result", data: full });
    }),
  );

  await Promise.allSettled([enrichmentTask, ...checkTasks]);

  // 3. Summary.
  emit({ type: "done", summary: rollup(collected) });
}
