"use client";

import { useEffect, useRef } from "react";
import { site } from "@/lib/site";

/**
 * Animated stacked-layers logomark (shared brand family with MageDrop):
 * layers drop in on mount, separate on hover.
 */
export default function Logo({
  markClass = "h-6",
  textClass = "text-lg",
}: {
  markClass?: string;
  textClass?: string;
}) {
  const groupRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    const svg = group.querySelector<SVGSVGElement>(".logo-mark");
    if (!svg) return;

    const top = svg.querySelector<SVGPathElement>(".logo-top");
    const mid = svg.querySelector<SVGPathElement>(".logo-mid");
    const bot = svg.querySelector<SVGPathElement>(".logo-bot");
    const paths: [SVGPathElement | null, number][] = [
      [top, 0],
      [mid, 110],
      [bot, 220],
    ];

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      paths.forEach(([p]) => {
        if (p) p.style.opacity = "1";
      });
      return;
    }

    const easing = "cubic-bezier(0.16, 1, 0.3, 1)";
    const keyframes = [
      { transform: "translateY(-30px)", opacity: 0 },
      { transform: "translateY(0)", opacity: 1 },
    ];

    paths.forEach(([path, delay]) => {
      if (!path) return;
      const anim = path.animate(keyframes, { duration: 600, delay, easing, fill: "forwards" });
      anim.finished.then(() => {
        path.style.opacity = "1";
        path.style.transform = "translateY(0)";
        path.style.transition = `transform 0.4s ${easing}`;
        anim.cancel();
      });
    });

    const setY = (p: SVGPathElement | null, y: number) => {
      if (p) {
        p.style.transitionDelay = "0ms";
        p.style.transform = `translateY(${y}px)`;
      }
    };
    const onEnter = () => {
      setY(top, -22);
      setY(mid, 0);
      setY(bot, 22);
    };
    const onLeave = () => {
      setY(top, 0);
      setY(mid, 0);
      setY(bot, 0);
    };
    group.addEventListener("mouseenter", onEnter);
    group.addEventListener("mouseleave", onLeave);
    return () => {
      group.removeEventListener("mouseenter", onEnter);
      group.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <span ref={groupRef} className="logo-group inline-flex items-center gap-2.5 cursor-pointer">
      <svg
        className={`logo-mark ${markClass} w-auto flex-shrink-0`}
        viewBox="0 0 573 303"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ overflow: "visible" }}
      >
        <path
          className="logo-bot"
          d="M3.8 217.45C-1.26667 215.85 -1.26667 214.25 3.8 212.65L267.1 130.95C279.833 127.017 292.567 127.017 305.3 130.95L568.6 212.65C573.667 214.25 573.667 215.85 568.6 217.45L305.3 299.15C292.567 303.083 279.833 303.083 267.1 299.15L3.8 217.45Z"
          fill="#0F172A"
        />
        <path
          className="logo-mid"
          d="M270.052 54.5049C280.862 51.1656 291.538 51.1655 302.349 54.5049V54.5039L542.591 129.05L302.349 203.596C291.538 206.935 280.862 206.935 270.052 203.596H270.051L29.8086 129.05L270.051 54.5039L270.052 54.5049Z"
          fill="white"
          stroke="#0F172A"
          strokeWidth="20"
        />
        <path
          className="logo-top"
          d="M3.8 43.43C-1.26667 41.83 -1.26667 40.23 3.8 38.63L121.1 2.49C130.667 -0.65 140.23 -0.74 149.79 2.22L267.1 38.6301C278.5 42.98 292.5 42.98 305.3 38.6301L422.61 2.22C432.17 -0.74 441.73 -0.74 451.29 2.22L568.6 38.63C573.667 40.23 573.667 41.83 568.6 43.43L305.3 125.13C292.567 129.063 279.833 129.063 267.1 125.13L3.8 43.43Z"
          fill="#0F172A"
        />
      </svg>
      <span className={`${textClass} font-bold text-gray-900 tracking-tight`}>{site.name}</span>
    </span>
  );
}
