"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star, ShoppingBag } from "lucide-react";
import gsap from "gsap";
import React from "react";
import { useCart } from "@/components/cart/CartProvider";

export default function ShopProductCard({ product, keyLabel, attributeValue }: { product: any, keyLabel: (k:string)=>string, attributeValue: (v:any)=>string[] }) {
  const { addItem } = useCart();

  // Database logic to find the right variant and check stock
  const chosenVariant = product.variants.find((v: any) => v.stock > 0) ?? product.variants[0];
  const canAdd = product.variants.length ? product.variants.some((v: any) => v.stock > 0) : product.stock > 0;
  
  const variantLabel = chosenVariant?.metadata 
    ? Object.entries(chosenVariant.metadata).map(([k, v]) => `${keyLabel(k)}: ${attributeValue(v).join(', ')}`).filter((p) => !p.endsWith(': ')).join(' · ') 
    : '';

  const discounted = product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price);

  // GSAP Wishlist Animation
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

  // Add to cart handler with variant logic
  const handleAddToBag = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canAdd) return;

    addItem({
      productId: product.id, 
      variantId: chosenVariant?.id, 
      variantLabel: variantLabel || undefined, 
      name: product.name, 
      sku: chosenVariant?.sku ?? product.sku, 
      price: Number(chosenVariant?.price ?? product.price), 
      imageUrl: product.imageUrl,
      // @ts-ignore - Adding these to match generic cart item if needed
      id: product.id,
      image: product.imageUrl,
      quantity: 1
    });

    const btn = e.currentTarget as HTMLButtonElement;
    gsap.fromTo(btn, { scale: 0.9 }, { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.5)" });
  };

  return (
    <article className="group block">
      
      {/* Image Container */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#F8F6F4] mb-3">
        
        {product.isFeatured && (
          <span className="absolute top-3 left-3 z-10 bg-[var(--theme-accent)] text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
            Featured
          </span>
        )}
        {discounted && (
          <span className="absolute top-3 left-3 z-10 bg-[var(--theme-accent)] text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
            Sale
          </span>
        )}
        
        {/* Wishlist Button */}
        <button
          aria-label="Add to wishlist"
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:text-[var(--theme-accent)] cursor-pointer hidden md:flex"
        >
          <Heart className="w-4 h-4" />
        </button>
        
        {/* Image Link -> Navigates to /shop/slug */}
        <Link href={`/shop/${product.slug}`} className="absolute inset-0 z-0">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
             <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-[10px] uppercase text-gray-400">No Image</div>
          )}
        </Link>
        
        {/* Add to Bag Button */}
        <div className="absolute bottom-3 right-3 md:bottom-0 md:right-0 md:left-0 z-10 md:translate-y-full md:group-hover:translate-y-0 md:transition-transform md:duration-300">
          <button 
            onClick={handleAddToBag}
            disabled={!canAdd}
            className={`flex items-center justify-center gap-2 font-bold transition-colors cursor-pointer
                       w-10 h-10 rounded-full shadow-lg
                       md:w-full md:h-auto md:rounded-none md:shadow-none md:py-2.5 md:text-xs
                       ${!canAdd ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#5433EB] text-white hover:bg-[#4524DB]"}`}
          >
            <ShoppingBag className="w-4 h-4 md:w-3.5 md:h-3.5" />
            <span className="hidden md:inline">{!canAdd ? 'Out of Stock' : 'Add to Bag'}</span>
          </button>
        </div>
      </div>
      
      {/* Info */}
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="flex items-center gap-0.5 mb-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${i < 4 ? "fill-[var(--theme-accent)] text-[var(--theme-accent)]" : "fill-gray-200 text-gray-200"}`}
            />
          ))}
          {product.ratingCount > 0 && <span className="text-[10px] text-[var(--theme-muted)] ml-1">({product.ratingCount})</span>}
        </div>
        
        <p className="text-sm font-semibold text-[var(--theme-text)] line-clamp-1">{product.name}</p>
        
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-sm font-bold text-[var(--theme-accent)]">${Number(product.price).toFixed(2)}</span>
          {discounted && (
            <span className="text-xs text-[var(--theme-muted)] line-through">${Number(product.compareAtPrice).toFixed(2)}</span>
          )}
        </div>
      </Link>
    </article>
  );
}