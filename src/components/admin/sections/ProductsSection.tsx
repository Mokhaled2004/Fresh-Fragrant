'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, X, Trash2, PackageX, Edit3, Save, Package, Check, ChevronDown, Image as ImageIcon } from 'lucide-react';
import ProductAddForm from '../products/ProductAddForm';
import ProductTable from '../products/ProductTable';
import ProductDeleteModal from '../products/ProductDeleteModal';
import { Loader } from '@/components/ui/Loader'; // <-- New Loader import

// === GALLERY THUMBNAIL ===
function GalleryThumb({ src, onRemove, borderClass }: { src: string; onRemove: () => void; borderClass: string }) {
  const [broken, setBroken] = useState(false);
  const isHeic = /\.(heic|heif)$/i.test(src);
  const showBroken = broken || isHeic;
  return (
    <div className={`relative w-14 h-14 rounded-lg overflow-hidden ${borderClass} group bg-white shrink-0`}>
      {showBroken ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 gap-0.5" title={isHeic ? 'HEIC not supported — click × to remove' : 'Image not found — click × to remove'}>
          <ImageIcon className="w-4 h-4" />
          {isHeic && <span className="text-[8px] font-medium leading-none text-orange-400">HEIC</span>}
        </div>
      ) : (
        <img src={src} alt="Gallery" className="w-full h-full object-cover" onError={() => setBroken(true)} />
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

// === CUSTOM DROPDOWN ===
function CustomSelect({
  value, onChange, options, placeholder = "Select option"
}: { value: string; onChange: (val: string) => void; options: { label: string; value: string }[]; placeholder?: string; }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
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
              onClick={() => { onChange(option.value); setIsOpen(false); }}
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

export default function ProductsSection() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [affectedPackages, setAffectedPackages] = useState<any[] | null>(null);

  // Edit Form States
  const [editName, setEditName] = useState('');
  const [editSku, setEditSku] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCostPrice, setEditCostPrice] = useState('');
  const [editCompareAtPrice, setEditCompareAtPrice] = useState('');
  const [editStock, setEditStock] = useState('0');
  const [editWeight, setEditWeight] = useState('');
  const [editLength, setEditLength] = useState('');
  const [editWidth, setEditWidth] = useState('');
  const [editHeight, setEditHeight] = useState('');
  const [editDimUnit, setEditDimUnit] = useState('cm');
  const [editSeoMetaTitle, setEditSeoMetaTitle] = useState('');
  const [editSeoMetaDescription, setEditSeoMetaDescription] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editGalleryFiles, setEditGalleryFiles] = useState<File[]>([]);
  const [editGalleryPreviews, setEditGalleryPreviews] = useState<string[]>([]);
  const [editExistingGallery, setEditExistingGallery] = useState<string[]>([]);
  const [removedGalleryUrls, setRemovedGalleryUrls] = useState<string[]>([]);
  const [editMetaKey, setEditMetaKey] = useState('');
  const [editMetaValue, setEditMetaValue] = useState('');
  const [editMetadata, setEditMetadata] = useState<Record<string, string>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/products').then((res) => res.json()),
      fetch('/api/categories').then((res) => res.json())
    ])
      .then(([prodData, catData]) => {
        if (Array.isArray(prodData)) setProducts(prodData);
        if (Array.isArray(catData)) setCategories(catData);
      })
      .catch((err) => console.error('Failed to load', err))
      .finally(() => setLoading(false));
  }, []);

  const handleProductAdded = (newProd: any) => {
    setProducts((prev) => [newProd, ...prev]);
    setIsAddFormOpen(false);
  };

  const handleEditClick = (prod: any) => {
    setSelectedProduct(prod);
    setEditName(prod.name || '');
    setEditSku(prod.sku || '');
    setEditSlug(prod.slug || '');
    setEditDescription(prod.description || '');
    setEditPrice(String(prod.price ?? ''));
    setEditCostPrice(String(prod.costPrice ?? ''));
    setEditCompareAtPrice(String(prod.compareAtPrice ?? ''));
    setEditStock(String(prod.stock ?? '0'));
    setEditWeight(String(prod.weight ?? ''));
    setEditLength(String(prod.dimensions?.length ?? ''));
    setEditWidth(String(prod.dimensions?.width ?? ''));
    setEditHeight(String(prod.dimensions?.height ?? ''));
    setEditDimUnit(prod.dimensions?.unit || 'cm');
    setEditSeoMetaTitle(prod.seoMetaTitle || '');
    setEditSeoMetaDescription(prod.seoMetaDescription || '');
    setEditCategoryId(prod.categoryId || '');
    setEditIsActive(prod.isActive ?? true);
    setEditIsFeatured(prod.isFeatured ?? false);
    setEditImageUrl(prod.imageUrl || '');
    setEditImagePreview(prod.imageUrl || null);
    setEditImageFile(null);
    const rawGallery = prod.galleryUrls || prod.gallery || prod.images || prod.galleryImages || [];
    setEditExistingGallery(Array.isArray(rawGallery) ? rawGallery : []);
    setRemovedGalleryUrls([]);
    setEditGalleryFiles([]);
    setEditGalleryPreviews([]);
    setEditMetadata(prod.metadata || {});
    setEditError('');
    setEditModalOpen(true);
  };

  const UNSUPPORTED_TYPES = ['image/heic', 'image/heif'];
  const ACCEPT_IMAGES = 'image/jpeg,image/png,image/webp,image/gif';

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    if (UNSUPPORTED_TYPES.includes(file.type.toLowerCase()) || /\.(heic|heif)$/i.test(file.name)) {
      setEditError('HEIC/HEIF images are not supported by browsers. Please convert to JPG or PNG first.');
      e.target.value = '';
      return;
    }
    setEditImageFile(file);
    if (file) setEditImagePreview(URL.createObjectURL(file));
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    const unsupported = filesArray.filter(
      (f) => UNSUPPORTED_TYPES.includes(f.type.toLowerCase()) || /\.(heic|heif)$/i.test(f.name)
    );
    if (unsupported.length > 0) {
      setEditError(`HEIC/HEIF images are not supported by browsers. Please convert to JPG or PNG first. Affected: ${unsupported.map(f => f.name).join(', ')}`);
      e.target.value = '';
      return;
    }
    const valid = filesArray.filter(
      (f) => !UNSUPPORTED_TYPES.includes(f.type.toLowerCase()) && !/\.(heic|heif)$/i.test(f.name)
    );
    setEditGalleryFiles((prev) => [...prev, ...valid]);
    setEditGalleryPreviews((prev) => [...prev, ...valid.map((file) => URL.createObjectURL(file))]);
  };

  const removeNewGalleryPreview = (index: number) => {
    setEditGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setEditGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingGalleryItem = (index: number) => {
    const urlToRemove = editExistingGallery[index];
    setRemovedGalleryUrls((prev) => [...prev, urlToRemove]);
    setEditExistingGallery((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddMetadata = () => {
    if (!editMetaKey.trim()) return;
    setEditMetadata({ ...editMetadata, [editMetaKey.trim()]: editMetaValue });
    setEditMetaKey('');
    setEditMetaValue('');
  };

  const handleRemoveMetadata = (keyToRemove: string) => {
    const updated = { ...editMetadata };
    delete updated[keyToRemove];
    setEditMetadata(updated);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setEditLoading(true);
    setEditError('');

    try {
      const formData = new FormData();
      formData.append('name', editName);
      formData.append('sku', editSku);
      formData.append('slug', editSlug);
      formData.append('description', editDescription);
      formData.append('price', editPrice);
      formData.append('costPrice', editCostPrice);
      formData.append('compareAtPrice', editCompareAtPrice);
      formData.append('stock', editStock);
      formData.append('weight', editWeight);
      formData.append('dimensions', JSON.stringify({
        length: editLength ? Number(editLength) : undefined,
        width: editWidth ? Number(editWidth) : undefined,
        height: editHeight ? Number(editHeight) : undefined,
        unit: editDimUnit,
      }));
      formData.append('seoMetaTitle', editSeoMetaTitle);
      formData.append('seoMetaDescription', editSeoMetaDescription);
      formData.append('categoryId', editCategoryId || '');
      formData.append('isActive', String(editIsActive));
      formData.append('isFeatured', String(editIsFeatured));
      formData.append('metadata', JSON.stringify(editMetadata));
      formData.append('removedGalleryUrls', JSON.stringify(removedGalleryUrls));

      if (editImageFile) formData.append('image', editImageFile);
      else if (editImageUrl) formData.append('imageUrl', editImageUrl);

      editGalleryFiles.forEach((file) => formData.append('gallery', file));

      const res = await fetch(`/api/products/${selectedProduct.id}`, { method: 'PUT', body: formData });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.error || 'Failed to update product');

      setProducts((prev) => prev.map((p) => (p.id === selectedProduct.id ? data.product || { ...p, name: editName, sku: editSku, price: Number(editPrice) } : p)));
      setEditModalOpen(false);
      setSelectedProduct(null);
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  // === DELETE FLOW ===
  // Step 1: try normal delete. If 409 with packages → show stage 2.
  const handleDeleteConfirm = async (id: string) => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (res.status === 409 && data.error === 'PRODUCT_IN_PACKAGES') {
        // Show stage 2 confirmation with package list
        setAffectedPackages(data.packages || []);
        return;
      }

      if (!res.ok) throw new Error(data.error || 'Failed to delete product');

      // Success (no packages or force deleted)
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeleteModalOpen(false);
      setAffectedPackages(null);
      setSelectedProduct(null);

      // Optional: alert about disabled packages
      if (data.disabledPackages && data.disabledPackages.length > 0) {
        // Could show a toast here if you have one
        console.log(`Disabled ${data.disabledPackages.length} package(s)`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Step 2: user confirmed force delete after seeing package list
  const handleForceDeleteConfirm = async (id: string) => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/products/${id}?force=true`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete product');

      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeleteModalOpen(false);
      setAffectedPackages(null);
      setSelectedProduct(null);

      if (data.disabledPackages && data.disabledPackages.length > 0) {
        console.log(`Disabled ${data.disabledPackages.length} package(s)`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const categoryOptions = categories.map(c => ({ label: c.name, value: c.id }));
  const unitOptions = [
    { label: 'cm', value: 'cm' },
    { label: 'in', value: 'in' },
    { label: 'mm', value: 'mm' },
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
          <h1 className="text-[28px] font-medium text-black tracking-tight">Products Management</h1>
          <p className="text-[14px] text-gray-500 mt-1">Manage inventory, store offerings, pricing, and specs.</p>
        </div>
        <button
          onClick={() => setIsAddFormOpen(!isAddFormOpen)}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#5433EB] hover:bg-[#4524DB] text-white rounded-full font-medium text-[13px] transition-colors cursor-pointer"
        >
          {isAddFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isAddFormOpen ? 'Close Form' : 'Add Product'}</span>
        </button>
      </div>

      {/* Table or Loader or Empty */}
      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white py-16 flex flex-col items-center justify-center gap-2 text-gray-400">
          <Loader />
          <p className="text-[13px]">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-[#F8F6F4] flex items-center justify-center mx-auto mb-4">
            <PackageX className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-[14px] font-medium text-gray-900 mb-1">No products yet</p>
          <p className="text-[12px] text-gray-500">Add your first product to get started.</p>
        </div>
      ) : (
        <ProductTable
          products={products}
          categories={categories}
          onEditClick={handleEditClick}
          onDeleteClick={(prod) => {
            setSelectedProduct(prod);
            setAffectedPackages(null); // reset
            setDeleteModalOpen(true);
          }}
        />
      )}

      {/* === ADD MODAL === */}
      {isAddFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-gray-100 bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F3F0FF] flex items-center justify-center">
                  <Package className="w-5 h-5 text-[#5433EB]" />
                </div>
                <div>
                  <h3 className="text-[18px] font-medium text-black">Add New Product</h3>
                  <p className="text-[13px] text-gray-500">Create a new item for your store.</p>
                </div>
              </div>
              <button onClick={() => setIsAddFormOpen(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <ProductAddForm categories={categories} onProductAdded={handleProductAdded} />
            </div>
            <div className="flex justify-end gap-3 px-6 sm:px-8 py-4 border-t border-gray-100 bg-white shrink-0">
              <button type="button" onClick={() => setIsAddFormOpen(false)} className="px-6 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full text-[13px] font-medium transition-colors">
                Cancel
              </button>
              <button type="submit" form="add-product-form" className="flex items-center gap-2 px-6 py-2.5 bg-[#5433EB] hover:bg-[#4524DB] text-white rounded-full text-[13px] font-medium transition-colors">
                <Plus className="w-4 h-4" />
                <span>Create Product</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === EDIT MODAL === */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-gray-100 bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F3F0FF] flex items-center justify-center">
                  <Edit3 className="w-5 h-5 text-[#5433EB]" />
                </div>
                <div>
                  <h3 className="text-[18px] font-medium text-black">Edit Product</h3>
                  <p className="text-[13px] text-gray-500">{editName || 'Update product details'}</p>
                </div>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-8">
              {editError && <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-[13px] rounded-xl">{editError}</div>}

              {/* BASIC INFO */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Product Name *</label>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-black focus:outline-none focus:border-[#5433EB]" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-gray-700 mb-1.5">SKU</label>
                    <input type="text" value={editSku} onChange={(e) => setEditSku(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-black focus:outline-none focus:border-[#5433EB]" />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Slug (Locked)</label>
                    <input type="text" value={editSlug} disabled className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] font-mono text-gray-500 cursor-not-allowed" />
                  </div>
                </div>
              </div>

              {/* PRICING */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Pricing & Inventory</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-5">
                  <div>
                    <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Price ($) *</label>
                    <input type="number" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} required className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#5433EB]" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Compare Price</label>
                    <input type="number" step="0.01" value={editCompareAtPrice} onChange={(e) => setEditCompareAtPrice(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#5433EB]" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Cost Price</label>
                    <input type="number" step="0.01" value={editCostPrice} onChange={(e) => setEditCostPrice(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#5433EB]" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Stock</label>
                    <input type="number" value={editStock} onChange={(e) => setEditStock(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#5433EB]" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Category</label>
                    <CustomSelect value={editCategoryId} onChange={setEditCategoryId} options={categoryOptions} placeholder="Select Category" />
                  </div>
                </div>
              </div>

              {/* SHIPPING */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Shipping & Dimensions</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-5">
                  <div>
                    <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Weight (kg)</label>
                    <input type="number" step="0.001" value={editWeight} onChange={(e) => setEditWeight(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px]" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Length</label>
                    <input type="number" value={editLength} onChange={(e) => setEditLength(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px]" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Width</label>
                    <input type="number" value={editWidth} onChange={(e) => setEditWidth(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px]" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Height</label>
                    <input type="number" value={editHeight} onChange={(e) => setEditHeight(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px]" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Unit</label>
                    <CustomSelect value={editDimUnit} onChange={setEditDimUnit} options={unitOptions} placeholder="Unit" />
                  </div>
                </div>
              </div>

              {/* MEDIA */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Media</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Main Product Image</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                      <input type="file" accept={ACCEPT_IMAGES} onChange={handleMainImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      {editImagePreview ? (
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-white">
                            <img src={editImagePreview} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                          <p className="text-[13px] font-medium text-gray-700">Click to change</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-4 text-gray-500">
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
                        <p className="text-[12px]">Click to add more images</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editExistingGallery.map((url, index) => (
                        <GalleryThumb
                          key={`existing-${index}`}
                          src={url}
                          onRemove={() => removeExistingGalleryItem(index)}
                          borderClass="border border-gray-200"
                        />
                      ))}
                      {editGalleryPreviews.map((src, index) => (
                        <GalleryThumb
                          key={`new-${index}`}
                          src={src}
                          onRemove={() => removeNewGalleryPreview(index)}
                          borderClass="border-2 border-[#5433EB]"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* CONTENT & SEO */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Description & SEO</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Description</label>
                      <textarea rows={4} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] resize-none" />
                    </div>
                    <div className="flex items-center gap-6 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={editIsActive} onChange={(e) => setEditIsActive(e.target.checked)} className="w-4 h-4 text-[#5433EB] rounded border-gray-300" />
                        <span className="text-[13px] font-medium text-gray-700">Active</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={editIsFeatured} onChange={(e) => setEditIsFeatured(e.target.checked)} className="w-4 h-4 text-[#5433EB] rounded border-gray-300" />
                        <span className="text-[13px] font-medium text-gray-700">Featured</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[12px] font-medium text-gray-700 mb-1.5">SEO Meta Title</label>
                      <input type="text" maxLength={60} value={editSeoMetaTitle} onChange={(e) => setEditSeoMetaTitle(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px]" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-gray-700 mb-1.5">SEO Meta Description</label>
                      <textarea maxLength={160} rows={2} value={editSeoMetaDescription} onChange={(e) => setEditSeoMetaDescription(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] resize-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* METADATA */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Custom Attributes</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input type="text" placeholder="Key" value={editMetaKey} onChange={(e) => setEditMetaKey(e.target.value)} className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] flex-1" />
                  <input type="text" placeholder="Value" value={editMetaValue} onChange={(e) => setEditMetaValue(e.target.value)} className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] flex-1" />
                  <button type="button" onClick={handleAddMetadata} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-[13px] font-medium transition-colors">Add</button>
                </div>
                {Object.keys(editMetadata).length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {Object.entries(editMetadata).map(([k, v]) => (
                      <div key={k} className="flex items-center gap-2 bg-[#F3F0FF] text-[#5433EB] px-3 py-1.5 rounded-lg text-[12px] font-medium">
                        <span>{k}:</span><span className="opacity-75">{String(v)}</span>
                        <button type="button" onClick={() => handleRemoveMetadata(k)} className="hover:text-red-500 ml-1"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 sm:px-8 py-4 border-t border-gray-100 bg-white shrink-0">
              <button type="button" onClick={() => setEditModalOpen(false)} className="px-6 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full text-[13px] font-medium transition-colors">Cancel</button>
              <button type="submit" onClick={handleEditSubmit} disabled={editLoading} className="flex items-center gap-2 px-6 py-2.5 bg-[#5433EB] hover:bg-[#4524DB] text-white rounded-full text-[13px] font-medium transition-colors disabled:opacity-50">
                {editLoading ? <Loader /> : <Save className="w-4 h-4" />}
                <span>{editLoading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === DELETE MODAL === */}
      <ProductDeleteModal
        isOpen={deleteModalOpen}
        product={selectedProduct}
        onClose={() => {
          setDeleteModalOpen(false);
          setAffectedPackages(null);
          setSelectedProduct(null);
        }}
        onConfirm={handleDeleteConfirm}
        onForceConfirm={handleForceDeleteConfirm}
        loading={deleteLoading}
        affectedPackages={affectedPackages}
      />
    </div>
  );
}