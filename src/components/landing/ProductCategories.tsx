"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PRODUCT_CATEGORIES } from "./home-config";

export default function ProductCategories() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // 1. Listen to scroll to update the active dot in real-time
  const handleScroll = () => {
    const slider = sliderRef.current;
    if (!slider) return;

    // Calculate which card is currently centered/in-view
    const cardWidth = slider.firstElementChild?.clientWidth || 300;
    const gap = 16; // The gap-4 in Tailwind is 16px
    const scrollPosition = slider.scrollLeft;
    
    // Find the nearest index
    const index = Math.round(scrollPosition / (cardWidth + gap));
    
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  // 2. Smooth GSAP scroll for arrows
  const scrollBy = (direction: "left" | "right") => {
    if (!sliderRef.current) return;
    const cardWidth = sliderRef.current.firstElementChild?.clientWidth || 300;
    const gap = 16;
    const amount = direction === "left" ? -(cardWidth + gap) : (cardWidth + gap);
    
    gsap.to(sliderRef.current, {
      scrollLeft: sliderRef.current.scrollLeft + amount,
      duration: 0.8,
      ease: "power3.out", // Smoother easing
    });
  };

  return (
    <section className="py-16 sm:py-24 bg-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ORYZO Style Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-16 gap-6">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--theme-muted)] mb-3">
              Explore the Essentials
            </p>
            <h2 className="text-[41px] sm:text-[51px] font-medium text-[var(--theme-text)] leading-[0.9] tracking-tight">
              Product <br className="hidden sm:block" /> Categories.
            </h2>
          </div>
          <p className="text-[16px] sm:text-[18px] text-[var(--theme-muted)] max-w-sm leading-[1.4]">
            Curated collections of our finest natural ingredients and sustainable daily rituals.
          </p>
        </div>

        {/* Slider Container */}
        <div className="relative">
          <div 
            ref={sliderRef}
            onScroll={handleScroll} // <-- Tracks scroll to move the dots
            className="flex lg:grid lg:grid-cols-4 gap-4 overflow-x-auto lg:overflow-visible snap-x snap-mandatory pb-6 lg:pb-0 hide-scrollbar smooth-scroll"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollBehavior: 'smooth' }}
          >
            {PRODUCT_CATEGORIES.map((cat, i) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="group relative flex-shrink-0 w-[280px] sm:w-[320px] lg:w-auto rounded-xl overflow-hidden aspect-[3/4] block bg-[var(--theme-bgAccent)] snap-center"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 1024px) 320px, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity duration-500" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end">
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/80 mb-1">
                    0{i + 1}
                  </span>
                  <h3 className="text-white text-[20px] font-medium leading-[1.1] uppercase tracking-wide">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile Navigation Arrows & Dots */}
          <div className="flex lg:hidden items-center justify-center gap-6 mt-8">
            <button
              onClick={() => scrollBy("left")}
              className="w-10 h-10 rounded-full border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-text)] hover:bg-[var(--theme-bg)] transition-colors outline-none active:scale-95"
              aria-label="Previous category"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {/* The Animated Bar Indicator */}
            <div className="relative flex items-center h-4">
              {PRODUCT_CATEGORIES.map((_, i) => (
                <div 
                  key={i}
                  // The gap between lines
                  className={`relative h-[2px] mx-1 transition-all duration-500 ease-out ${
                    i === activeIndex ? "w-8 bg-[var(--theme-text)]" : "w-2 bg-[var(--theme-border)]"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => scrollBy("right")}
              className="w-10 h-10 rounded-full border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-text)] hover:bg-[var(--theme-bg)] transition-colors outline-none active:scale-95"
              aria-label="Next category"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}