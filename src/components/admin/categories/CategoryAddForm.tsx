'use client';

import { useState, useImperativeHandle, forwardRef } from 'react';
import { X, ImageIcon } from 'lucide-react';
import CustomSelect from '@/components//ui/CustomSelect';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  parentCategoryId?: string | null;
  displayOrder: number;
  isActive: boolean;
  metadata: Record<string, unknown>;
}

export interface CategoryAddFormHandle {
  submit: () => void;
}

interface CategoryAddFormProps {
  categories?: Category[];
  onCategoryAdded: (newCategory: any) => void;
}

const CategoryAddForm = forwardRef<CategoryAddFormHandle, CategoryAddFormProps>(function CategoryAddForm(
  { categories = [], onCategoryAdded },
  ref
) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [metaKey, setMetaKey] = useState('');
  const [metaValue, setMetaValue] = useState('');
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleAddMetadata = () => {
    if (!metaKey.trim()) return;
    setMetadata({ ...metadata, [metaKey.trim()]: metaValue });
    setMetaKey('');
    setMetaValue('');
  };

  const handleRemoveMetadata = (keyToRemove: string) => {
    const updated = { ...metadata };
    delete updated[keyToRemove];
    setMetadata(updated);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('slug', slug);
      formData.append('description', description);
      formData.append('parentCategoryId', parentCategoryId || '');
      formData.append('displayOrder', displayOrder);
      formData.append('isActive', String(isActive));
      formData.append('metadata', JSON.stringify(metadata));
      if (imageFile) formData.append('image', imageFile);

      const res = await fetch('/api/categories', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create category');

      onCategoryAdded(data.category);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    submit: () => { handleSubmit(); },
  }));

  const parentOptions = [
    { label: 'None (Top-Level Category)', value: '' },
    ...categories.map((c) => ({ label: c.name, value: c.id })),
  ];

  return (
    <form id="add-category-form" onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
      {error && <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-[13px] rounded-xl">{error}</div>}

      {/* Basic Info */}
      <div className="space-y-4">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Basic Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Category Name *</label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="e.g. Skincare"
              required
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-black focus:outline-none focus:border-[#5433EB] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Slug (auto-generated)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] font-mono text-gray-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Organization */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Organization</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Parent Category</label>
            <CustomSelect
              value={parentCategoryId}
              onChange={setParentCategoryId}
              options={parentOptions}
              placeholder="None (Top-Level)"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Display Order</label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#5433EB]"
            />
          </div>
          <div className="flex items-end pb-2.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-[#5433EB] rounded border-gray-300"
              />
              <span className="text-[13px] font-medium text-gray-700">Is Active</span>
            </label>
          </div>
        </div>
      </div>

      {/* Image & Description */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Media & Description</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Category Image</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
              <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              {imagePreview ? (
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-white">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[13px] font-medium text-gray-700">Click to change</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-gray-500">
                  <ImageIcon className="w-6 h-6 mb-2" />
                  <p className="text-[12px]">Click to upload image</p>
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description..."
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] resize-none"
            />
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Custom Attributes</h4>
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="text" placeholder="Key" value={metaKey} onChange={(e) => setMetaKey(e.target.value)} className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] flex-1" />
          <input type="text" placeholder="Value" value={metaValue} onChange={(e) => setMetaValue(e.target.value)} className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] flex-1" />
          <button type="button" onClick={handleAddMetadata} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-[13px] font-medium transition-colors">
            Add
          </button>
        </div>
        {Object.keys(metadata).length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {Object.entries(metadata).map(([k, v]) => (
              <div key={k} className="flex items-center gap-2 bg-[#F3F0FF] text-[#5433EB] px-3 py-1.5 rounded-lg text-[12px] font-medium">
                <span>{k}:</span><span className="opacity-75">{String(v)}</span>
                <button type="button" onClick={() => handleRemoveMetadata(k)} className="hover:text-red-500 ml-1"><X className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </form>
  );
});

export default CategoryAddForm;
