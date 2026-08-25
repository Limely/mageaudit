"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useScan, type ScanState } from "@/lib/useScan";
import type { RiskRating } from "@/lib/scanner/types";
import type { StoredReport } from "@/lib/scanner/store";
import SecurityChecks from "./SecurityChecks";
import StoreDetails from "./StoreDetails";
import DetectedExtensions from "./DetectedExtensions";

/** Turn a persisted report back into the ScanState shape the UI renders. */
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
  const errored = display.status === "error";
  const overall = display.summary?.overall;
  const scannedLabel = errored
    ? ""
    : busy
      ? "Scanning now…"
      : live
        ? "Scanned just now"
        : initialReport
          ? `Last scanned ${relativeTime(initialReport.scannedAt)}`
          : "";

  return (
    <div className="max-w-5xl mx-auto px-6">
      {/* Report header */}
      <header className="mb-8">
        <Link href="/" className="text-xs text-gray-400 hover:text-gray-700 font-medium">
          &larr; New scan
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Magento health report</p>
            <div className="flex items-center gap-3 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element -- external favicon service, not worth next/image config */}
              <img
                src={`https://geticon.dev/?url=${encodeURIComponent(domain)}`}
                width={52}
                height={52}
                alt=""
                className="w-16 h-16 p-1.5 rounded-2xl border border-gray-200 bg-white flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight break-words min-w-0">{domain}</h1>
            </div>
            {scannedLabel && <p className="text-sm text-gray-500 mt-2">{scannedLabel}</p>}
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

      {errored ? (
        <div className="bg-white border border-red-200 rounded-2xl px-6 py-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <span className="text-sm font-semibold text-gray-900">Couldn&rsquo;t scan that store</span>
          </div>
          <p className="text-sm text-gray-500">{display.error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <StoreDetails enrichment={display.enrichment} />
          <DetectedExtensions modules={display.enrichment?.modules} />
          <SecurityChecks checks={display.checks} summary={display.summary} scanning={busy} />
        </div>
      )}
    </div>
  );
}
