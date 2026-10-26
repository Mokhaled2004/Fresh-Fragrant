'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, X, Loader2, Trash2, Unlink } from 'lucide-react';

type DeleteMode = 'delete-products' | 'unassign-products';

interface CategoryDeleteModalProps {
  category: { id: string; name: string } | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string, mode: DeleteMode) => Promise<void>;
  loading?: boolean;
}

export default function CategoryDeleteModal({
  category,
  isOpen,
  onClose,
  onConfirm,
  loading,
}: CategoryDeleteModalProps) {
  const [mode, setMode] = useState<DeleteMode>('unassign-products');
  const [productCount, setProductCount] = useState<number | null>(null);
  const [countLoading, setCountLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !category) {
      setProductCount(null);
      setMode('unassign-products');
      return;
    }
    setCountLoading(true);
    fetch(`/api/products?categoryId=${category.id}`)
      .then((r) => r.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : data.products ?? [];
        setProductCount(arr.length);
      })
      .catch(() => setProductCount(null))
      .finally(() => setCountLoading(false));
  }, [isOpen, category?.id]);

  if (!isOpen || !category) return null;

  const hasProducts = productCount !== null && productCount > 0;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 p-1 -mr-1 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-[18px] font-medium text-black">Delete Category</h3>
          <p className="text-[14px] text-gray-500 mt-1 leading-relaxed">
            You're about to delete{' '}
            <span className="font-medium text-black">"{category.name}"</span>.
          </p>
        </div>

        {/* Product count warning */}
        {countLoading ? (
          <div className="flex items-center gap-2 text-gray-400 text-[13px]">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Checking products...</span>
          </div>
        ) : hasProducts ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[13px] text-amber-700 leading-relaxed">
            ⚠️ This category has <span className="font-semibold">{productCount} product{productCount !== 1 ? 's' : ''}</span>. Choose what to do with them:
          </div>
        ) : (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-500">
            No products are assigned to this category.
          </div>
        )}

        {/* Mode selection — only shown when there are products */}
        {hasProducts && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setMode('unassign-products')}
              className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-colors ${
                mode === 'unassign-products'
                  ? 'border-[#5433EB] bg-[#F3F0FF]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Unlink className={`w-5 h-5 mt-0.5 shrink-0 ${mode === 'unassign-products' ? 'text-[#5433EB]' : 'text-gray-400'}`} />
              <div>
                <p className={`text-[13px] font-medium ${mode === 'unassign-products' ? 'text-[#5433EB]' : 'text-gray-700'}`}>
                  Keep products, remove category
                </p>
                <p className="text-[12px] text-gray-500 mt-0.5">
                  Products remain in the store but will have no category assigned.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMode('delete-products')}
              className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-colors ${
                mode === 'delete-products'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Trash2 className={`w-5 h-5 mt-0.5 shrink-0 ${mode === 'delete-products' ? 'text-red-600' : 'text-gray-400'}`} />
              <div>
                <p className={`text-[13px] font-medium ${mode === 'delete-products' ? 'text-red-600' : 'text-gray-700'}`}>
                  Delete category and all products
                </p>
                <p className="text-[12px] text-gray-500 mt-0.5">
                  Permanently removes the category and all {productCount} product{productCount !== 1 ? 's' : ''} (including their variants).
                </p>
              </div>
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full text-[13px] font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(category.id, mode)}
            disabled={loading || countLoading}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 text-white rounded-full text-[13px] font-medium transition-colors disabled:opacity-50 ${
              mode === 'delete-products'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[#5433EB] hover:bg-[#4524DB]'
            }`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>
              {loading
                ? 'Deleting...'
                : mode === 'delete-products'
                ? 'Delete All'
                : 'Delete Category'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
