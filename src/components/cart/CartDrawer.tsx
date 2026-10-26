"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight } from "lucide-react";
import { CartContents, useCart } from "@/components/cart/CartProvider";
import Link from "next/link";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { subtotal, items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md h-[100dvh] max-h-screen bg-white flex flex-col z-10 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <h2 className="text-[18px] font-medium text-black">
                  Your Cart
                </h2>
                {itemCount > 0 && (
                  <span className="text-[12px] font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                    {itemCount}
                  </span>
                )}
              </div>
              <button 
                onClick={onClose}
                aria-label="Close cart"
                className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items (Scrollable) */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
              <CartContents />
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 px-6 py-5 bg-white shrink-0 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[14px] text-gray-600">Subtotal</span>
                  <span className="text-[18px] font-bold text-black">${subtotal.toFixed(2)}</span>
                </div>
                
                <p className="text-[12px] text-gray-400 mb-4">
                  Shipping and any applicable offer will be calculated at checkout.
                </p>

                {/* Checkout Button At The End */}
                <Link 
                  href="/checkout" 
                  onClick={onClose}
                  className="w-full h-14 flex items-center justify-center gap-2 rounded-full bg-[#5433EB] hover:bg-[#4524DB] active:scale-[0.99] text-white text-[15px] font-semibold transition-all duration-200 cursor-pointer shadow-md no-underline"
                  style={{
                    display: "flex",
                    width: "100%",
                    height: "56px",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "9999px",
                    backgroundColor: "#5433EB",
                    color: "#ffffff",
                    fontSize: "15px",
                    fontWeight: "600",
                    textDecoration: "none"
                  }}
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}