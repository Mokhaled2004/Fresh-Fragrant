'use client';

import { Edit, Trash2, Package } from 'lucide-react';
import { useState } from 'react';
import { Loader } from '@/components/ui/Loader'; // <-- New Loader import

interface VariantTableProps {
  variants: any[];
  loading?: boolean; // optional — pass from parent if you want a loading state
  onEdit: (variant: any) => void;
  onDelete: (variant: any) => void;
}

function VariantImage({ url, name }: { url: string | null | undefined; name: string }) {
  const [hasError, setHasError] = useState(false);
  if (!url || hasError) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <Package className="w-4 h-4" />
      </div>
    );
  }
  return (
    <img
      src={url}
      alt={name}
      className="w-full h-full object-cover"
      onError={() => setHasError(true)}
    />
  );
}

export default function VariantTable({ variants, loading = false, onEdit, onDelete }: VariantTableProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white py-16 flex flex-col items-center justify-center gap-2 text-gray-400">
        <Loader />
        <span className="text-[13px]">Loading variants...</span>
      </div>
    );
  }

  if (variants.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-[#F8F6F4] flex items-center justify-center mx-auto mb-4">
          <Package className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-[14px] font-medium text-gray-900 mb-1">No variants found</p>
        <p className="text-[12px] text-gray-500">Add your first variant to get started.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-none">
          <thead>
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              <th className="py-4 px-6 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500">Image</th>
              <th className="py-4 px-6 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500">SKU</th>
              <th className="py-4 px-6 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500">Product</th>
              <th className="py-4 px-6 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500">Price</th>
              <th className="py-4 px-6 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500">Stock</th>
              <th className="py-4 px-6 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500">Attributes</th>
              <th className="py-4 px-6 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500">Status</th>
              <th className="py-4 px-6 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[13px]">
            {variants.map((variant, index) => {
              const metadataEntries = Object.entries(variant.metadata || {});
              const displayPrice = variant.price ?? variant.productBasePrice;
              return (
                <tr
                  key={variant.id}
                  className="hover:bg-[#FAFAFA] transition-colors"
                  style={index !== variants.length - 1 ? { borderBottom: '1px solid #f9fafb' } : { borderBottom: 'none' }}
                >
                  <td className="py-4 px-6">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-100 bg-[#F8F6F4] shrink-0">
                      <VariantImage url={variant.imageUrl} name={variant.sku} />
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-[13px] font-mono font-medium text-gray-900">{variant.sku}</div>
                  </td>
                  <td className="py-4 px-6 text-[13px] text-gray-600">
                    {variant.productName || 'Unknown Product'}
                  </td>
                  <td className="py-4 px-6">
                    {displayPrice ? (
                      <div className="flex flex-col">
                        <span className="text-[14px] font-medium text-[#5433EB]">${Number(displayPrice).toFixed(2)}</span>
                        {!variant.price && <span className="text-[10px] text-gray-400">Inherited</span>}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                      variant.stock > 10 ? 'bg-[#F3F0FF] text-[#5433EB]' : variant.stock > 0 ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        variant.stock > 10 ? 'bg-[#5433EB]' : variant.stock > 0 ? 'bg-orange-500' : 'bg-red-500'
                      }`} />
                      {variant.stock} in stock
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {metadataEntries.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {metadataEntries.slice(0, 2).map(([key, value]) => (
                          <span key={key} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600 font-medium">
                            {key}: {String(value)}
                          </span>
                        ))}
                        {metadataEntries.length > 2 && (
                          <span className="text-[10px] text-gray-400">+{metadataEntries.length - 2}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-400 italic">None</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                      variant.isActive ? 'bg-[#F3F0FF] text-[#5433EB]' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${variant.isActive ? 'bg-[#5433EB]' : 'bg-gray-400'}`} />
                      {variant.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(variant)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#5433EB] hover:bg-[#F3F0FF] transition-colors cursor-pointer"
                        title="Edit Variant"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(variant)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Variant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}