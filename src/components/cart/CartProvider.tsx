"use client";

import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type CartLine = { productId: string; variantId?: string; variantLabel?: string; name: string; sku: string; price: number; imageUrl: string | null; quantity: number };
type CartContextValue = { 
  items: CartLine[]; 
  addItem: (item: Omit<CartLine, 'quantity'> & { quantity?: number }) => void; 
  changeQuantity: (productId: string, quantity: number) => void; 
  removeItem: (productId: string) => void; 
  subtotal: number;
  clearCart: () => void;
};
const CartContext = createContext<CartContextValue | null>(null);
const storageKey = 'storefront-cart-v1';

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    try { 
      const stored = window.localStorage.getItem(storageKey); 
      if (stored) setItems(JSON.parse(stored) as CartLine[]); 
    } catch { 
      window.localStorage.removeItem(storageKey); 
    }
    setReady(true);
  }, []);

  // Save to local storage on change
  useEffect(() => { 
    if (ready) window.localStorage.setItem(storageKey, JSON.stringify(items)); 
  }, [items, ready]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    addItem: (item) => setItems((current) => {
      const qty = item.quantity ?? 1;
      const found = current.find(
        (entry) => entry.productId === item.productId && entry.variantId === item.variantId
      );
      return found
        ? current.map((entry) =>
            entry.productId === item.productId && entry.variantId === item.variantId
              ? { ...entry, quantity: Math.min(99, entry.quantity + qty) }
              : entry
          )
        : [...current, { ...item, quantity: Math.min(99, qty) }];
    }),
    changeQuantity: (lineKey, quantity) => setItems((current) => quantity < 1 
      ? current.filter((entry) => `${entry.productId}:${entry.variantId ?? ''}` !== lineKey) 
      : current.map((entry) => `${entry.productId}:${entry.variantId ?? ''}` === lineKey ? { ...entry, quantity: Math.min(99, quantity) } : entry)
    ),
    removeItem: (lineKey) => setItems((current) => current.filter((entry) => `${entry.productId}:${entry.variantId ?? ''}` !== lineKey)),
    subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    clearCart: () => setItems([]),
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// --- CART CONTENTS (Used in Drawer) ---
export function CartContents() {
  const { items, changeQuantity, removeItem, subtotal } = useCart();

  if (!items.length) return (
    <div className="flex h-full flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
        <ShoppingBag className="w-6 h-6 text-gray-400" />
      </div>
      <p className="text-[16px] font-medium text-black">Your cart is empty</p>
      <p className="mt-2 text-[13px] text-gray-500 max-w-[200px]">Add a style from the shop and it will show up here.</p>
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto pr-1">
        {items.map((item) => {
          const lineKey = `${item.productId}:${item.variantId ?? ''}`;
          return (
            <article key={lineKey} className="flex gap-4">
              
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-[#F8F6F4] border border-gray-100">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.name} fill sizes="80px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ShoppingBag className="w-6 h-6 opacity-30" />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between py-0.5">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-[14px] font-medium text-black leading-tight line-clamp-2">{item.name}</h3>
                    <button 
                      type="button" 
                      aria-label={`Remove ${item.name} from cart`} 
                      onClick={() => removeItem(lineKey)} 
                      className="text-gray-400 hover:text-red-500 transition-colors p-1.5 -mr-1.5 rounded-md hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {item.variantLabel && <p className="mt-1 text-[11px] text-gray-500">{item.variantLabel}</p>}
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 rounded-full bg-white px-1 py-1">
                    <button aria-label={`Decrease ${item.name} quantity`} onClick={() => changeQuantity(lineKey, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-black transition-colors">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-[12px] font-medium text-black">
                      {item.quantity}
                    </span>
                    <button aria-label={`Increase ${item.name} quantity`} onClick={() => changeQuantity(lineKey, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-black transition-colors">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <p className="text-[14px] font-bold text-black">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 bg-white">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[14px] text-gray-600">Subtotal</span>
          <span className="text-[18px] font-bold text-black">${subtotal.toFixed(2)}</span>
        </div>
        <p className="text-[11px] text-gray-400">
          Shipping and any applicable offer will be calculated at checkout.
        </p>
      </div>
    </div>
  );
}