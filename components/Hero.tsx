import { site } from "@/lib/site";
import PlatformBadge from "./PlatformBadge";
import ScanForm from "./ScanForm";
import { CheckIcon } from "./ui";

const reportRows = [
  {
    tag: "speed",
    title: "Core Web Vitals",
    detail: "LCP 1.9s · CLS 0.02 · INP 140ms",
    pass: true,
  },
  {
    tag: "theme",
    title: "Hyvä 1.3 detected",
    detail: "child theme, Tailwind purged",
    pass: true,
  },
  {
    tag: "security",
    title: "2 vulnerabilities found",
    detail: "outdated module, exposed endpoint",
    pass: false,
  },
  {
    tag: "seo",
    title: "SEO & best practice",
    detail: "meta, schema, canonicals",
    pass: true,
  },
];

const recentScans = [
  { domain: "yourstore.com", score: 87, tone: "bg-emerald-100 text-emerald-700", active: true },
  { domain: "staging.yourstore.com", score: 64, tone: "bg-amber-100 text-amber-700", active: false },
  { domain: "clientstore.co.uk", score: 41, tone: "bg-red-100 text-red-700", active: false },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-16" id="scan">
      {/* Warm cream fading to white at bottom */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, #FAF3EF 0%, #FAF3EF 20%, white 60%)" }}
      />
      {/* Dot grid over gradient */}
      <div className="hero-grid absolute inset-0 opacity-[0.07]" />

      <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
        <p className="text-sm text-gray-500 font-medium mb-4">Finally, a proper health check for Magento.</p>

        <PlatformBadge />

        <h1 className="text-4xl sm:text-6xl md:text-[4.25rem] font-extrabold text-gray-900 leading-[1.05] tracking-tight">
          Scan, score &amp; fix
          <br />
          <span className="text-gray-900">your Magento store</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-500 mt-7 max-w-2xl mx-auto leading-relaxed font-normal">
          Enter your store URL and get a full health report — page speed, theme detection, extension audit,
          security vulnerabilities and SEO — in under a minute.
        </p>

        <ScanForm />
        <p className="text-xs text-gray-400 mt-4">Free to use. No install required. No credit card.</p>
      </div>

      {/* Hero UI mockup */}
      <div className="relative max-w-5xl mx-auto px-6 pb-0">
        <div className="rounded-2xl overflow-hidden shadow-2xl shadow-gray-200/80 border border-gray-200/80 ring-1 ring-gray-900/5 relative">
          {/* Scan sweep line */}
          <div className="scanline absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-900/30 to-transparent z-10 pointer-events-none" />
          {/* Browser chrome */}
          <div className="bg-gray-100 border-b border-gray-200 px-5 py-3 flex items-center gap-3">
            <div className="flex gap-1.5 flex-shrink-0">
              <div className="w-3 h-3 rounded-full bg-gray-300" />
              <div className="w-3 h-3 rounded-full bg-gray-300" />
              <div className="w-3 h-3 rounded-full bg-gray-300" />
            </div>
            <div className="flex-1 bg-white border border-gray-200 rounded-md px-3 py-1.5 text-xs text-gray-400 max-w-xs mx-auto text-center shadow-sm">
              {site.appSubdomain}
            </div>
          </div>
          {/* Report content */}
          <div className="bg-white p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Sidebar */}
            <div className="hidden md:block">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-3">
                Recent Scans
              </div>
              {recentScans.map(({ domain, score, tone, active }) => (
                <div
                  key={domain}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg mb-1 ${
                    active ? "bg-brand-50 border border-brand-100" : "hover:bg-gray-50 cursor-pointer"
                  }`}
                >
                  <span className={`text-xs ${active ? "text-brand-700 font-medium" : "text-gray-500"}`}>
                    {domain}
                  </span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${tone}`}>{score}</span>
                </div>
              ))}
            </div>
            {/* Main panel */}
            <div className="md:col-span-2 space-y-2.5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-semibold text-gray-900">yourstore.com</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">42 checks &middot; Scanned 2 minutes ago</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold">
                    Score 87/100
                  </span>
                  <button className="text-[10px] bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm">
                    Re-scan
                  </button>
                </div>
              </div>
              {reportRows.map(({ tag, title, detail, pass }) => (
                <div key={tag} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                  <span className="text-[9px] bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-mono flex-shrink-0 shadow-sm">
                    {tag}
                  </span>
                  <span className="text-xs text-gray-800 flex-1 font-medium">{title}</span>
                  <span className="text-[10px] text-gray-400 hidden sm:block">{detail}</span>
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                      pass ? "bg-emerald-100" : "bg-red-100"
                    }`}
                  >
                    {pass ? (
                      <CheckIcon className="w-2.5 h-2.5 text-emerald-600" />
                    ) : (
                      <svg className="w-2.5 h-2.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Fade to white */}
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </div>
    </section>
  );
}
