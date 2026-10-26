'use client';

import { Trash2, Edit3, PackageX } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Loader } from '@/components/ui/Loader'; // <-- New Loader import

interface ProductTableProps {
  products?: any[];
  categories?: any[];
  loading?: boolean; // optional — pass from parent if you want a loading state
  onEditClick: (product: any) => void;
  onDeleteClick: (product: any) => void;
}

// Helper to safely format image URLs
const resolveImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  const cleanUrl = url.trim();
  if (!cleanUrl) return null;
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) return cleanUrl;
  if (cleanUrl.startsWith('/')) return cleanUrl;
  return `/${cleanUrl}`;
};

function ProductImage({ url, name }: { url: string | null | undefined; name: string }) {
  const [hasError, setHasError] = useState(false);
  const resolved = resolveImageUrl(url);

  if (!resolved || hasError) {
    return (
      <div className="flex items-center justify-center h-full text-[10px] uppercase tracking-wider text-gray-400 bg-[#F8F6F4]">
        No Img
      </div>
    );
  }

  return (
    <Image 
      src={resolved} 
      alt={name} 
      fill 
      sizes="48px" 
      className="object-cover"
      onError={() => setHasError(true)}
    />
  );
}

export default function ProductTable({
  products = [],
  categories = [],
  loading = false,
  onEditClick,
  onDeleteClick,
}: ProductTableProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white py-16 flex flex-col items-center justify-center gap-2 text-gray-400">
        <Loader />
        <span className="text-[13px]">Loading products...</span>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-[#F8F6F4] flex items-center justify-center mx-auto mb-4">
          <PackageX className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-[14px] font-medium text-gray-900 mb-1">No products yet</p>
        <p className="text-[12px] text-gray-500">Add your first product to get started.</p>
      </div>
    );
  }

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-none">
          <thead>
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              <th className="py-4 px-6 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500">Image</th>
              <th className="py-4 px-6 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500">Product & SKU</th>
              <th className="py-4 px-6 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500">Category</th>
              <th className="py-4 px-6 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500">Price</th>
              <th className="py-4 px-6 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500">Stock</th>
              <th className="py-4 px-6 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500">Status</th>
              <th className="py-4 px-6 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="text-[13px]">
            {products.map((prod, index) => (
              <tr 
                key={prod.id} 
                className="hover:bg-[#FAFAFA] transition-colors"
                style={index !== products.length - 1 ? { borderBottom: '1px solid #f9fafb' } : { borderBottom: 'none' }}
              >
                <td className="py-4 px-6">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                    <ProductImage url={prod.imageUrl} name={prod.name} />
                  </div>
                </td>

                <td className="py-4 px-6">
                  <div className="text-[14px] font-medium text-gray-900 leading-snug line-clamp-1">{prod.name}</div>
                  <div className="text-[11px] font-mono text-gray-400 mt-0.5">SKU: {prod.sku}</div>
                </td>

                <td className="py-4 px-6 text-[13px] text-gray-600">
                  {prod.categoryId ? categoryMap.get(prod.categoryId) || 'Uncategorized' : '—'}
                </td>

                <td className="py-4 px-6 text-[14px] font-medium text-gray-900">
                  ${Number(prod.price).toFixed(2)}
                </td>

                <td className="py-4 px-6 font-mono text-[13px] text-gray-600">
                  {prod.stock}
                </td>

                <td className="py-4 px-6">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                      prod.isActive ? 'bg-[#F3F0FF] text-[#5433EB]' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${prod.isActive ? 'bg-[#5433EB]' : 'bg-gray-400'}`} />
                    {prod.isActive ? 'Active' : 'Draft'}
                  </span>
                </td>

                <td className="py-4 px-6">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onEditClick(prod); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#5433EB] hover:bg-[#F3F0FF] transition-colors cursor-pointer outline-none"
                      title="Edit Product"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onDeleteClick(prod); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer outline-none"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}