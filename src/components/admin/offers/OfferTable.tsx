'use client';

import { Edit3, Trash2, Tag } from 'lucide-react';
import { Loader } from '@/components/ui/Loader'; // <-- New Loader import

interface OfferTableProps {
  offers: any[];
  loading?: boolean; // optional — pass from parent if you want a loading state
  onEditClick: (offer: any) => void;
  onDeleteClick: (offer: any) => void;
}

export default function OfferTable({ offers, loading = false, onEditClick, onDeleteClick }: OfferTableProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white py-16 flex flex-col items-center justify-center gap-2 text-gray-400">
        <Loader />
        <span className="text-[13px]">Loading offers...</span>
      </div>
    );
  }

  if (!offers || offers.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-[#F8F6F4] flex items-center justify-center mx-auto mb-4">
          <Tag className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-[14px] font-medium text-gray-900 mb-1">No offers yet</p>
        <p className="text-[12px] text-gray-500">Create your first offer to get started.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left border-none">
          <thead>
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              <th className="py-4 px-6 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500">Offer</th>
              <th className="py-4 px-6 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500">Type</th>
              <th className="py-4 px-6 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500">Schedule</th>
              <th className="py-4 px-6 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500">Status</th>
              <th className="py-4 px-6 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[13px]">
            {offers.map((offer, index) => (
              <tr
                key={offer.id}
                className="hover:bg-[#FAFAFA] transition-colors"
                style={index !== offers.length - 1 ? { borderBottom: '1px solid #f9fafb' } : { borderBottom: 'none' }}
              >
                <td className="py-4 px-6">
                  <div className="text-[14px] font-medium text-gray-900">{offer.name}</div>
                  {offer.couponCode && (
                    <div className="text-[11px] font-mono text-[#5433EB] mt-0.5">Code: {offer.couponCode}</div>
                  )}
                </td>
                <td className="py-4 px-6">
                  <div className="text-[13px] text-gray-700 capitalize">{String(offer.type).replaceAll('_', ' ')}</div>
                  {offer.value != null && (
                    <div className="text-[11px] text-gray-400">
                      {offer.type === 'percentage' ? `${offer.value}%` : `$${offer.value}`}
                    </div>
                  )}
                </td>
                <td className="py-4 px-6">
                  <div className="text-[12px] text-gray-600">
                    {offer.startAt ? new Date(offer.startAt).toLocaleDateString() : 'Any start'}
                  </div>
                  <div className="text-[11px] text-gray-400">
                    {offer.endAt ? `Until ${new Date(offer.endAt).toLocaleDateString()}` : 'No deadline'}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                    offer.isActive ? 'bg-[#F3F0FF] text-[#5433EB]' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${offer.isActive ? 'bg-[#5433EB]' : 'bg-gray-400'}`} />
                    {offer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEditClick(offer)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#5433EB] hover:bg-[#F3F0FF] transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteClick(offer)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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