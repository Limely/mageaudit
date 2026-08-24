"use client";

import type { Check, CheckResult, RiskRating } from "@/lib/scanner/types";
import type { ScanState } from "@/lib/useScan";

const resultTone: Record<CheckResult, { dot: string; label: string; labelTone: string }> = {
  ok: { dot: "bg-emerald-400", label: "Pass", labelTone: "bg-emerald-100 text-emerald-700" },
  fail: { dot: "bg-red-400", label: "Fail", labelTone: "bg-red-100 text-red-700" },
  unknown: { dot: "bg-gray-300", label: "Unknown", labelTone: "bg-gray-100 text-gray-500" },
};

const overallTone: Record<RiskRating, string> = {
  low: "bg-emerald-100 text-emerald-700 border-emerald-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  high: "bg-red-100 text-red-700 border-red-200",
  unknown: "bg-gray-100 text-gray-500 border-gray-200",
};

function CheckRow({ check }: { check: Check }) {
  const tone = resultTone[check.result];
  return (
    <div className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 text-left">
      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${tone.dot}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-800">{check.title}</span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${tone.labelTone}`}>{tone.label}</span>
        </div>
        <p className="text-[11px] text-gray-500 mt-0.5 break-words">{check.resultString}</p>
        {check.indicators && (
          <p className="text-[10px] text-gray-400 mt-0.5 font-mono break-all">{check.indicators}</p>
        )}
      </div>
    </div>
  );
}

export default function ScanResults({ state, onReset }: { state: ScanState; onReset: () => void }) {
  if (state.status === "idle") return null;

  if (state.status === "error") {
    return (
      <div className="mt-8 max-w-2xl mx-auto text-left">
        <div className="bg-white border border-red-200 rounded-2xl px-5 py-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <span className="text-sm font-semibold text-gray-900">Couldn&rsquo;t scan that store</span>
          </div>
          <p className="text-sm text-gray-500">{state.error}</p>
          <button
            onClick={onReset}
            className="mt-3 text-xs bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-700 font-medium transition-colors"
          >
            Try another store
          </button>
        </div>
      </div>
    );
  }

  const { meta, checks, summary, enrichment } = state;
  const scanning = state.status === "scanning";
  const stackParts = [
    meta?.edition,
    meta?.versionString,
    enrichment?.themeName && `${enrichment.themeName}${enrichment.isHyva ? " (Hyvä)" : ""}`,
  ].filter(Boolean);

  return (
    <div className="mt-8 max-w-2xl mx-auto text-left">
      <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/70 border border-gray-200/80 ring-1 ring-gray-900/5 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">
              {meta?.canonicalUrl ?? "Scanning…"}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              {scanning
                ? `${checks.length} checks so far…`
                : `${summary?.total ?? checks.length} checks`}
              {stackParts.length > 0 && <> &middot; {stackParts.join(" · ")}</>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {scanning ? (
              <span className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                <svg className="w-3.5 h-3.5 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Scanning
              </span>
            ) : (
              summary && (
                <span className={`text-[10px] border px-2.5 py-1 rounded-full font-semibold uppercase ${overallTone[summary.overall]}`}>
                  {summary.overall === "low" ? "Healthy" : summary.overall === "unknown" ? "No verdict" : `${summary.overall} risk`}
                </span>
              )
            )}
          </div>
        </div>

        {/* Summary counts */}
        {summary && (
          <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
            {[
              { n: summary.high, label: "High risk", tone: "text-red-600" },
              { n: summary.medium, label: "Medium", tone: "text-amber-600" },
              { n: summary.ok, label: "Passed", tone: "text-emerald-600" },
            ].map(({ n, label, tone }) => (
              <div key={label} className="px-4 py-3 text-center">
                <div className={`text-lg font-bold ${tone}`}>{n}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Check rows */}
        <div className="p-4 space-y-2">
          {checks.length === 0 && scanning && (
            <p className="text-sm text-gray-400 text-center py-6">Fingerprinting the store…</p>
          )}
          {checks.map((c) => (
            <CheckRow key={c.check} check={c} />
          ))}
        </div>

        {/* Footer */}
        {!scanning && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">
              {enrichment?.company?.name ? `Store: ${enrichment.company.name}` : "Scan complete"}
            </span>
            <button
              onClick={onReset}
              className="text-xs bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-700 font-medium transition-colors"
            >
              Scan another store
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
