"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { bareDomain } from "@/lib/domain";
import { ArrowIcon } from "./ui";

/**
 * Hero scan form. Submitting navigates to the per-store report page
 * (/scan/<domain>), which runs the scan and persists the result — see
 * components/StoreReport.tsx and scan.md.
 */
export default function ScanForm() {
  const [url, setUrl] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed || pending) return;
    const domain = bareDomain(trimmed);
    if (!domain.includes(".")) return;
    setPending(true);
    router.push(`/scan/${encodeURIComponent(domain)}`);
  }

  return (
    <form id="scan-form" onSubmit={handleSubmit} className="mt-10 max-w-xl mx-auto">
      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        <div className="flex-1 relative">
          <svg
            className="w-4 h-4 text-gray-400 absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <input
            type="text"
            inputMode="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={pending}
            required
            placeholder="yourstore.com"
            className="w-full h-full bg-white border border-gray-200 rounded-full pl-12 pr-5 py-3.5 text-base text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all disabled:opacity-60"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="bg-gray-900 text-white px-7 py-3.5 rounded-full hover:bg-gray-700 font-semibold text-base shadow-lg shadow-black/15 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20 cursor-pointer disabled:opacity-70 disabled:hover:translate-y-0 flex-shrink-0 flex items-center justify-center gap-2"
        >
          {pending ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Opening&hellip;
            </span>
          ) : (
            <span>
              Scan my store <ArrowIcon className="inline-block w-4 h-4 ml-1 -mr-1" />
            </span>
          )}
        </button>
      </div>
    </form>
  );
}
