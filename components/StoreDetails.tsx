"use client";

import type { Enrichment } from "@/lib/scanner/types";

/**
 * Store-intelligence panel — surfaces the Limely enrichment (stack, catalogue
 * size, detected modules, company details) that the scan already fetches.
 * Renders nothing when there's no cached data for the store.
 */
export default function StoreDetails({ enrichment }: { enrichment?: Enrichment }) {
  if (!enrichment || enrichment.source === "miss") return null;
  const e = enrichment;

  const counts = [
    { label: "Products", value: e.products },
    { label: "Categories", value: e.categories },
    { label: "Pages", value: e.pages },
  ].filter((c): c is { label: string; value: number } => typeof c.value === "number");

  const stack = [
    e.themeName && `${e.themeName}${e.isHyva ? " · Hyvä" : ""}`,
    e.themeVendor && `by ${e.themeVendor}`,
    e.edition,
  ].filter(Boolean) as string[];

  const platforms = [
    e.reviewPlatform && `Reviews: ${e.reviewPlatform}`,
    e.financeCompany && `Finance: ${e.financeCompany}`,
  ].filter(Boolean) as string[];

  const company = e.company;
  const hasCompany = company && (company.name || company.email || company.phone || company.address);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 ring-1 ring-gray-900/5 overflow-hidden mb-6">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Store details</span>
        <span className="text-[10px] text-gray-400">
          via Limely{e.source === "cache" ? " (cached)" : e.source === "live" ? " (live)" : ""}
        </span>
      </div>

      {counts.length > 0 && (
        <div className={`grid ${["", "grid-cols-1", "grid-cols-2", "grid-cols-3"][counts.length]} divide-x divide-gray-100 border-b border-gray-100`}>
          {counts.map(({ label, value }) => (
            <div key={label} className="px-4 py-3 text-center">
              <div className="text-lg font-bold text-gray-900">{value.toLocaleString()}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</div>
            </div>
          ))}
        </div>
      )}

      <dl className="px-5 py-4 space-y-2.5 text-sm">
        {stack.length > 0 && <Row label="Theme">{stack.join(" ")}</Row>}
        {platforms.length > 0 && <Row label="Integrations">{platforms.join(" · ")}</Row>}
        {hasCompany && (
          <div className="pt-1 border-t border-gray-100 mt-1 space-y-2.5">
            {company!.name && <Row label="Company">{company!.name}</Row>}
            {company!.email && <Row label="Email">{company!.email}</Row>}
            {company!.phone && <Row label="Phone">{company!.phone}</Row>}
            {company!.address && <Row label="Address">{company!.address}</Row>}
          </div>
        )}
      </dl>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-xs text-gray-400 flex-shrink-0 pt-0.5">{label}</dt>
      <dd className="text-gray-800 text-right break-words">{children}</dd>
    </div>
  );
}
