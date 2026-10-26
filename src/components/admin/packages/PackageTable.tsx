'use client';

import { Edit3, Trash2, Star, Package as PackageIcon, Eye, EyeOff } from 'lucide-react';
import { Loader } from '@/components/ui/Loader'; // <-- New Loader import

interface PackageTableProps {
  packages: any[];
  loading?: boolean; // optional — pass from parent if you want a loading state
  onEdit: (pkg: any) => void;
  onDelete: (pkg: any) => void;
}

export default function PackageTable({ packages, loading = false, onEdit, onDelete }: PackageTableProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white py-16 flex flex-col items-center justify-center gap-2 text-gray-400">
        <Loader />
        <span className="text-[13px]">Loading packages...</span>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-[#F8F6F4] flex items-center justify-center mx-auto mb-4">
          <PackageIcon className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-[14px] font-medium text-gray-900 mb-1">No packages yet</p>
        <p className="text-[12px] text-gray-500">Create your first bundle to get started.</p>
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
              <th className="py-4 px-6 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500">Package</th>
              <th className="py-4 px-6 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500">Pricing</th>
              <th className="py-4 px-6 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500">Items</th>
              <th className="py-4 px-6 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500">Status</th>
              <th className="py-4 px-6 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[13px]">
            {packages.map((pkg, index) => {
              const items = pkg.items || [];
              return (
                <tr
                  key={pkg.id}
                  className="hover:bg-[#FAFAFA] transition-colors"
                  style={index !== packages.length - 1 ? { borderBottom: '1px solid #f9fafb' } : { borderBottom: 'none' }}
                >
                  <td className="py-4 px-6">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-100 bg-[#F8F6F4] flex items-center justify-center shrink-0">
                      {pkg.imageUrl ? (
                        <img src={pkg.imageUrl} alt={pkg.name} className="w-full h-full object-cover" />
                      ) : (
                        <PackageIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 text-[14px] font-medium text-gray-900 leading-snug">
                      {pkg.name}
                      {pkg.isFeatured && <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />}
                    </div>
                    <div className="text-[11px] font-mono text-gray-400 mt-0.5">/{pkg.slug}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium text-[#5433EB]">${Number(pkg.offeredPrice).toFixed(2)}</span>
                      {pkg.originalPrice && Number(pkg.originalPrice) > Number(pkg.offeredPrice) && (
                        <span className="text-[11px] text-gray-400 line-through">${Number(pkg.originalPrice).toFixed(2)}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {items.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {items.slice(0, 2).map((item: any) => (
                          <span key={item.id || item.productId} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600 font-medium">
                            {item.quantity}x {item.productName || 'Product'}
                          </span>
                        ))}
                        {items.length > 2 && (
                          <span className="text-[10px] text-gray-400">+{items.length - 2}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-400 italic">None</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                        pkg.isActive ? 'bg-[#F3F0FF] text-[#5433EB]' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {pkg.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {pkg.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(pkg)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#5433EB] hover:bg-[#F3F0FF] transition-colors"
                        title="Edit Package"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(pkg)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Package"
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