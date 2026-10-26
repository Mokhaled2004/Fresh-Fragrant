'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { X, Plus, Trash2, Upload } from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';

interface AttributeRow {
  key: string;
  value: string;
}

export interface VariantAddFormHandle {
  submit: () => void;
}

interface VariantAddFormProps {
  onSuccess: () => void;
  variantToEdit?: any | null;
}

const VariantAddForm = forwardRef<VariantAddFormHandle, VariantAddFormProps>(function VariantAddForm(
  { onSuccess, variantToEdit },
  ref
) {
  const [productsList, setProductsList] = useState<any[]>([]);
  const [productId, setProductId] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [attributes, setAttributes] = useState<AttributeRow[]>([{ key: 'color', value: '' }, { key: 'size', value: '' }]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setProductsList(data); })
      .catch((err) => console.error('Failed to load products', err));
  }, []);

  useEffect(() => {
    if (variantToEdit) {
      setProductId(variantToEdit.productId || '');
      setSku(variantToEdit.sku || '');
      setPrice(variantToEdit.price ? variantToEdit.price.toString() : '');
      setStock(variantToEdit.stock !== undefined ? variantToEdit.stock.toString() : '0');
      setIsActive(variantToEdit.isActive ?? true);
      setImagePreview(variantToEdit.imageUrl || null);
      setImageFile(null);
      if (variantToEdit.metadata && typeof variantToEdit.metadata === 'object') {
        const entries = Object.entries(variantToEdit.metadata).map(([key, value]) => ({ key, value: String(value) }));
        setAttributes(entries.length > 0 ? entries : [{ key: '', value: '' }]);
      } else {
        setAttributes([{ key: '', value: '' }]);
      }
    } else {
      setProductId('');
      setSku('');
      setPrice('');
      setStock('0');
      setIsActive(true);
      setImagePreview(null);
      setImageFile(null);
      setAttributes([{ key: 'color', value: '' }, { key: 'size', value: '' }]);
    }
    setError('');
  }, [variantToEdit]);

  const handleAddAttribute = () => setAttributes([...attributes, { key: '', value: '' }]);
  const handleRemoveAttribute = (index: number) => setAttributes(attributes.filter((_, i) => i !== index));
  const handleAttributeChange = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...attributes];
    updated[index][field] = val;
    setAttributes(updated);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!productId || !sku) return;
    setLoading(true);
    setError('');

    const metadataObj: Record<string, string> = {};
    attributes.forEach((attr) => { if (attr.key.trim()) metadataObj[attr.key.trim()] = attr.value; });

    try {
      const formData = new FormData();
      formData.append('productId', productId);
      formData.append('sku', sku);
      formData.append('price', price);
      formData.append('stock', stock);
      formData.append('isActive', String(isActive));
      formData.append('metadata', JSON.stringify(metadataObj));
      if (imageFile) formData.append('image', imageFile);

      const url = variantToEdit ? `/api/variants/${variantToEdit.id}` : '/api/variants';
      const method = variantToEdit ? 'PUT' : 'POST';
      const res = await fetch(url, { method, body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save variant');
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    submit: () => { handleSubmit(); },
  }));

  const productOptions = productsList.map((p) => ({
    label: `${p.name} (SKU: ${p.sku})`,
    value: p.id,
  }));

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
      {error && <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-[13px] rounded-xl">{error}</div>}

      {/* Basic Info */}
      <div className="space-y-4">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Basic Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Parent Product *</label>
            <CustomSelect value={productId} onChange={setProductId} options={productOptions} placeholder="Select a product..." />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Variant SKU *</label>
            <input type="text" required placeholder="e.g. SHIRT-RED-M" value={sku} onChange={(e) => setSku(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#5433EB]" />
          </div>
        </div>
      </div>

      {/* Pricing & Stock */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Pricing & Inventory</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Price ($)</label>
            <input type="number" step="0.01" placeholder="Leave blank to inherit" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#5433EB]" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Stock Quantity *</label>
            <input type="number" required value={stock} onChange={(e) => setStock(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#5433EB]" />
          </div>
          <div className="flex items-end pb-2.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 text-[#5433EB] rounded border-gray-300" />
              <span className="text-[13px] font-medium text-gray-700">Active Variant</span>
            </label>
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Media</h4>
        <div>
          <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Variant Image (Optional)</label>
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
                <Upload className="w-6 h-6 mb-2" />
                <p className="text-[12px]">Click to upload image</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Attributes */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Attributes</h4>
          <button type="button" onClick={handleAddAttribute} className="flex items-center gap-1 text-[11px] font-medium text-[#5433EB] hover:underline">
            <Plus className="w-3.5 h-3.5" /> Add Attribute
          </button>
        </div>
        <div className="space-y-2">
          {attributes.map((attr, index) => (
            <div key={index} className="flex items-center gap-2">
              <input type="text" placeholder="Key (e.g. color)" value={attr.key} onChange={(e) => handleAttributeChange(index, 'key', e.target.value)} className="flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#5433EB]" />
              <input type="text" placeholder="Value (e.g. red)" value={attr.value} onChange={(e) => handleAttributeChange(index, 'value', e.target.value)} className="flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#5433EB]" />
              <button type="button" onClick={() => handleRemoveAttribute(index)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
});

export default VariantAddForm;