'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { X, Plus, Trash2, Upload } from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';

export interface PackageAddFormHandle {
  submit: () => void;
}

interface PackageAddFormProps {
  onSuccess: () => void;
  packageData?: any | null;
  products: any[];
  variants: any[];
}

const PackageAddForm = forwardRef<PackageAddFormHandle, PackageAddFormProps>(function PackageAddForm(
  { onSuccess, packageData, products, variants },
  ref
) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [offeredPrice, setOfferedPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [items, setItems] = useState<Array<{ productId: string; variantId?: string | null; quantity: number }>>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (packageData) {
      setName(packageData.name || '');
      setSlug(packageData.slug || '');
      setDescription(packageData.description || '');
      setOfferedPrice(packageData.offeredPrice || '');
      setOriginalPrice(packageData.originalPrice || '');
      setIsActive(packageData.isActive ?? true);
      setIsFeatured(packageData.isFeatured ?? false);
      setImagePreview(packageData.imageUrl || null);
      setImageFile(null);
      setItems(
        packageData.items?.map((item: any) => ({
          productId: item.productId,
          variantId: item.variantId || null,
          quantity: item.quantity,
        })) || []
      );
    } else {
      setName('');
      setSlug('');
      setDescription('');
      setOfferedPrice('');
      setOriginalPrice('');
      setIsActive(true);
      setIsFeatured(false);
      setImagePreview(null);
      setImageFile(null);
      setItems([]);
    }
    setError('');
  }, [packageData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const addItem = () => {
    if (products.length === 0) return;
    setItems([...items, { productId: products[0].id, variantId: null, quantity: 1 }]);
  };

  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const updateItemProduct = (index: number, productId: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], productId, variantId: null };
    setItems(newItems);
  };

  const updateItemVariant = (index: number, variantId: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], variantId: variantId === '' ? null : variantId };
    setItems(newItems);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name || !slug || !offeredPrice) return;
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('slug', slug);
      formData.append('description', description);
      formData.append('offeredPrice', offeredPrice);
      if (originalPrice) formData.append('originalPrice', originalPrice);
      formData.append('isActive', String(isActive));
      formData.append('isFeatured', String(isFeatured));
      formData.append('items', JSON.stringify(items));
      if (imageFile) formData.append('image', imageFile);

      const url = packageData ? `/api/packages/${packageData.id}` : '/api/packages';
      const method = packageData ? 'PUT' : 'POST';
      const res = await fetch(url, { method, body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save package');
      }

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

  const productOptions = products.map((p) => ({ label: `${p.name} (${p.sku})`, value: p.id }));

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
      {error && <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-[13px] rounded-xl">{error}</div>}

      {/* Basic Info */}
      <div className="space-y-4">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Basic Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Package Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!packageData) {
                  setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                }
              }}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-black focus:outline-none focus:border-[#5433EB] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Slug *</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] font-mono text-gray-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Pricing</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Offered Price ($) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={offeredPrice}
              onChange={(e) => setOfferedPrice(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#5433EB]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Original Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#5433EB]"
            />
          </div>
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

      {/* Image */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Media</h4>
        <div>
          <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Package Image</label>
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
                <p className="text-[12px]">Click to upload package image</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Included Items</h4>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 text-[11px] font-medium text-[#5433EB] hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Add Item
          </button>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-8 text-center">
            <p className="text-[12px] text-gray-400">No items added to this package yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => {
              const productVariants = variants.filter(
                (v) => v.productId === item.productId || v.product_id === item.productId
              );

              const variantOptions = [
                { label: 'None (Base Product)', value: '' },
                ...productVariants.map((v) => ({
                  label: `SKU: ${v.sku}${v.metadata ? ` (${JSON.stringify(v.metadata).slice(0, 30)})` : ''}`,
                  value: v.id,
                })),
              ];

              return (
                <div key={index} className="p-4 bg-white border border-gray-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <CustomSelect
                        value={item.productId}
                        onChange={(val) => updateItemProduct(index, val)}
                        options={productOptions}
                        placeholder="Select product"
                      />
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          setItems(
                            items.map((it, i) =>
                              i === index ? { ...it, quantity: parseInt(e.target.value) || 1 } : it
                            )
                          )
                        }
                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#5433EB]"
                        placeholder="Qty"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {productVariants.length > 0 ? (
                    <CustomSelect
                      value={item.variantId || ''}
                      onChange={(val) => updateItemVariant(index, val)}
                      options={variantOptions}
                      placeholder="None (Base Product)"
                    />
                  ) : (
                    <p className="text-[11px] text-orange-500">
                      * No variants found for this product.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </form>
  );
});

export default PackageAddForm;