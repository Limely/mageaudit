/**
 * Enrichment via Limely's Magento store-intelligence API. This is the
 * discovery/business layer — theme, vendor, Hyvä flag, edition, detected
 * modules, company details — that sits alongside the security probes.
 *
 * It is NOT a security source (no version/patch/malware data), and the live
 * scrape is slow (~2min), so we only read the fast cached endpoint during a
 * scan. See scan.md.
 */

import { bareDomain } from "@/lib/domain";
import type { Enrichment } from "./types";

interface LimelyTheme {
  theme_name?: string;
  theme_vendor?: string;
  parent_theme?: string;
  is_hyva?: boolean;
  edition?: string;
  review_platform?: string;
  finance_company?: string;
  products?: number | null;
  categories?: number | null;
  pages?: number | null;
  modules?: string[];
  emails?: string[];
  company_details?: {
    "@graph"?: Array<{
      name?: string;
      email?: string;
      address?: { streetAddress?: string; addressLocality?: string; postalCode?: string };
      contactPoint?: { telephone?: string };
    }>;
  };
}

function mapTheme(theme: LimelyTheme, source: Enrichment["source"]): Enrichment {
  const org = theme.company_details?.["@graph"]?.find((g) => g.name);
  const addr = org?.address;
  return {
    themeName: theme.theme_name,
    themeVendor: theme.theme_vendor,
    parentTheme: theme.parent_theme,
    isHyva: theme.is_hyva,
    edition: theme.edition,
    reviewPlatform: theme.review_platform || undefined,
    financeCompany: theme.finance_company || undefined,
    products: theme.products ?? null,
    categories: theme.categories ?? null,
    pages: theme.pages ?? null,
    modules: theme.modules ?? [],
    company: org
      ? {
          name: org.name,
          email: org.email || theme.emails?.[0],
          phone: org.contactPoint?.telephone,
          address: [addr?.streetAddress, addr?.addressLocality, addr?.postalCode].filter(Boolean).join(", ") || undefined,
        }
      : undefined,
    source,
  };
}

/** Look up cached store intelligence. Returns a `miss` marker on any failure. */
export async function enrich(domain: string): Promise<Enrichment> {
  const base = process.env.LIMELY_API_BASE;
  const key = process.env.LIMELY_API_KEY;
  const miss: Enrichment = { source: "miss", modules: [] };
  if (!base || !key) return miss;

  try {
    const res = await fetch(`${base}/api/magento/site/get/${encodeURIComponent(bareDomain(domain))}`, {
      headers: { apikey: key },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return miss;
    const json = (await res.json()) as { success?: boolean; result?: { theme?: LimelyTheme } };
    if (!json.success || !json.result?.theme) return miss;
    return mapTheme(json.result.theme, "cache");
  } catch {
    return miss;
  }
}
