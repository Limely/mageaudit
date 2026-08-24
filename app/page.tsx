/* eslint-disable @next/next/no-img-element */
import { site } from "@/lib/site";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import { ArrowIcon, OutlineIcon } from "@/components/ui";

const steps = [
  {
    num: "01",
    title: "Enter your URL",
    desc: "Paste your store address. No module to install, no admin access needed — we only look at what's public.",
  },
  {
    num: "02",
    title: "We scan your store",
    desc: "42+ checks across speed, theme, extensions, security and SEO — safely and read-only, in under a minute.",
  },
  {
    num: "03",
    title: "Get your report",
    desc: "One health score, every finding explained in plain English, with the exact fix for each issue.",
  },
  {
    num: "04",
    title: "Fix & re-scan",
    desc: "Work through the list, re-scan to confirm, and schedule monthly scans so nothing slips back.",
  },
];

const reasons = [
  {
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    title: "Built for Magento, not generic",
    desc: "We check the things only a Magento specialist would think to check — layered navigation URLs, Page Builder bloat, FPC hit rates, module fingerprints and platform-specific CVEs.",
  },
  {
    icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    title: "Speed is revenue",
    desc: "Every extra second of load time costs conversions. We show you exactly what's slowing your store down and what fixing it is worth, so you can prioritise with confidence.",
  },
  {
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    title: "Find issues before attackers",
    desc: "Magento stores are a prime target for card skimmers. We surface outdated modules, known CVEs and exposed endpoints so you can patch before anyone else finds them.",
  },
  {
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    title: "Plain English, exact fixes",
    desc: "No wall of jargon. Every finding explains what it means, why it matters, and the exact step to fix it — ready to hand straight to your developer.",
  },
];

const compatLogos = [
  { src: "/images/logos/magento.png", alt: "Magento", cls: "h-7", blend: true },
  { src: "/images/logos/adobe-commerce.png", alt: "Adobe Commerce", cls: "h-7", blend: true },
  { src: "/images/logos/hyva.svg", alt: "Hyvä", cls: "h-6", blend: false },
  { src: "/images/logos/luma.png", alt: "Luma", cls: "h-6", blend: true },
  { src: "/images/logos/varnish.png", alt: "Varnish Cache", cls: "h-6", blend: true },
  { src: "/images/logos/redis.png", alt: "Redis", cls: "h-7", blend: true },
];

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />

      {/* COMPAT BAR */}
      <div className="border-y border-gray-100 py-6 bg-white">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {compatLogos.map(({ src, alt, cls, blend }) => (
            <img
              key={alt}
              src={src}
              alt={alt}
              className={`${cls} w-auto opacity-50 grayscale`}
              style={blend ? { mixBlendMode: "multiply" } : undefined}
            />
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="py-28 bg-gray-50/60 border-t border-gray-100" id="how-it-works">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-20">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Four steps to a healthier store
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-px bg-gray-200 rounded-2xl overflow-hidden shadow-sm">
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="bg-white p-8 flex flex-col gap-5">
                <span className="text-4xl font-bold text-gray-900 leading-none select-none">{num}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
                From our
                <br />
                <span className="text-gray-400">community.</span>
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Real feedback from developers and store owners using {site.name} to keep their Magento stores fast,
                secure and search-friendly.
              </p>
            </div>
            <div>
              <div className="text-gray-900 mb-4 select-none">
                <svg width="36" height="28" viewBox="0 0 52 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 40V24.8C0 18.4 1.6 13.2 4.8 9.2 8 5.2 12.8 2.4 19.2.8L21.6 5.6C18.4 6.4 15.6 8 13.2 10.4 10.8 12.8 9.6 15.6 9.6 18.8H20V40H0ZM32 40V24.8C32 18.4 33.6 13.2 36.8 9.2 40 5.2 44.8 2.4 51.2.8L53.6 5.6C50.4 6.4 47.6 8 45.2 10.4 42.8 12.8 41.6 15.6 41.6 18.8H52V40H32Z" />
                </svg>
              </div>
              <blockquote className="text-xl md:text-2xl font-medium text-gray-900 leading-relaxed mb-8">
                We run it on every store we take over. It found an outdated payment module with a known CVE on day
                one — that alone paid for itself.
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  GR
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">Gavin Rogers</p>
                  <p className="text-xs text-gray-400">{site.company}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Features />

      {/* WHY */}
      <section className="py-28 bg-white border-t border-gray-100" id="why">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Why {site.name}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              A health check for every Magento store
            </h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto leading-relaxed">
              Generic site scanners don&rsquo;t understand Magento. {site.name} knows the platform — its themes, its
              extensions, its weak spots — so every finding is relevant and actionable.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reasons.map(({ icon, title, desc }) => (
              <div key={title} className="rounded-2xl p-7 border border-gray-200 bg-white">
                <div className="w-9 h-9 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center mb-5">
                  <OutlineIcon d={icon} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-28 bg-gray-950">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-widest mb-5">Get started today</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6 leading-tight">
            Your Magento store,
            <br />
            scanned in under a minute
          </h2>
          <p className="text-gray-400 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
            Speed, theme, extensions, vulnerabilities and SEO — one score, one report, every fix explained.
          </p>
          <a
            href="#scan"
            className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-full hover:bg-gray-100 font-semibold text-base transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            Scan your store free
            <ArrowIcon className="w-4 h-4" />
          </a>
          <p className="text-gray-600 text-xs mt-5">Free to use. No install required. No credit card.</p>
        </div>
      </section>

      <Footer />
    </>
  );
}
