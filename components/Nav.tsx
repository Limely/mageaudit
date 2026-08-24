import Link from "next/link";
import Logo from "./Logo";
import { ArrowIcon } from "./ui";

export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-gray-200/80 z-50">
      <div className="max-w-6xl mx-auto px-6 py-0 flex justify-between items-center h-16">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo />
          </Link>
        </div>
        <div className="flex items-center gap-1 sm:gap-5">
          <a href="#features" className="text-sm text-gray-500 hover:text-gray-900 hidden md:block transition-colors px-2 py-1">
            Features
          </a>
          <a href="#how-it-works" className="text-sm text-gray-500 hover:text-gray-900 hidden md:block transition-colors px-2 py-1">
            How It Works
          </a>
          <a href="#why" className="text-sm text-gray-500 hover:text-gray-900 hidden md:block transition-colors px-2 py-1">
            Why Us
          </a>
          <a
            href="#scan"
            className="bg-gray-900 text-white text-sm px-4 py-2 rounded-full hover:bg-gray-700 font-medium transition-colors cursor-pointer ml-2 shadow-sm shadow-black/10"
          >
            Scan Your Store <ArrowIcon className="inline-block w-3.5 h-3.5 ml-0.5 -mr-0.5" />
          </a>
        </div>
      </div>
    </nav>
  );
}
