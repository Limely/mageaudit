"use client";

import type { Check, CheckResult, RiskRating } from "@/lib/scanner/types";
import { CheckIcon } from "./ui";

type Summary = { total: number; high: number; medium: number; ok: number; overall: RiskRating };

/** Worst-first ordering so issues bubble to the top. */
const rank: Record<RiskRating, number> = { high: 0, medium: 1, unknown: 2, low: 3 };

const severityLabel: Record<RiskRating, string> = {
  high: "High risk",
  medium: "Medium risk",
  low: "Passed",
  unknown: "Needs review",
};
const severityText: Record<RiskRating, string> = {
  high: "text-red-600",
  medium: "text-amber-600",
  low: "text-emerald-600",
  unknown: "text-gray-400",
};
const nodeStyle: Record<RiskRating, string> = {
  high: "bg-red-500 text-white",
  medium: "bg-amber-500 text-white",
  low: "bg-emerald-500 text-white",
  unknown: "bg-white border-2 border-gray-300 text-gray-400",
};
const barTone: Record<RiskRating, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
  unknown: "bg-gray-400",
};

function NodeIcon({ rating, result }: { rating: RiskRating; result: CheckResult }) {
  if (result === "ok") return <CheckIcon className="w-3.5 h-3.5" />;
  if (rating === "unknown" || result === "unknown")
    return <span className="w-1.5 h-1.5 rounded-full bg-current" />;
  // fail (high/medium): exclamation
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v5m0 3h.01" />
    </svg>
  );
}

function CheckRow({ check, last }: { check: Check; last: boolean }) {
  const r = check.riskRating;
  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {/* Connector line */}
      {!last && <span className="absolute left-[13px] top-7 bottom-0 w-px bg-gray-200" aria-hidden />}
      {/* Status node */}
      <span
        className={`relative z-10 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${nodeStyle[r]}`}
      >
        <NodeIcon rating={r} result={check.result} />
      </span>
      {/* Body */}
      <div className="min-w-0 flex-1 pt-0.5">
        <p className={`text-[11px] font-semibold uppercase tracking-wide ${severityText[r]}`}>{severityLabel[r]}</p>
        <h4 className="text-sm font-semibold text-gray-900 mt-0.5">{check.title}</h4>
        <p className="text-sm text-gray-500 mt-0.5 break-words">{check.resultString}</p>
        {check.indicators && (
          <p className="text-[11px] text-gray-400 mt-1 font-mono break-all">{check.indicators}</p>
        )}
      </div>
    </li>
  );
}

export default function SecurityChecks({
  checks,
  summary,
  scanning,
}: {
  checks: Check[];
  summary?: Summary;
  scanning: boolean;
}) {
  const sorted = [...checks].sort((a, b) => rank[a.riskRating] - rank[b.riskRating]);
  const total = summary?.total ?? checks.length;
  const passed = summary?.ok ?? checks.filter((c) => c.result === "ok").length;
  const pct = total > 0 ? Math.round((passed / total) * 100) : 0;
  const overall: RiskRating = summary?.overall ?? "unknown";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 ring-1 ring-gray-900/5 overflow-hidden">
      {/* Header + progress */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-sm font-bold text-gray-900">Security &amp; health checks</h3>
          <span className="text-xs text-gray-400 flex items-center gap-2">
            {scanning && (
              <svg className="w-3.5 h-3.5 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            <span>
              <span className="font-semibold text-gray-700">{passed}</span> of {total} passed
            </span>
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barTone[overall]}`}
            style={{ width: `${scanning && total === 0 ? 8 : pct}%` }}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="px-6 py-5">
        {sorted.length === 0 && scanning ? (
          <p className="text-sm text-gray-400 text-center py-6">Fingerprinting the store…</p>
        ) : (
          <ul>
            {sorted.map((c, i) => (
              <CheckRow key={c.check} check={c} last={i === sorted.length - 1} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
