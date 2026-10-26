import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 className="w-10 h-10 text-green-500" />
      </div>
      <h1 className="text-[32px] font-medium text-black mb-3">Order Confirmed!</h1>
      <p className="text-[15px] text-gray-500 max-w-md mb-8">
        Thank you for your purchase. We've received your order and will send you an email with the tracking details shortly.
      </p>
      <div className="flex gap-4">
        <Link href="/" className="px-6 py-3 border border-gray-200 rounded-full text-[13px] font-medium text-black hover:bg-gray-50 transition-colors">
          Back to Home
        </Link>
        <Link href="/shop" className="px-6 py-3 bg-[#5433EB] text-white rounded-full text-[13px] font-medium hover:bg-[#4524DB] transition-colors">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}