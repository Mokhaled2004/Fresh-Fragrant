"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";

export default function ProductDetailsClient({ product, variants }: { product: any, variants: any[] }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(variants[0] || null);
  const [added, setAdded] = useState(false);

  const currentPrice = selectedVariant?.price ? Number(selectedVariant.price) : Number(product.price);
  const canAdd = selectedVariant ? selectedVariant.stock > 0 : product.stock > 0;

  const handleAddToCart = () => {
    if (!canAdd) return;
    
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id,
      variantLabel: selectedVariant ? Object.entries(selectedVariant.metadata || {}).map(([k, v]) => `${k}: ${v}`).join(', ') : undefined,
      name: product.name,
      sku: selectedVariant?.sku || product.sku,
      price: currentPrice,
      imageUrl: product.imageUrl,
      quantity: quantity,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div>
      {/* Variants Selection */}
      {variants.length > 0 && (
        <div className="mb-6">
          <p className="text-[12px] font-medium uppercase tracking-wider text-gray-500 mb-3">Select Option</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const label = v.metadata ? Object.values(v.metadata).join(" / ") : v.sku;
              const isSelected = selectedVariant?.id === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  className={`px-4 py-2 rounded-full text-[13px] font-medium border transition-colors ${
                    isSelected ? "border-[#5433EB] bg-[#F3F0FF] text-[#5433EB]" : "border-gray-200 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {label as string}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity & Add to Cart */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center border border-gray-200 rounded-full bg-white px-2 py-1">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <Minus className="w-4 h-4 text-gray-500" />
          </button>
          <span className="w-8 text-center text-[14px] font-medium text-black">{quantity}</span>
          <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <Plus className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!canAdd}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-full font-medium text-[14px] transition-all ${
            !canAdd 
              ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
              : added
                ? "bg-green-600 text-white"
                : "bg-[#5433EB] text-white hover:bg-[#4524DB]"
          }`}
        >
          {added ? <Check className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
          {!canAdd ? "Out of Stock" : added ? "Added to Cart" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}