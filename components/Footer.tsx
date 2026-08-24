import { site } from "@/lib/site";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Logo markClass="h-5" textClass="text-base" />
            </div>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              Magento health checks, done properly. Scan your store for speed, theme, extensions, vulnerabilities
              and SEO — and get the exact fixes.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">Features</a>
              </li>
              <li>
                <a href="#how-it-works" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">How It Works</a>
              </li>
              <li>
                <a href="#why" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">Why {site.name}</a>
              </li>
              <li>
                <a href="#scan" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">Scan Your Store</a>
              </li>
              <li>
                <a href={`mailto:${site.contactEmail}`} className="text-sm text-gray-400 hover:text-gray-700 transition-colors">Contact</a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">Privacy Policy</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p className="text-xs text-gray-300 mt-1">
            {site.name} is a trading name of {site.company} &middot; Company No. {site.companyNumber}
          </p>
        </div>
      </div>
    </footer>
  );
}
