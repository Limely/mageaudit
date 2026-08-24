/**
 * Shared types for the scan engine.
 *
 * The scan streams newline-delimited JSON (NDJSON) messages to the client,
 * one object per line. `ScanMessage` is the union of everything that can be
 * emitted. Modelled on how MageReport streams per-check results, but over a
 * plain chunked HTTP response instead of a WebSocket (simpler on serverless).
 */

/** Traffic-light severity, ordered low -> high. */
export type RiskRating = "low" | "medium" | "high" | "unknown";

/** Pass/fail state of a single check. */
export type CheckResult = "ok" | "fail" | "unknown";

/** A single completed check, mirroring MageReport's per-check payload. */
export interface Check {
  /** Namespaced id, e.g. "security.openversioncontrol". */
  check: string;
  /** Human-readable title for the UI. */
  title: string;
  result: CheckResult;
  riskRating: RiskRating;
  /** Short one-line verdict, e.g. "safe" or "/.git/ is public". */
  resultString: string;
  /** Optional evidence (URL probed, header value, matched string). */
  indicators?: string;
}

export type Platform = "magento1" | "magento2" | "unknown";

/** What the fingerprint step figured out about the store. */
export interface Detection {
  isMagento: boolean;
  platform: Platform;
  edition?: string; // "Community" | "Enterprise" | "Adobe Commerce"
  versionString?: string; // e.g. "2.4.6-p3" or a range
  canonicalUrl: string; // resolved URL after redirects
  isHyva?: boolean;
}

/** Business/stack enrichment pulled from the Limely API. */
export interface Enrichment {
  themeName?: string;
  themeVendor?: string;
  parentTheme?: string;
  isHyva?: boolean;
  edition?: string;
  reviewPlatform?: string;
  financeCompany?: string;
  products?: number | null;
  categories?: number | null;
  pages?: number | null;
  modules?: string[];
  company?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  source: "cache" | "live" | "miss";
}

export type ScanMessage =
  | { type: "meta"; canonicalUrl: string; platform: Platform; edition?: string; versionString?: string }
  | { type: "result"; data: Check }
  | { type: "enrichment"; data: Enrichment }
  | { type: "done"; summary: { total: number; high: number; medium: number; ok: number; overall: RiskRating } }
  | { type: "error"; message: string; code?: string };
