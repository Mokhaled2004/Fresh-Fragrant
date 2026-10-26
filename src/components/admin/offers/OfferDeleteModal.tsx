'use client';

import { AlertTriangle, X } from 'lucide-react';

interface OfferDeleteModalProps {
  isOpen: boolean;
  offer: any | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
  loading: boolean;
}

export default function OfferDeleteModal({ isOpen, offer, onClose, onConfirm, loading }: OfferDeleteModalProps) {
  if (!isOpen || !offer) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-5">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 -mr-1 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div>
          <h3 className="text-[18px] font-medium text-black">Delete Offer</h3>
          <p className="text-[14px] text-gray-500 mt-2 leading-relaxed">
            Are you sure you want to delete <span className="font-medium text-black">{offer.name}</span>?
            This action cannot be undone.
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <button onClick={onClose} disabled={loading} className="px-5 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full text-[13px] font-medium transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={() => onConfirm(offer.id)} disabled={loading} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-[13px] font-medium transition-colors disabled:opacity-50">
            {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            <span>{loading ? 'Deleting...' : 'Delete Offer'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}