/**
 * Magento fingerprinting. Confirms the target is Magento and works out
 * Magento 1 vs 2, edition, and (where possible) the version.
 *
 * Magento 2 exposes `/magento_version` which returns e.g.
 *   "Magento/2.4 (Community)"
 * When that's locked down we fall back to markers in the homepage HTML and
 * response headers. Exact version-from-static-asset-hash fingerprinting is a
 * later addition (needs a hash DB); see scan.md.
 */

import { fetchTarget, joinUrl, type FetchResult } from "./fetch";
import type { Detection, Platform } from "./types";

const M2_HTML_MARKERS = [
  "/static/version",
  "/static/frontend/",
  "Magento_",
  "data-mage-init",
  "mage/cookies",
  "require.config",
  "/pub/static/",
];

const M1_HTML_MARKERS = ["/skin/frontend/", "/js/mage/", "Mage.Cookies", "var BLANK_URL", "/media/catalog/"];

function editionFromVersionEndpoint(text: string): { platform: Platform; edition?: string; version?: string } | null {
  // "Magento/2.4 (Community)" or "Magento/2.4.6-p3 (Enterprise)"
  const m = text.match(/Magento\/([\d.]+(?:-p\d+)?)\s*\(([^)]+)\)/i);
  if (!m) return null;
  return { platform: "magento2", version: m[1], edition: m[2].trim() };
}

function scoreMarkers(html: string, markers: string[]): number {
  return markers.reduce((n, m) => (html.includes(m) ? n + 1 : n), 0);
}

export async function detect(baseUrl: string): Promise<{ detection: Detection; homepage: FetchResult }> {
  // Homepage (also gives us the canonical URL after redirects) + version endpoint.
  const [homepage, versionRes] = await Promise.all([
    fetchTarget(baseUrl),
    fetchTarget(joinUrl(baseUrl, "magento_version")),
  ]);

  const canonicalUrl = homepage.url || baseUrl;
  const html = homepage.body || "";

  let platform: Platform = "unknown";
  let edition: string | undefined;
  let versionString: string | undefined;

  // 1. Strongest signal: the version endpoint.
  if (versionRes.ok && /magento/i.test(versionRes.body)) {
    const parsed = editionFromVersionEndpoint(versionRes.body);
    if (parsed) {
      platform = parsed.platform;
      edition = parsed.edition;
      versionString = parsed.version;
    } else {
      platform = "magento2";
    }
  }

  // 2. Fall back to HTML/header markers.
  const m2 = scoreMarkers(html, M2_HTML_MARKERS);
  const m1 = scoreMarkers(html, M1_HTML_MARKERS);
  const headerHint =
    homepage.headers.has("x-magento-vary") ||
    (homepage.headers.get("set-cookie") ?? "").includes("X-Magento") ||
    (homepage.headers.get("set-cookie") ?? "").includes("mage-");

  if (platform === "unknown") {
    if (m2 >= 2 || headerHint) platform = "magento2";
    else if (m1 >= 2) platform = "magento1";
  }

  const isMagento = platform !== "unknown";
  const isHyva = /\/static\/frontend\/[^"']*[Hh]yva/.test(html) || html.includes("hyva");

  if (!edition && isMagento) edition = platform === "magento2" ? "Community" : undefined;

  return {
    detection: { isMagento, platform, edition, versionString, canonicalUrl, isHyva },
    homepage,
  };
}
