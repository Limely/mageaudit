import { CheckListItem, ExpandingCta, OutlineIcon } from "./ui";

const smallFeatures = [
  {
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    title: "Nothing to install",
    desc: "No module, no admin access, no agency onboarding. Paste a URL and get results in under a minute.",
  },
  {
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    title: "Safe & non-intrusive",
    desc: "Read-only checks against publicly visible pages. No exploit attempts, no load on your store, no data stored.",
  },
  {
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    title: "Scheduled re-scans",
    desc: "Set a weekly or monthly scan and get an email when your score changes or a new vulnerability appears.",
  },
  {
    icon: "M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z",
    title: "Shareable reports",
    desc: "Every report has a link. Share it with your developer, agency or boss — no login needed to view.",
  },
  {
    icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064",
    title: "Multi-store ready",
    desc: "Track every store you manage from one dashboard. Built for agencies keeping an eye on several clients.",
  },
  {
    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    title: "Built with love",
    desc: "Made by a Magento agency who needed this tool. We run it on our own stores, every week.",
  },
];

export default function Features() {
  return (
    <section className="bg-gray-50 py-6 border-t border-gray-100" id="features">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center py-20">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Scan it. Score it. Fix it.</h2>
        </div>

        {/* Feature 1: Speed */}
        <div className="group rounded-3xl overflow-hidden border border-gray-200 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="bg-white p-10 flex flex-col justify-between min-h-[320px]">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Speed</p>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-5 tracking-tight leading-snug">
                  Find out why
                  <br />
                  your store feels slow
                </h3>
                <ul className="space-y-2.5">
                  <CheckListItem>Core Web Vitals measured on real pages</CheckListItem>
                  <CheckListItem>FPC, Varnish and Redis configuration checks</CheckListItem>
                  <CheckListItem>Oversized images, render-blocking JS flagged</CheckListItem>
                </ul>
              </div>
              <div className="mt-8">
                <ExpandingCta href="#scan" label="Scan your store free" />
              </div>
            </div>
            <div className="bg-gray-50 p-8 flex items-center justify-center overflow-hidden border-t md:border-t-0 md:border-l border-gray-200">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden w-full">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-gray-700">Core Web Vitals</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">Homepage &middot; mobile</div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold">
                    92
                  </span>
                </div>
                <div className="p-5 space-y-4">
                  {[
                    { label: "LCP", value: "1.9s", width: "78%", tone: "emerald" },
                    { label: "CLS", value: "0.02", width: "92%", tone: "emerald" },
                    { label: "INP", value: "240ms", width: "55%", tone: "amber" },
                  ].map(({ label, value, width, tone }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-semibold text-gray-500">{label}</span>
                        <span className={`text-[11px] font-semibold ${tone === "emerald" ? "text-emerald-600" : "text-amber-600"}`}>
                          {value}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${tone === "emerald" ? "bg-emerald-400" : "bg-amber-400"}`}
                          style={{ width }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="text-[11px] text-gray-600 font-medium">3 render-blocking scripts found</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features 2 + 3: side-by-side portrait cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Feature 2: Theme */}
          <div className="group rounded-3xl overflow-hidden border border-gray-200 shadow-sm flex flex-col">
            <div className="bg-white p-8 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Theme</p>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight leading-snug">
                  Know exactly what&rsquo;s running
                </h3>
                <ul className="space-y-2">
                  <CheckListItem>Detects Hyvä, Luma and custom themes</CheckListItem>
                  <CheckListItem>Magento version fingerprinting</CheckListItem>
                  <CheckListItem>Page Builder and widget usage spotted</CheckListItem>
                </ul>
              </div>
              <div className="mt-6">
                <ExpandingCta href="#scan" label="Scan your store free" />
              </div>
            </div>
            <div className="bg-gray-50 p-6 flex items-center justify-center overflow-hidden flex-1 border-t border-gray-200">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden w-full">
                <div className="bg-gray-900 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-semibold text-white">Stack Detected</span>
                  </div>
                  <div className="bg-white/10 text-white text-[10px] px-2.5 py-1 rounded font-medium">98% confidence</div>
                </div>
                <div className="p-4 space-y-2 bg-white">
                  {[
                    { label: "Theme", value: "Hyvä 1.3 (child theme)" },
                    { label: "Magento", value: "2.4.7 Open Source" },
                    { label: "Cache", value: "Varnish 7 + Redis" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5">
                      <span className="text-xs font-semibold text-gray-700">{label}</span>
                      <span className="text-xs text-gray-500">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3: Vulnerabilities */}
          <div className="group rounded-3xl overflow-hidden border border-gray-200 shadow-sm flex flex-col">
            <div className="bg-white p-8 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Vulnerabilities</p>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight leading-snug">
                  Know before hackers do
                </h3>
                <ul className="space-y-2">
                  <CheckListItem>Checked against known Magento CVEs</CheckListItem>
                  <CheckListItem>Exposed admin paths and dev files flagged</CheckListItem>
                  <CheckListItem>Security headers and TLS graded</CheckListItem>
                </ul>
              </div>
              <div className="mt-6">
                <ExpandingCta href="#scan" label="Scan your store free" />
              </div>
            </div>
            <div className="bg-gray-950 p-6 flex items-center justify-center overflow-hidden flex-1 border-t border-gray-200">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full">
                <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Security findings</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">2 issues need attention</div>
                  </div>
                  <span className="bg-red-100 text-red-700 border border-red-200 text-[10px] px-2.5 py-1 rounded-full font-semibold">
                    Action needed
                  </span>
                </div>
                <div className="p-4 space-y-1">
                  {[
                    { sev: "HIGH", tone: "bg-red-100 text-red-700", title: "Outdated payment module", ref: "CVE-2025-1234" },
                    { sev: "MED", tone: "bg-amber-100 text-amber-700", title: "Version disclosure header", ref: "X-Magento" },
                    { sev: "PASS", tone: "bg-emerald-100 text-emerald-700", title: "Admin path not default", ref: "/admin" },
                  ].map(({ sev, tone, title, ref }, i, arr) => (
                    <div
                      key={title}
                      className={`flex items-center justify-between py-2 ${i < arr.length - 1 ? "border-b border-gray-50" : ""}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`${tone} text-[9px] px-1.5 py-0.5 rounded font-semibold`}>{sev}</span>
                        <span className="text-xs text-gray-700 font-medium">{title}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">{ref}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 4: Extensions */}
        <div className="group rounded-3xl overflow-hidden border border-gray-200 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="bg-gray-950 p-8 flex items-center justify-center overflow-hidden order-2 md:order-1">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full">
                <div className="px-5 py-3.5 border-b border-gray-100 flex gap-5">
                  <span className="text-xs text-gray-400 pb-0.5">Overview</span>
                  <span className="text-xs font-semibold text-gray-900 border-b-2 border-gray-900 pb-0.5">Extensions</span>
                </div>
                <div className="p-5 space-y-1">
                  {[
                    { dot: "bg-emerald-400", name: "Amasty_Shopby", ver: "2.18.4", status: "Up to date", tone: "text-emerald-600" },
                    { dot: "bg-amber-400", name: "Mageplaza_Smtp", ver: "4.5.1", status: "Update available", tone: "text-amber-600" },
                    { dot: "bg-red-400", name: "Vendor_Payments", ver: "1.2.0", status: "Known CVE", tone: "text-red-600" },
                  ].map(({ dot, name, ver, status, tone }, i, arr) => (
                    <div
                      key={name}
                      className={`flex items-center justify-between py-2 ${i < arr.length - 1 ? "border-b border-gray-50" : ""}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                        <span className="text-xs text-gray-700 font-medium">{name}</span>
                        <span className="bg-gray-100 text-gray-400 text-[9px] px-1.5 py-0.5 rounded font-mono">{ver}</span>
                      </div>
                      <span className={`text-[10px] font-medium ${tone}`}>{status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-white p-10 flex flex-col justify-between min-h-[320px] order-1 md:order-2">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Extensions</p>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-5 tracking-tight leading-snug">
                  Audit every module
                  <br />
                  on your store
                </h3>
                <ul className="space-y-2.5">
                  <CheckListItem>Third-party extensions detected automatically</CheckListItem>
                  <CheckListItem>Outdated versions and known CVEs flagged</CheckListItem>
                  <CheckListItem>Abandoned modules highlighted for removal</CheckListItem>
                </ul>
              </div>
              <div className="mt-8">
                <ExpandingCta href="#scan" label="Scan your store free" />
              </div>
            </div>
          </div>
        </div>

        {/* Feature 5: SEO */}
        <div className="group rounded-3xl overflow-hidden border border-gray-200 shadow-sm mb-14">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="bg-white p-10 flex flex-col justify-between min-h-[320px]">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">SEO</p>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-5 tracking-tight leading-snug">
                  Stop leaking
                  <br />
                  organic traffic
                </h3>
                <ul className="space-y-2.5">
                  <CheckListItem>Meta tags, canonicals and hreflang validated</CheckListItem>
                  <CheckListItem>Product schema and rich results checked</CheckListItem>
                  <CheckListItem>Sitemap and robots.txt issues surfaced</CheckListItem>
                </ul>
              </div>
              <div className="mt-8">
                <ExpandingCta href="#scan" label="Scan your store free" />
              </div>
            </div>
            <div className="bg-gray-50 p-8 flex items-center justify-center overflow-hidden border-t md:border-t-0 md:border-l border-gray-200">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden w-full">
                <div className="px-5 py-4 border-b border-gray-100">
                  <div className="text-xs font-semibold text-gray-700">SEO checks</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">Category page &middot; /womens/dresses</div>
                </div>
                <div className="p-5 space-y-1.5 font-mono text-xs">
                  {[
                    { pass: true, text: "Canonical tag present and self-referencing" },
                    { pass: true, text: "Product schema valid for rich results" },
                    { pass: false, text: "Meta description missing on 14 pages" },
                    { pass: false, text: "Layered nav creating duplicate URLs" },
                  ].map(({ pass, text }) => (
                    <div
                      key={text}
                      className={`flex items-start gap-2.5 px-3 py-2 rounded-lg border ${
                        pass
                          ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                          : "bg-red-50 border-red-100 text-red-700"
                      }`}
                    >
                      <span className={`select-none font-bold ${pass ? "text-emerald-500" : "text-red-400"}`}>
                        {pass ? "✓" : "✗"}
                      </span>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Small features grid */}
        <div className="pb-20">
          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
            style={{ borderLeft: "1px solid #e5e7eb", borderTop: "1px solid #e5e7eb" }}
          >
            {smallFeatures.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-gray-50 p-8 cursor-default"
                style={{ borderRight: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb" }}
              >
                <div className="w-9 h-9 bg-white border border-gray-200 rounded-xl mb-5 flex items-center justify-center">
                  <OutlineIcon d={icon} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
