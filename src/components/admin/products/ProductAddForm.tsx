'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Loader2, X, Trash2, Image as ImageIcon, Check, ChevronDown } from 'lucide-react';

// === CUSTOM DROPDOWN COMPONENT ===
function CustomSelect({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select option" 
}: { 
  value: string, 
  onChange: (val: string) => void, 
  options: { label: string, value: string }[], 
  placeholder?: string 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 bg-white border rounded-lg text-[13px] transition-colors focus:outline-none ${
          isOpen ? 'border-[#5433EB] ring-1 ring-[#5433EB]/20' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <span className={selected ? 'text-gray-900' : 'text-gray-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg z-50 overflow-hidden py-1">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2 text-[13px] text-left transition-colors ${
                value === option.value 
                  ? 'bg-[#F3F0FF] text-[#5433EB] font-medium' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-black'
              }`}
            >
              {option.label}
              {value === option.value && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface ProductAddFormProps {
  categories?: any[];
  onProductAdded: (newProduct: any) => void;
}

export default function ProductAddForm({ categories = [], onProductAdded }: ProductAddFormProps) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [weight, setWeight] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [dimUnit, setDimUnit] = useState('cm');
  const [seoMetaTitle, setSeoMetaTitle] = useState('');
  const [seoMetaDescription, setSeoMetaDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [metaKey, setMetaKey] = useState('');
  const [metaValue, setMetaValue] = useState('');
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const UNSUPPORTED_TYPES = ['image/heic', 'image/heif'];
  const ACCEPT_IMAGES = 'image/jpeg,image/png,image/webp,image/gif';

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    const generatedSlug = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setSlug(generatedSlug);
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && (UNSUPPORTED_TYPES.includes(file.type.toLowerCase()) || /\.(heic|heif)$/i.test(file.name))) {
      setError('HEIC/HEIF images are not supported by browsers. Please convert to JPG or PNG first.');
      e.target.value = '';
      return;
    }
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    const unsupported = filesArray.filter(
      (f) => UNSUPPORTED_TYPES.includes(f.type.toLowerCase()) || /\.(heic|heif)$/i.test(f.name)
    );
    if (unsupported.length > 0) {
      setError(`HEIC/HEIF images are not supported. Please convert to JPG or PNG first. Affected: ${unsupported.map(f => f.name).join(', ')}`);
      e.target.value = '';
      return;
    }
    setGalleryFiles((prev) => [...prev, ...filesArray]);
    setGalleryPreviews((prev) => [...prev, ...filesArray.map((f) => URL.createObjectURL(f))]);
  };

  const removeGalleryPreview = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('sku', sku);
      formData.append('slug', slug);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('costPrice', costPrice);
      formData.append('compareAtPrice', compareAtPrice);
      formData.append('stock', stock);
      formData.append('weight', weight);
      formData.append('dimensions', JSON.stringify({ 
        length: length ? Number(length) : undefined, 
        width: width ? Number(width) : undefined, 
        height: height ? Number(height) : undefined, 
        unit: dimUnit 
      }));
      formData.append('seoMetaTitle', seoMetaTitle);
      formData.append('seoMetaDescription', seoMetaDescription);
      formData.append('categoryId', categoryId || '');
      formData.append('isActive', String(isActive));
      formData.append('isFeatured', String(isFeatured));
      formData.append('metadata', JSON.stringify(metadata));
      
      if (imageFile) formData.append('image', imageFile);
      galleryFiles.forEach((file) => formData.append('gallery', file));

      const res = await fetch('/api/products', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create product');

      onProductAdded(data.product);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Prepare options for CustomSelect
  const categoryOptions = categories.map(c => ({ label: c.name, value: c.id }));
  const unitOptions = [
    { label: 'cm', value: 'cm' },
    { label: 'in', value: 'in' },
    { label: 'mm', value: 'mm' },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-8">
      
      {error && <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-[13px] rounded-xl">{error}</div>}

      {/* === BASIC INFO === */}
      <div className="space-y-4">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Basic Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2">
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Product Name *</label>
            <input type="text" value={name} onChange={handleNameChange} placeholder="e.g. Smart Watch" required className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-black focus:outline-none focus:border-[#5433EB] transition-colors" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">SKU</label>
            <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Auto-generate" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-black focus:outline-none focus:border-[#5433EB] transition-colors" />
          </div>
          <div className="md:col-span-3">
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Slug</label>
            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] font-mono text-gray-600 focus:outline-none" />
          </div>
        </div>
      </div>

      {/* === PRICING === */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Pricing & Inventory</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-5">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Price ($) *</label>
            <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#5433EB]" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Compare Price</label>
            <input type="number" step="0.01" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#5433EB]" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Cost Price</label>
            <input type="number" step="0.01" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#5433EB]" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Stock</label>
            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#5433EB]" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Category</label>
            <CustomSelect 
              value={categoryId} 
              onChange={setCategoryId} 
              options={categoryOptions} 
              placeholder="Select Category" 
            />
          </div>
        </div>
      </div>

      {/* === SHIPPING === */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Shipping & Dimensions</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-5">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Weight (kg)</label>
            <input type="number" step="0.001" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px]" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Length</label>
            <input type="number" value={length} onChange={(e) => setLength(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px]" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Width</label>
            <input type="number" value={width} onChange={(e) => setWidth(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px]" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Height</label>
            <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px]" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Unit</label>
            <CustomSelect 
              value={dimUnit} 
              onChange={setDimUnit} 
              options={unitOptions} 
              placeholder="Unit" 
            />
          </div>
        </div>
      </div>

      {/* === MEDIA === */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Media</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Main Product Image</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
              <input type="file" accept={ACCEPT_IMAGES} onChange={handleMainImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
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
                  <p className="text-[12px]">Click to upload main image</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Gallery Images</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative mb-3">
              <input type="file" accept={ACCEPT_IMAGES} multiple onChange={handleGalleryChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="flex flex-col items-center justify-center py-2 text-gray-500">
                <Plus className="w-5 h-5 mb-1" />
                <p className="text-[12px]">Click to upload multiple images</p>
              </div>
            </div>
            {galleryPreviews.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {galleryPreviews.map((src, index) => (
                  <div key={index} className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-200 group bg-white">
                    <img src={src} alt="Gallery" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeGalleryPreview(index)} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* === CONTENT & SEO === */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Description & SEO</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Description</label>
              <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] resize-none" />
            </div>
            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 text-[#5433EB] rounded border-gray-300" />
                <span className="text-[13px] font-medium text-gray-700">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 text-[#5433EB] rounded border-gray-300" />
                <span className="text-[13px] font-medium text-gray-700">Featured</span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1.5">SEO Meta Title <span className="text-gray-400">(60 chars)</span></label>
              <input type="text" maxLength={60} value={seoMetaTitle} onChange={(e) => setSeoMetaTitle(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px]" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1.5">SEO Meta Description <span className="text-gray-400">(160 chars)</span></label>
              <textarea maxLength={160} rows={2} value={seoMetaDescription} onChange={(e) => setSeoMetaDescription(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] resize-none" />
            </div>
          </div>
        </div>
      </div>

      {/* === METADATA === */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Custom Attributes</h4>
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="text" placeholder="Key (e.g. Material)" value={metaKey} onChange={(e) => setMetaKey(e.target.value)} className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] flex-1" />
          <input type="text" placeholder="Value (e.g. Cotton)" value={metaValue} onChange={(e) => setMetaValue(e.target.value)} className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] flex-1" />
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
      
      <button type="submit" form="add-product-form" className="hidden" onClick={handleSubmit} />
    </div>
  );
}