'use client';

import { AlertTriangle, X, Loader2, Package } from 'lucide-react';

interface AffectedPackage {
  packageId: string;
  packageName: string;
  packageSlug: string;
}

interface ProductDeleteModalProps {
  product: { id: string; name: string } | null;
  isOpen: boolean;
  onClose: () => void;
  // Called first time
  onConfirm: (id: string) => Promise<void>;
  // Called when packages exist and user confirms force delete
  onForceConfirm?: (id: string) => Promise<void>;
  loading?: boolean;
  // Populated by parent when API returns 409
  affectedPackages?: AffectedPackage[] | null;
}

export default function ProductDeleteModal({
  product,
  isOpen,
  onClose,
  onConfirm,
  onForceConfirm,
  loading,
  affectedPackages,
}: ProductDeleteModalProps) {
  if (!isOpen || !product) return null;

  const hasPackages = affectedPackages && affectedPackages.length > 0;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-5">
        
        <div className="flex items-start justify-between">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
            hasPackages ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
          }`}>
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

        {!hasPackages ? (
          // === STAGE 1: Initial confirm ===
          <>
            <div>
              <h3 className="text-[18px] font-medium text-black">Delete Product</h3>
              <p className="text-[14px] text-gray-500 mt-2 leading-relaxed">
                Are you sure you want to delete{' '}
                <span className="font-medium text-black">"{product.name}"</span>?
                This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full text-[13px] font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => onConfirm(product.id)}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-[13px] font-medium transition-colors disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{loading ? 'Checking...' : 'Delete'}</span>
              </button>
            </div>
          </>
        ) : (
          // === STAGE 2: Warning about packages ===
          <>
            <div>
              <h3 className="text-[18px] font-medium text-black">
                This product is used in packages
              </h3>
              <p className="text-[14px] text-gray-500 mt-2 leading-relaxed">
                <span className="font-medium text-black">"{product.name}"</span> is part
                of {affectedPackages!.length} package{affectedPackages!.length > 1 ? 's' : ''}.
                If you delete it, the following will be <span className="font-medium text-orange-600">disabled</span>:
              </p>

              <div className="mt-3 max-h-40 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-2 space-y-1">
                {affectedPackages!.map((pkg) => (
                  <div key={pkg.packageId} className="flex items-center gap-2 px-2 py-1.5 text-[13px] text-gray-700">
                    <Package className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <span className="truncate">{pkg.packageName}</span>
                  </div>
                ))}
              </div>

              <p className="text-[12px] text-gray-400 mt-3">
                Packages can be re-enabled from the Packages page after you add a replacement product.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full text-[13px] font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => onForceConfirm?.(product.id)}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-full text-[13px] font-medium transition-colors disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{loading ? 'Deleting...' : 'Delete & Disable Packages'}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}