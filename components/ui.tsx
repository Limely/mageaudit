export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function CheckListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2.5 text-sm text-gray-500">
      <CheckIcon className="w-3.5 h-3.5 text-gray-900 flex-shrink-0" />
      {children}
    </li>
  );
}

/** Pill CTA that expands its label when the parent `.group` card is hovered. */
export function ExpandingCta({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="inline-flex items-center bg-gray-900 text-white h-10 pl-3 pr-3 rounded-full overflow-hidden transition-all duration-500"
    >
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-500 ease-in-out group-hover:max-w-xs group-hover:pr-2">
        {label}
      </span>
      <ArrowIcon className="w-4 h-4 flex-shrink-0" />
    </a>
  );
}

export function OutlineIcon({ d }: { d: string }) {
  return (
    <svg
      className="text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      style={{ width: 18, height: 18 }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d={d} />
    </svg>
  );
}
