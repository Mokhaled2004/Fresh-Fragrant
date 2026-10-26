"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import ProductCard from "../shop/ProductCard"; // <-- Import the new card

type Product = {
  id: string;
  name: string;
  sku: string;
  slug: string;
  price: string;
  compareAtPrice: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
};

// Hardcoded bestseller products
const BESTSELLERS = [
  {
    id: "best-1",
    name: "Beautya Capture Total Dreamlskin Care & Perfect",
    sku: "BEAU-001",
    price: "70.00",
    compareAtPrice: null,
    image: "/images/products/bestsellers/12fd4930b4f7d02ac821c3a4f1b1a2e37d3af909.jpg",
  },
  {
    id: "best-2",
    name: "Beautya Capture Total Dreamlskin Care & Perfect",
    sku: "BEAU-002",
    price: "76.00",
    compareAtPrice: null,
    image: "/images/products/bestsellers/91b41092bd2d886b9e22c8c57d933f47d4b96cc1.jpg",
  },
  {
    id: "best-3",
    name: "Beautya Capture Total Dreamlskin Care & Perfect",
    sku: "BEAU-003",
    price: "70.00",
    compareAtPrice: null,
    image: "/images/products/bestsellers/9355b81c9f4bab35343f34edcddec04723e84ca1.jpg",
  },
  {
    id: "best-4",
    name: "Beautya Capture Total Dreamlskin Care & Perfect",
    sku: "BEAU-004",
    price: "76.00",
    compareAtPrice: null,
    image: "/images/products/bestsellers/94e49b3d0f5ee35304f91dee9cdead4a05923124.jpg",
  },
];

export default function FeaturedProducts({ products }: { products: Product[] }) {
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
    <section className="py-14 sm:py-20 bg-[var(--theme-bgElevated)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--theme-text)]">Our Best Sellers</h2>
            <p className="text-sm text-[var(--theme-muted)] mt-1">The products our customers love most</p>
          </div>
        </div>

        <div className="relative">
          {showLeftArrow && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[var(--theme-bgElevated)] border border-gray-200 shadow-lg flex items-center justify-center text-[var(--theme-text)] hover:border-[var(--theme-accent)] hover:text-[var(--theme-accent)] transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {showRightArrow && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[var(--theme-bgElevated)] border border-gray-200 shadow-lg flex items-center justify-center text-[var(--theme-text)] hover:border-[var(--theme-accent)] hover:text-[var(--theme-accent)] transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: "none" }}
          >
          {BESTSELLERS.map((product) => (
            // Pass the exact width and snap classes to the reusable card
            <ProductCard 
              key={product.id} 
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                compareAtPrice: product.compareAtPrice,
                image: product.image,
              }} 
              className="flex-shrink-0 w-64 sm:w-72 snap-start" 
            />
          ))}
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-[var(--theme-accent)] text-[var(--theme-accent)] font-semibold text-sm hover:bg-[var(--theme-accent)] hover:text-white transition-colors"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}