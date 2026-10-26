'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, X, Save, Package as PackageIcon } from 'lucide-react';
import PackageTable from '@/components/admin/packages/PackageTable';
import PackageAddForm, { PackageAddFormHandle } from '@/components/admin/packages/PackageAddForm';
import PackageDeleteModal from '@/components/admin/packages/PackageDeleteModal';
import { Loader } from '@/components/ui/Loader'; // <-- New Loader import

export default function PackagesSection() {
  const [packages, setPackages] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [deletePackage, setDeletePackage] = useState<any | null>(null);

  const addFormRef = useRef<PackageAddFormHandle>(null);
  const editFormRef = useRef<PackageAddFormHandle>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pkgRes, prodRes, varRes] = await Promise.all([
        fetch('/api/packages'),
        fetch('/api/products'),
        fetch('/api/variants'),
      ]);
      if (pkgRes.ok) setPackages(await pkgRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
      if (varRes.ok) setVariants(await varRes.json());
    } catch (err) {
      console.error('Failed to load packages section data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddSuccess = () => { fetchData(); setIsAddOpen(false); };
  const handleEditSuccess = () => { fetchData(); setEditOpen(false); setSelectedPackage(null); };

  return (
    <div className="space-y-6">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-medium text-black tracking-tight">Packages & Bundles</h1>
          <p className="text-[14px] text-gray-500 mt-1">Manage product bundles, offers, and package contents.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#5433EB] hover:bg-[#4524DB] text-white rounded-full font-medium text-[13px] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Package</span>
          </button>
        </div>
      </div>

      {/* Table */}
      {loading && packages.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white py-16 flex flex-col items-center justify-center gap-2 text-gray-400">
          <Loader />
          <p className="text-[13px]">Loading packages...</p>
        </div>
      ) : (
        <PackageTable
          packages={packages}
          onEdit={(pkg) => { setSelectedPackage(pkg); setEditOpen(true); }}
          onDelete={(pkg) => setDeletePackage(pkg)}
        />
      )}

      {/* === ADD MODAL === */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-gray-100 bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F3F0FF] flex items-center justify-center">
                  <PackageIcon className="w-5 h-5 text-[#5433EB]" />
                </div>
                <div>
                  <h3 className="text-[18px] font-medium text-black">Create New Package</h3>
                  <p className="text-[13px] text-gray-500">Bundle products into a new offer.</p>
                </div>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <PackageAddForm
                ref={addFormRef}
                onSuccess={handleAddSuccess}
                packageData={null}
                products={products}
                variants={variants}
              />
            </div>
            <div className="flex justify-end gap-3 px-6 sm:px-8 py-4 border-t border-gray-100 bg-white shrink-0">
              <button type="button" onClick={() => setIsAddOpen(false)} className="px-6 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full text-[13px] font-medium transition-colors">
                Cancel
              </button>
              <button type="button" onClick={() => addFormRef.current?.submit()} className="flex items-center gap-2 px-6 py-2.5 bg-[#5433EB] hover:bg-[#4524DB] text-white rounded-full text-[13px] font-medium transition-colors">
                <Plus className="w-4 h-4" />
                <span>Create Package</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === EDIT MODAL === */}
      {editOpen && selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-gray-100 bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F3F0FF] flex items-center justify-center">
                  <PackageIcon className="w-5 h-5 text-[#5433EB]" />
                </div>
                <div>
                  <h3 className="text-[18px] font-medium text-black">Edit Package</h3>
                  <p className="text-[13px] text-gray-500">{selectedPackage.name || 'Update bundle'}</p>
                </div>
              </div>
              <button onClick={() => { setEditOpen(false); setSelectedPackage(null); }} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <PackageAddForm
                ref={editFormRef}
                onSuccess={handleEditSuccess}
                packageData={selectedPackage}
                products={products}
                variants={variants}
              />
            </div>
            <div className="flex justify-end gap-3 px-6 sm:px-8 py-4 border-t border-gray-100 bg-white shrink-0">
              <button type="button" onClick={() => { setEditOpen(false); setSelectedPackage(null); }} className="px-6 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full text-[13px] font-medium transition-colors">
                Cancel
              </button>
              <button type="button" onClick={() => editFormRef.current?.submit()} className="flex items-center gap-2 px-6 py-2.5 bg-[#5433EB] hover:bg-[#4524DB] text-white rounded-full text-[13px] font-medium transition-colors">
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === DELETE MODAL === */}
      <PackageDeleteModal
        isOpen={!!deletePackage}
        onClose={() => setDeletePackage(null)}
        onSuccess={fetchData}
        packageData={deletePackage}
      />
    </div>
  );
}