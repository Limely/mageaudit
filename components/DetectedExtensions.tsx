"use client";

/**
 * Detected extensions/modules from the Limely enrichment. Its own section
 * because it's the security-relevant slice of the store profile — and the
 * anchor for extension-vulnerability matching (each module will carry a
 * vuln-status badge once that dataset lands; see scan.md roadmap).
 *
 * Note: this is the publicly-detectable subset (from frontend assets), not a
 * complete backend module inventory.
 */
export default function DetectedExtensions({ modules }: { modules?: string[] }) {
  if (!modules || modules.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 ring-1 ring-gray-900/5 overflow-hidden">
      <div className="px-6 pt-5 pb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-gray-900">Detected extensions</h3>
        <span className="text-xs text-gray-400">
          <span className="font-semibold text-gray-700">{modules.length}</span> found
        </span>
      </div>
      <div className="px-6 pb-5">
        <div className="flex flex-wrap gap-2">
          {modules.map((m) => (
            <span
              key={m}
              className="text-xs font-mono bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-gray-600"
            >
              {m}
            </span>
          ))}
        </div>
        <p className="text-[11px] text-gray-400 mt-3">
          Publicly detectable modules only — not a complete inventory.
        </p>
      </div>
    </div>
  );
}
