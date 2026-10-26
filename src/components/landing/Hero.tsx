"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HERO_SLIDES } from "./home-config";

export default function Hero() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slide = HERO_SLIDES[active];
  
  const move = (step: number) =>
    setActive((c) => (c + step + HERO_SLIDES.length) % HERO_SLIDES.length);

  useEffect(() => {
    if (isPaused) return;
    const t = window.setInterval(() => move(1), 5000);
    return () => window.clearInterval(t);
  }, [isPaused, active]);

  return (
    <section 
      // FIXED: Uses calc(100dvh - 120px) to perfectly fit the exact remaining screen space
      // 120px accounts for the 40px banner + 80px header
      className="relative w-full h-[calc(100dvh-120px)] min-h-[550px] overflow-hidden bg-[var(--theme-bgAccent)]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={slide.image}
            alt="Hero"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Dark overlay gradient for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={`copy-${active}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <span className="inline-block text-[11px] sm:text-[13px] font-medium uppercase tracking-[0.2em] text-white/90 mb-4 sm:mb-6">
                {slide.eyebrow}
              </span>

              <h1 className="text-[44px] sm:text-[60px] lg:text-[80px] font-medium text-white leading-[0.95] tracking-tight mb-4 sm:mb-6">
                {slide.title}
              </h1>

              <p className="text-[15px] sm:text-[17px] text-white/80 leading-[1.4] mb-8 sm:mb-10 max-w-lg font-light">
                {slide.description}
              </p>

              <Link
                href={slide.href}
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full border border-white/30 bg-black/20 text-white text-[12px] font-medium uppercase tracking-[0.1em] backdrop-blur-md hover:bg-white hover:text-black hover:border-white transition-all duration-300"
              >
                {slide.action}
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => move(-1)}
        aria-label="Previous slide"
        className="absolute left-0 top-0 bottom-0 z-20 w-16 md:w-24 flex items-center justify-center text-white/50 hover:text-white bg-gradient-to-r from-black/20 to-transparent hover:from-black/40 transition-all group outline-none"
      >
        <ChevronLeft className="w-8 h-8 md:w-10 md:h-10 opacity-60 group-hover:opacity-100 group-hover:-translate-x-1 transition-all" />
      </button>
      <button
        onClick={() => move(1)}
        aria-label="Next slide"
        className="absolute right-0 top-0 bottom-0 z-20 w-16 md:w-24 flex items-center justify-center text-white/50 hover:text-white bg-gradient-to-l from-black/20 to-transparent hover:from-black/40 transition-all group outline-none"
      >
        <ChevronRight className="w-8 h-8 md:w-10 md:h-10 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </button>

      {/* Slide dots */}
      <div className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-500 relative overflow-hidden outline-none ${
              i === active ? "w-12 h-[3px]" : "w-[3px] h-[3px] hover:bg-white/80"
            }`}
          >
            {i === active ? (
              <>
                <div className="absolute inset-0 bg-white/20" />
                <motion.div
                  key={`progress-${active}`}
                  initial={{ width: "0%" }}
                  animate={{ width: isPaused ? "0%" : "100%" }}
                  transition={{ duration: isPaused ? 0 : 5, ease: "linear" }}
                  className="absolute inset-0 bg-white"
                />
              </>
            ) : (
              <div className="w-full h-full bg-white/40" />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}