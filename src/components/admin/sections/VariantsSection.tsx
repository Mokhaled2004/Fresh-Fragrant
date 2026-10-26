'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, X, Save, Search, Package } from 'lucide-react';
import VariantTable from '@/components/admin/variants/VariantTable';
import VariantAddForm, { VariantAddFormHandle } from '@/components/admin/variants/VariantAddForm';
import VariantDeleteModal from '@/components/admin/variants/VariantDeleteModal';
import { Loader } from '@/components/ui/Loader'; // <-- New Loader import

export default function VariantsSection() {
  const [variants, setVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [variantToEdit, setVariantToEdit] = useState<any | null>(null);
  const [variantToDelete, setVariantToDelete] = useState<any | null>(null);

  const addFormRef = useRef<VariantAddFormHandle>(null);
  const editFormRef = useRef<VariantAddFormHandle>(null);

  const fetchVariants = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/variants');
      const data = await res.json();
      if (Array.isArray(data)) setVariants(data);
    } catch (err) {
      console.error('Failed to fetch variants', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVariants(); }, []);

  const filteredVariants = variants.filter((v) =>
    v.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.productName && v.productName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddSuccess = () => {
    fetchVariants();
    setIsAddOpen(false);
  };

  const handleEditSuccess = () => {
    fetchVariants();
    setEditOpen(false);
    setVariantToEdit(null);
  };

  return (
    <div className="space-y-6">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-medium text-black tracking-tight">Product Variants</h1>
          <p className="text-[14px] text-gray-500 mt-1">Manage custom attributes, pricing, and stock for product options.</p>
        </div>
        <button
          onClick={() => { setVariantToEdit(null); setIsAddOpen(true); }}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#5433EB] hover:bg-[#4524DB] text-white rounded-full font-medium text-[13px] transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Variant</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by SKU or product name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-[13px] focus:outline-none focus:border-[#5433EB]"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white py-16 flex flex-col items-center justify-center gap-2 text-gray-400">
          <Loader />
          <p className="text-[13px]">Loading variants...</p>
        </div>
      ) : (
        <VariantTable
          variants={filteredVariants}
          onEdit={(variant) => { setVariantToEdit(variant); setEditOpen(true); }}
          onDelete={(variant) => setVariantToDelete(variant)}
        />
      )}

      {/* === ADD MODAL === */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-gray-100 bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F3F0FF] flex items-center justify-center">
                  <Package className="w-5 h-5 text-[#5433EB]" />
                </div>
                <div>
                  <h3 className="text-[18px] font-medium text-black">Add New Variant</h3>
                  <p className="text-[13px] text-gray-500">Create a new product variant.</p>
                </div>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <VariantAddForm ref={addFormRef} onSuccess={handleAddSuccess} variantToEdit={null} />
            </div>
            <div className="flex justify-end gap-3 px-6 sm:px-8 py-4 border-t border-gray-100 bg-white shrink-0">
              <button type="button" onClick={() => setIsAddOpen(false)} className="px-6 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full text-[13px] font-medium transition-colors">
                Cancel
              </button>
              <button type="button" onClick={() => addFormRef.current?.submit()} className="flex items-center gap-2 px-6 py-2.5 bg-[#5433EB] hover:bg-[#4524DB] text-white rounded-full text-[13px] font-medium transition-colors">
                <Plus className="w-4 h-4" />
                <span>Create Variant</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === EDIT MODAL === */}
      {editOpen && variantToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-gray-100 bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F3F0FF] flex items-center justify-center">
                  <Package className="w-5 h-5 text-[#5433EB]" />
                </div>
                <div>
                  <h3 className="text-[18px] font-medium text-black">Edit Variant</h3>
                  <p className="text-[13px] text-gray-500">{variantToEdit.sku || 'Update variant'}</p>
                </div>
              </div>
              <button onClick={() => { setEditOpen(false); setVariantToEdit(null); }} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <VariantAddForm ref={editFormRef} onSuccess={handleEditSuccess} variantToEdit={variantToEdit} />
            </div>
            <div className="flex justify-end gap-3 px-6 sm:px-8 py-4 border-t border-gray-100 bg-white shrink-0">
              <button type="button" onClick={() => { setEditOpen(false); setVariantToEdit(null); }} className="px-6 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full text-[13px] font-medium transition-colors">
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
      <VariantDeleteModal
        isOpen={!!variantToDelete}
        onClose={() => setVariantToDelete(null)}
        onSuccess={fetchVariants}
        variant={variantToDelete}
      />
    </div>
  );
}