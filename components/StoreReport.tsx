"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useScan, type ScanState } from "@/lib/useScan";
import type { RiskRating } from "@/lib/scanner/types";
import type { StoredReport } from "@/lib/scanner/store";
import ScanResults from "./ScanResults";

/** Turn a persisted report back into the ScanState shape ScanResults renders. */
function toScanState(r: StoredReport): ScanState {
  return {
    status: "done",
    meta: { type: "meta", ...r.meta },
    checks: r.checks,
    enrichment: r.enrichment,
    summary: r.summary,
  };
}

function relativeTime(iso: string): string {
  const secs = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 90) return "just now";
  const mins = secs / 60;
  if (mins < 90) return `${Math.round(mins)} min ago`;
  const hrs = mins / 60;
  if (hrs < 36) return `${Math.round(hrs)} hr ago`;
  return `${Math.round(hrs / 24)} days ago`;
}

const badgeTone: Record<RiskRating, string> = {
  low: "bg-emerald-100 text-emerald-700 border-emerald-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  high: "bg-red-100 text-red-700 border-red-200",
  unknown: "bg-gray-100 text-gray-500 border-gray-200",
};
const badgeLabel: Record<RiskRating, string> = {
  low: "Healthy",
  medium: "Medium risk",
  high: "High risk",
  unknown: "No verdict",
};

/**
 * Full-page per-store report. Shows the stored report instantly (server-loaded)
 * or auto-runs a live scan on first visit. A re-scan button streams a fresh
 * scan; the API persists it as a side effect.
 */
export default function StoreReport({
  domain,
  initialReport,
}: {
  domain: string;
  initialReport: StoredReport | null;
}) {
  const router = useRouter();
  const { state, scan } = useScan();

  // First visit with nothing cached: kick off a live scan automatically.
  useEffect(() => {
    if (!initialReport) scan(domain);
  }, [domain, initialReport, scan]);

  // Live scan takes precedence once started; otherwise show the stored report.
  const live = state.status !== "idle";
  const display: ScanState = live
    ? state
    : initialReport
      ? toScanState(initialReport)
      : { status: "scanning", checks: [] };

  const busy = display.status === "scanning";
  const overall = display.summary?.overall;
  const scannedLabel = live
    ? busy
      ? "Scanning now…"
      : "Scanned just now"
    : initialReport
      ? `Last scanned ${relativeTime(initialReport.scannedAt)}`
      : "";

  return (
    <div className="max-w-3xl mx-auto">
      {/* Report header */}
      <header className="mb-8">
        <Link href="/" className="text-xs text-gray-400 hover:text-gray-700 font-medium">
          &larr; New scan
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Magento health report</p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight break-words">{domain}</h1>
            <p className="text-sm text-gray-500 mt-2">{scannedLabel}</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {overall && !busy && (
              <span className={`text-xs border px-3 py-1.5 rounded-full font-semibold uppercase ${badgeTone[overall]}`}>
                {badgeLabel[overall]}
              </span>
            )}
            <button
              onClick={() => scan(domain)}
              disabled={busy}
              className="text-sm bg-gray-900 text-white px-5 py-2.5 rounded-full hover:bg-gray-700 font-medium transition-colors disabled:opacity-60"
            >
              {busy ? "Scanning…" : "Re-scan"}
            </button>
          </div>
        </div>
      </header>

      <ScanResults state={display} onReset={() => router.push("/")} />
    </div>
  );
}
