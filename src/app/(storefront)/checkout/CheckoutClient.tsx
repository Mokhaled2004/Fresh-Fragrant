"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Lock, CreditCard, Banknote } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";

interface CheckoutClientProps {
  user: { id: string; fullName: string; email: string; phoneNumber: string; };
  savedAddresses: any[];
}

export default function CheckoutClient({ user, savedAddresses }: CheckoutClientProps) {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  
  // Form states prefilled with user data
  const [formData, setFormData] = useState({
    fullName: user.fullName,
    email: user.email,
    phone: user.phoneNumber,
    address: savedAddresses[0]?.addressLine || "",
    city: savedAddresses[0]?.city || "",
    country: savedAddresses[0]?.country || "",
    postalCode: savedAddresses[0]?.postalCode || "",
    notes: ""
  });

  // Calculate shipping (Free over $50, otherwise $5)
  const shippingCost = subtotal > 50 ? 0 : 5;
  const total = subtotal + shippingCost;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    setIsSubmitting(true);
    setCheckoutError(null);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          shippingName: formData.fullName,
          shippingPhone: formData.phone,
          shippingEmail: formData.email,
          shippingAddress: formData.address,
          shippingCity: formData.city,
          shippingCountry: formData.country,
          shippingPostalCode: formData.postalCode,
          notes: formData.notes,
          paymentMethod,
          subtotal,
          shippingCost,
          discount: 0,
          total,
          currency: 'EGP',
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId || null,
            productName: item.name,
            productImage: item.imageUrl || null,
            unitPrice: item.price,
            quantity: item.quantity,
            lineTotal: item.price * item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Order placement failed');
      }

      clearCart();
      router.push('/checkout/success');

    } catch (error) {
      console.error("Checkout failed", error);
      setCheckoutError(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6">
        <h1 className="text-[28px] font-medium text-black mb-4">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">You cannot checkout without any items in your cart.</p>
        <Link href="/shop" className="bg-[#5433EB] text-white px-8 py-3.5 rounded-full text-[13px] font-medium hover:bg-[#4524DB] transition-colors">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 min-h-screen pb-20">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 pt-8">
        
        <Link href="/shop" className="inline-flex items-center gap-2 text-[13px] font-medium text-gray-500 hover:text-black transition-colors mb-8">
          <ChevronLeft className="w-4 h-4" /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT: Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Shipping Details */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                <h2 className="text-[20px] font-medium text-black mb-6">Shipping Details</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-[0.1em] mb-2">Full Name</label>
                    <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] text-black focus:border-[#5433EB] focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-[0.1em] mb-2">Email</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] text-black focus:border-[#5433EB] focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-[0.1em] mb-2">Phone</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] text-black focus:border-[#5433EB] focus:outline-none transition-colors" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-[0.1em] mb-2">Address</label>
                    <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] text-black focus:border-[#5433EB] focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-[0.1em] mb-2">City</label>
                    <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] text-black focus:border-[#5433EB] focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-[0.1em] mb-2">Postal Code</label>
                    <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] text-black focus:border-[#5433EB] focus:outline-none transition-colors" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-[0.1em] mb-2">Country</label>
                    <input required type="text" name="country" value={formData.country} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] text-black focus:border-[#5433EB] focus:outline-none transition-colors" />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                <h2 className="text-[20px] font-medium text-black mb-6">Payment Method</h2>
                
                <div className="space-y-3">
                  <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-[#5433EB] bg-[#F3F0FF]' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="accent-[#5433EB]" />
                    <Banknote className="w-5 h-5 text-gray-600" />
                    <span className="text-[14px] font-medium text-black">Cash on Delivery</span>
                  </label>
                  
                  <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-[#5433EB] bg-[#F3F0FF]' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="accent-[#5433EB]" />
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <span className="text-[14px] font-medium text-black">Credit / Debit Card</span>
                  </label>
                </div>
              </div>

              {/* Submit Button (Mobile Only) */}
              {checkoutError && (
                <p className="text-red-600 text-[13px] text-center">{checkoutError}</p>
              )}
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full lg:hidden flex items-center justify-center gap-2 bg-[#5433EB] text-white font-medium py-4 rounded-full transition-colors hover:bg-[#4524DB] text-[14px] disabled:opacity-50"
              >
                <Lock className="w-4 h-4" /> {isSubmitting ? "Processing..." : `Place Order • $${total.toFixed(2)}`}
              </button>
            </form>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm sticky top-28">
              <h2 className="text-[20px] font-medium text-black mb-6">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variantId}`} className="flex gap-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-100" />
                      )}
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] font-medium text-black leading-tight">{item.name}</p>
                      {item.variantLabel && <p className="text-[11px] text-gray-500 mt-0.5">{item.variantLabel}</p>}
                    </div>
                    <p className="text-[14px] font-medium text-black">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 pt-6 border-t border-gray-100">
                <div className="flex justify-between text-[14px] text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[14px] text-gray-600">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-[18px] font-bold text-black pt-3 border-t border-gray-100">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit Button (Desktop Only) */}
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="hidden lg:flex w-full mt-6 items-center justify-center gap-2 bg-[#5433EB] text-white font-medium py-4 rounded-full transition-colors hover:bg-[#4524DB] text-[14px] disabled:opacity-50"
              >
                <Lock className="w-4 h-4" /> {isSubmitting ? "Processing..." : `Place Order • $${total.toFixed(2)}`}
              </button>
              
              <p className="text-center text-[11px] text-gray-400 mt-4">
                Secure checkout. By placing your order you agree to our Terms & Conditions.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}