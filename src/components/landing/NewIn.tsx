"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { NEWIN_IMAGES } from "./home-config";
import ProductCard from "../shop/ProductCard"; 

const NEWIN_PRODUCTS = [
  { id: "n1", name: "Cold-Pressed Olive Oil Soap", price: "12.99", compareAtPrice: null, image: NEWIN_IMAGES[0], slug: "cold-pressed-olive-oil-soap" },
  { id: "n2", name: "Rosemary & Mint Conditioner", price: "18.99", compareAtPrice: "24.99", image: NEWIN_IMAGES[1], slug: "rosemary-mint-conditioner" },
  { id: "n3", name: "Organic Bamboo Soap Dish", price: "8.99", compareAtPrice: null, image: NEWIN_IMAGES[2], slug: "organic-bamboo-soap-dish" },
  { id: "n4", name: "Lavender Essential Oil", price: "22.99", compareAtPrice: null, image: NEWIN_IMAGES[3], slug: "lavender-essential-oil" },
  { id: "n5", name: "Charcoal Detox Body Bar", price: "10.99", compareAtPrice: "14.99", image: NEWIN_IMAGES[0], slug: "charcoal-detox-body-bar" },
  { id: "n6", name: "Botanical Hair Mask", price: "26.99", compareAtPrice: null, image: NEWIN_IMAGES[1], slug: "botanical-hair-mask" },
];

export default function NewIn() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    checkScroll();
    element.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    return () => {
      element.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  return (
    <section className="pt-4 pb-8 sm:pt-6 sm:pb-12 bg-[var(--theme-bgAccent)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--theme-text)]">New In</h2>
            <p className="text-sm text-[var(--theme-muted)] mt-1">Fresh arrivals just for you</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
          
          {/* Large featured card */}
          <article className="group w-full">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[var(--theme-bgAccent)]">
              <Image
                src={NEWIN_IMAGES[0]}
                alt="New In Featured Product"
                fill
                sizes="(max-width: 1024px) 100vw, 380px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              <div className="absolute bottom-8 left-6 right-6">
                <p className="text-white font-bold text-xl drop-shadow-md">
                  100% Natural Botanicals
                </p>
                <p className="text-white/90 text-base mt-1.5 drop-shadow-sm">
                  Cold-Pressed Organic Collection
                </p>
                <Link
                  href="/shop"
                  className="inline-block mt-5 px-7 py-3 rounded-full bg-white text-[var(--theme-accent)] text-sm font-bold hover:bg-gray-100 transition-all duration-300 shadow-xl"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </article>

          {/* Product scroller */}
          <div className="relative overflow-hidden">
            {showLeftArrow && (
              <button
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center text-black hover:text-[var(--theme-accent)] transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {showRightArrow && (
              <button
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center text-black hover:text-[var(--theme-accent)] transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            <div
              ref={scrollRef}
              className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory"
              style={{ scrollbarWidth: "none" }}
            >
              {NEWIN_PRODUCTS.map((product) => {
                const discounted = product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price);
                return (
                  <ProductCard 
                    key={product.id} 
                    product={{
                      ...product, 
                      isNew: !!discounted,
                      slug: product.slug // <-- Pass the slug to the ProductCard
                    }} 
                    className="flex-shrink-0 w-48 sm:w-56 snap-start" 
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}