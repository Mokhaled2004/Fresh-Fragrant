"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function ActiveTabIndicator({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
}) {
  const pillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const pill = pillRef.current;
    if (!container || !pill) return;

    const place = (instant = false) => {
      const activeEl = container.querySelector<HTMLElement>('[data-active="true"]');
      if (!activeEl) return;

      const cRect = container.getBoundingClientRect();
      const aRect = activeEl.getBoundingClientRect();
      
      const left = aRect.left - cRect.left;
      const width = aRect.width;

      if (instant) {
        gsap.set(pill, { x: left, width, opacity: 1 });
        return;
      }

      gsap.to(pill, {
        x: left,
        width: width,
        opacity: 1,
        duration: 0.5,
        ease: "elastic.out(1, 0.7)", 
      });
    };

    place(true);
    window.addEventListener("resize", () => place(true));

    const mo = new MutationObserver(() => place(false));
    mo.observe(container, { attributes: true, subtree: true, attributeFilter: ["data-active"] });

    return () => {
      window.removeEventListener("resize", () => place(true));
      mo.disconnect();
      gsap.killTweensOf(pill);
    };
  }, [containerRef]);

  return (
    <span
      ref={pillRef}
      aria-hidden
      className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-0 h-[38px] rounded-full bg-[#F3F0FF] z-0 opacity-0"
      style={{ willChange: "transform, width, opacity" }}
    />
  );
}