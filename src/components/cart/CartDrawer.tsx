"use client";

import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { CartContents } from "@/components/cart/CartProvider";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
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
            className="relative w-full max-w-md h-full bg-white flex flex-col z-10 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-[18px] font-medium text-black">
                Your Cart
              </h2>
              <button 
                onClick={onClose}
                className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items (Scrollable area) */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <CartContents />
            </div>

            {/* 
              We completely removed the footer block that had the purple bar. 
              If you need a checkout button, you can add a simple one here later.
            */}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}