"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star, ShoppingBag } from "lucide-react";
import gsap from "gsap";
import React from "react";
import { useCart } from "@/components/cart/CartProvider";

export interface ProductCardProps {
  id: string;
  name: string;
  price: string;
  compareAtPrice?: string | null;
  image: string;
  isNew?: boolean;
  slug?: string;
  sku?: string; // optional; falls back to id if not provided
}

export default function ProductCard({ product, className = "" }: { product: ProductCardProps, className?: string }) {
  const discounted = product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price);
  const { addItem } = useCart();

  // Fallback to /shop if no slug is provided
  const productUrl = product.slug ? `/shop/${product.slug}` : `/shop`;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const btn = e.currentTarget as HTMLButtonElement;
    const heart = btn.querySelector('svg');
    
    if (heart) {
      gsap.fromTo(heart, 
        { scale: 1 }, 
        { scale: 1.4, fill: "var(--theme-accent)", color: "var(--theme-accent)", duration: 0.2, ease: "back.out(3)", 
          onComplete: () => {
            gsap.to(heart, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.3)" });
          }
        }
      );
    }
  };

  const handleAddToBag = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      productId: product.id,
      name: product.name,
      sku: product.sku ?? product.id,
      price: Number(product.price),
      imageUrl: product.image,
      quantity: 1,
    });

    const btn = e.currentTarget as HTMLButtonElement;
    gsap.fromTo(btn, { scale: 0.9 }, { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.5)" });
  };

  return (
    <article className={`group block ${className}`}>
      
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-[var(--theme-bgElevated)] mb-3">
        
        {product.isNew && (
          <span className="absolute top-3 left-3 z-10 bg-[var(--theme-accent)] text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
            New
          </span>
        )}
        
        <button
          aria-label="Add to wishlist"
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:text-[var(--theme-accent)] cursor-pointer hidden md:flex"
        >
          <Heart className="w-4 h-4" />
        </button>
        
        {/* Link to product details */}
        <Link href={productUrl} className="absolute inset-0 z-0">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        
        <div className="absolute bottom-3 right-3 md:bottom-0 md:right-0 md:left-0 z-10 md:translate-y-full md:group-hover:translate-y-0 md:transition-transform md:duration-300">
          <button 
            onClick={handleAddToBag}
            className="flex items-center justify-center gap-2 bg-[#5433EB] text-white font-bold hover:bg-[#4524DB] transition-colors cursor-pointer
                       w-10 h-10 rounded-full shadow-lg
                       md:w-full md:h-auto md:rounded-none md:shadow-none md:py-2.5 md:text-xs"
          >
            <ShoppingBag className="w-4 h-4 md:w-3.5 md:h-3.5" />
            <span className="hidden md:inline">Add to Bag</span>
          </button>
        </div>
      </div>
      
      {/* Link to product details */}
      <Link href={productUrl} className="block">
        <div className="flex items-center gap-0.5 mb-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${i < 4 ? "fill-[var(--theme-accent)] text-[var(--theme-accent)]" : "fill-gray-200 text-gray-200"}`}
            />
          ))}
        </div>
        
        <p className="text-sm font-semibold text-[var(--theme-text)] line-clamp-1">{product.name}</p>
        
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-sm font-bold text-[var(--theme-accent)]">${product.price}</span>
          {discounted && (
            <span className="text-xs text-[var(--theme-muted)] line-through">${product.compareAtPrice}</span>
          )}
        </div>
      </Link>
    </article>
  );
}