"use client";

import { useEffect, useState } from "react";

function MagentoIcon({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width={size} height={size} className="flex-shrink-0">
      <path
        fill="#F26322"
        d="M119.82 31.97v64.01l-15.85 9.12V41.17l-39.62-22.9-39.64 22.9.1 63.96-15.82-9.15V32.02L64.45 0l55.37 31.97zM72.3 105.1l-7.9 4.6-7.95-4.55V41.17l-15.82 9.15.03 63.96L64.38 128l23.77-13.72V50.29L72.3 41.14v63.96z"
      />
    </svg>
  );
}

function AdobeIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
      <path d="M14.86 3H23v19zM9.14 3H1v19zM11.992 9.998L17.182 22h-3.394l-1.549-3.813h-3.79z" fill="#EB1000" />
    </svg>
  );
}

function HyvaIcon({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="11 10 36 44" fill="none" className="flex-shrink-0">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.5215 19.0068H17.5361V52.8691H25.7949V35.7627C26.9696 33.9977 29.0863 32.3223 31.9961 32.3223C35.5259 32.3224 38.1074 34.3795 38.1074 39.8174V52.8691H46.3359V39.8174C46.3359 29.2667 40.0792 25.151 33.6416 25.1484C30.5017 25.1499 27.7072 26.2947 25.4189 28.1182V11.1309H15.1631L12.5215 19.0068ZM34.7822 18.9805H43.8037L46.4482 11.1309H37.415L34.7822 18.9805ZM44.0352 12.8633L42.5586 17.248H37.1914L38.6621 12.8633H44.0352Z"
        fill="#0A144B"
      />
    </svg>
  );
}

function MageOsIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 77" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
      <path d="M53.3902 61.6511L53.3979 30.8256L26.6953 46.2383V77.0639L53.3902 61.6511Z" fill="#FF9234" />
      <path d="M106.78 61.6511L106.788 30.8256L80.0928 46.2383V77.0639L106.78 61.6511Z" fill="#FF9234" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 30.8255L53.3976 0L80.0848 15.4128L106.787 0L160.177 30.8255L133.482 46.2383L106.787 30.8255L106.787 30.8257L133.482 46.2383V77.0639L106.779 61.6511L106.787 30.8258L80.0925 46.2383L53.3976 30.8255L53.3974 30.8256L80.0923 46.2383V77.0639L53.3896 61.6511L53.3974 30.8257L26.6949 46.2383L26.6949 77.0639L0 61.6511V30.8255Z"
        fill="#F37121"
      />
      <path d="M160.177 30.8256V61.6511L133.482 77.0639V46.2383L160.177 30.8256Z" fill="#FF9234" />
    </svg>
  );
}

const platforms = [
  { label: "Magento", maxW: "max-w-[72px]", Icon: MagentoIcon },
  { label: "Adobe Commerce", maxW: "max-w-[116px]", Icon: AdobeIcon },
  { label: "Hyvä", maxW: "max-w-[40px]", Icon: HyvaIcon },
  { label: "Mage-OS", maxW: "max-w-[64px]", Icon: MageOsIcon },
];

const Divider = () => <span className="w-px h-3 bg-gray-200 flex-shrink-0" />;

/**
 * "Scans Magento / Adobe Commerce / Hyvä / Mage-OS" pill.
 * Three responsive variants: icons-only (≤375px), one-label carousel
 * (376px–md), all labels visible (md+).
 */
export default function PlatformBadge() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % platforms.length), 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {/* Tiny mobile: icons only */}
      <div className="flex min-[376px]:hidden items-center gap-3 bg-white border border-gray-200 px-4 py-2.5 rounded-full mb-4 shadow-sm mx-auto w-fit">
        {platforms.map(({ label, Icon }, i) => (
          <span key={label} className="flex items-center gap-3">
            {i > 0 && <Divider />}
            <Icon size={16} />
          </span>
        ))}
      </div>

      {/* Mobile carousel: one label at a time */}
      <div className="hidden min-[376px]:inline-flex md:hidden items-center gap-3 bg-white border border-gray-200 px-5 py-2.5 rounded-full mb-4 shadow-sm">
        <span className="text-xs text-gray-400 font-medium flex-shrink-0">Scans</span>
        <Divider />
        {platforms.map(({ label, maxW, Icon }, i) => (
          <span key={label} className="flex items-center gap-3">
            {i > 0 && <Divider />}
            <span className="flex items-center">
              <Icon size={14} />
              <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-500 ease-in-out text-xs text-gray-600 font-medium ${
                  active === i ? `${maxW} opacity-100 pl-1.5` : "max-w-0 opacity-0"
                }`}
              >
                {label}
              </span>
            </span>
          </span>
        ))}
      </div>

      {/* Desktop: all visible */}
      <div className="hidden md:inline-flex flex-wrap items-center justify-center gap-x-5 gap-y-2 bg-white border border-gray-200 px-5 py-2.5 rounded-full mb-8 shadow-sm">
        <span className="text-xs text-gray-400 font-medium">Scans</span>
        <Divider />
        {platforms.map(({ label, Icon }, i) => (
          <span key={label} className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {i > 0 && <Divider />}
            <span className="flex items-center gap-2">
              <Icon size={14} />
              <span className="text-xs text-gray-600 font-medium">{label}</span>
            </span>
          </span>
        ))}
      </div>
    </>
  );
}
