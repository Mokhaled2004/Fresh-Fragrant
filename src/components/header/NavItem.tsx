"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";

interface NavItemProps {
  href: string;
  label: string;
  active: boolean;
}

export default function NavItem({ href, label, active }: NavItemProps) {
  const wrapperRef = useRef<HTMLAnchorElement>(null);
  const hoverBgRef = useRef<HTMLSpanElement>(null);
  const activeRef = useRef(active);
  
  useEffect(() => { activeRef.current = active; }, [active]);

  useEffect(() => {
    const el = wrapperRef.current;
    const hoverBg = hoverBgRef.current;
    if (!el || !hoverBg) return;

    const onEnter = () => {
      if (!activeRef.current) {
        gsap.to(hoverBg, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out" });
      }
    };

    const onLeave = () => {
      if (!activeRef.current) {
        gsap.to(hoverBg, { opacity: 0, scale: 0.95, duration: 0.2, ease: "power2.out" });
      }
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    
    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      gsap.killTweensOf(hoverBg);
    };
  }, []);

  return (
    <Link
      ref={wrapperRef}
      href={href}
      data-nav-item
      data-active={active ? "true" : undefined}
      className={`relative inline-flex items-center justify-center px-5 py-2 text-[14px] font-medium transition-colors outline-none z-10 whitespace-nowrap ${
        active ? "text-[var(--theme-accent)]" : "text-[var(--theme-muted)] hover:text-[var(--theme-text)]"
      }`}
    >
      <span
        ref={hoverBgRef}
        aria-hidden
        className="absolute inset-0 rounded-full bg-gray-100 pointer-events-none z-[-1]"
        style={{ opacity: 0, transform: "scale(0.95)", willChange: "transform, opacity" }}
      />

      <span className="relative z-10 capitalize">
        {label}
      </span>
    </Link>
  );
}