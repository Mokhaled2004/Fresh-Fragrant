'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, X, Loader2, Save, FolderTree } from 'lucide-react';
import CategoryAddForm, { CategoryAddFormHandle } from '../categories/CategoryAddForm';
import CategoryTable from '../categories/CategoryTable';
import CategoryDeleteModal from '../categories/CategoryDeleteModal';
import { Loader } from '@/components/ui/Loader'; // <-- New Loader import
import CustomSelect from '@/components/ui/CustomSelect';

export default function CategoriesSection() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const categoryFormRef = useRef<CategoryAddFormHandle>(null);

  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editParentId, setEditParentId] = useState('');
  const [editDisplayOrder, setEditDisplayOrder] = useState('0');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
        else if (data.categories && Array.isArray(data.categories)) setCategories(data.categories);
      })
      .catch((err) => console.error('Failed to load categories', err))
      .finally(() => setLoading(false));
  }, []);

  const handleCategoryAdded = (newCat: any) => {
    setCategories((prev) => [newCat, ...prev]);
    setIsAddFormOpen(false);
  };

  const handleEditClick = (cat: any) => {
    setSelectedCategory(cat);
    setEditName(cat.name || '');
    setEditSlug(cat.slug || '');
    setEditDescription(cat.description || '');
    setEditParentId(cat.parentCategoryId || '');
    setEditDisplayOrder(String(cat.displayOrder ?? 0));
    setEditIsActive(cat.isActive ?? true);
    setEditError('');
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    setEditLoading(true);
    setEditError('');
    try {
      const res = await fetch(`/api/categories/${selectedCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          slug: editSlug,
          description: editDescription,
          parentCategoryId: editParentId || null,
          displayOrder: Number(editDisplayOrder),
          isActive: editIsActive,
        }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.error || 'Failed to update category');
      setCategories((prev) =>
        prev.map((c) => (c.id === selectedCategory.id ? data.category || { ...c, name: editName, slug: editSlug } : c))
      );
      setEditModalOpen(false);
      setSelectedCategory(null);
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteConfirm = async (id: string, mode: 'delete-products' | 'unassign-products') => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/categories/${id}?mode=${mode}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete category');
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      setDeleteModalOpen(false);
      setSelectedCategory(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const parentOptions = [
    { label: 'None (Top-Level Category)', value: '' },
    ...categories.filter((c) => c.id !== selectedCategory?.id).map((c) => ({ label: c.name, value: c.id })),
  ];

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
          <h1 className="text-[28px] font-medium text-black tracking-tight">Categories Management</h1>
          <p className="text-[14px] text-gray-500 mt-1">Organize store categories and manage folder image uploads.</p>
        </div>
        <button
          onClick={() => setIsAddFormOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#5433EB] hover:bg-[#4524DB] text-white rounded-full font-medium text-[13px] transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Table / Loader */}
      {loading ? (
        <div className="w-full h-[400px] bg-white rounded-[24px] border border-gray-100 flex items-center justify-center">
          <Loader variant="inline" text="Loading categories..." />
        </div>
      ) : (
        <CategoryTable
          categories={categories}
          onEditClick={handleEditClick}
          onDeleteClick={(cat) => { setSelectedCategory(cat); setDeleteModalOpen(true); }}
        />
      )}

      {/* === ADD MODAL === */}
      {isAddFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-gray-100 bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F3F0FF] flex items-center justify-center">
                  <FolderTree className="w-5 h-5 text-[#5433EB]" />
                </div>
                <div>
                  <h3 className="text-[18px] font-medium text-black">Add New Category</h3>
                  <p className="text-[13px] text-gray-500">Create a new store category.</p>
                </div>
              </div>
              <button onClick={() => setIsAddFormOpen(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <CategoryAddForm ref={categoryFormRef} categories={categories} onCategoryAdded={handleCategoryAdded} />
            </div>
            <div className="flex justify-end gap-3 px-6 sm:px-8 py-4 border-t border-gray-100 bg-white shrink-0">
              <button type="button" onClick={() => setIsAddFormOpen(false)} className="px-6 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full text-[13px] font-medium transition-colors">
                Cancel
              </button>
              <button type="button" onClick={() => categoryFormRef.current?.submit()} className="flex items-center gap-2 px-6 py-2.5 bg-[#5433EB] hover:bg-[#4524DB] text-white rounded-full text-[13px] font-medium transition-colors">
                <Plus className="w-4 h-4" />
                <span>Create Category</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === EDIT MODAL === */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-gray-100 bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F3F0FF] flex items-center justify-center">
                  <FolderTree className="w-5 h-5 text-[#5433EB]" />
                </div>
                <div>
                  <h3 className="text-[18px] font-medium text-black">Edit Category</h3>
                  <p className="text-[13px] text-gray-500">{editName || 'Update category'}</p>
                </div>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-6">
              {editError && <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-[13px] rounded-xl">{editError}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Category Name *</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#5433EB]" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Slug</label>
                  <input type="text" value={editSlug} onChange={(e) => setEditSlug(e.target.value)} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] font-mono text-gray-600 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Parent Category</label>
                  <CustomSelect value={editParentId} onChange={setEditParentId} options={parentOptions} placeholder="None (Top-Level)" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Display Order</label>
                  <input type="number" value={editDisplayOrder} onChange={(e) => setEditDisplayOrder(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#5433EB]" />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Description</label>
                <textarea rows={3} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] resize-none" />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" checked={editIsActive} onChange={(e) => setEditIsActive(e.target.checked)} className="w-4 h-4 text-[#5433EB] rounded border-gray-300" />
                <span className="text-[13px] font-medium text-gray-700">Is Active</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 sm:px-8 py-4 border-t border-gray-100 bg-white shrink-0">
              <button type="button" onClick={() => setEditModalOpen(false)} className="px-6 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full text-[13px] font-medium transition-colors">Cancel</button>
              <button type="submit" onClick={handleEditSubmit} disabled={editLoading} className="flex items-center gap-2 px-6 py-2.5 bg-[#5433EB] hover:bg-[#4524DB] text-white rounded-full text-[13px] font-medium transition-colors disabled:opacity-50">
                {editLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{editLoading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === DELETE MODAL === */}
      <CategoryDeleteModal
        isOpen={deleteModalOpen}
        category={selectedCategory}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
}