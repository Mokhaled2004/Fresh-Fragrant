import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
        <SearchX className="w-10 h-10 text-gray-400" />
      </div>
      <h1 className="text-[32px] font-medium text-black mb-3">Page Not Found</h1>
      <p className="text-[15px] text-gray-500 max-w-md mb-8">
        The product or page you are looking for doesn't exist or has been moved.
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