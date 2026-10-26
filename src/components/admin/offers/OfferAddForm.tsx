'use client';

import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';

export interface OfferAddFormHandle {
  submit: () => void;
}

interface OfferAddFormProps {
  products: any[];
  variants: any[];
  packages: any[];
  categories: any[];
  offerToEdit?: any | null;
  onSuccess: () => void;
}

const TYPES = [
  { label: 'Percentage discount', value: 'percentage' },
  { label: 'Fixed amount discount', value: 'fixed_amount' },
  { label: 'Buy X, Get Y', value: 'buy_x_get_y' },
  { label: 'Coupon code', value: 'coupon' },
];

// === CUSTOM DATE TIME PICKER ===
interface DateTimePickerProps {
  label: string;
  value: string; // ISO local format "YYYY-MM-DDTHH:mm"
  onChange: (val: string) => void;
}

function DateTimePicker({ label, value, onChange }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    if (value) return new Date(value);
    return new Date();
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Parse current value
  const currentDate = value ? new Date(value) : null;
  const selectedDay = currentDate?.getDate();
  const selectedMonth = currentDate?.getMonth();
  const selectedYear = currentDate?.getFullYear();
  const selectedHour = currentDate?.getHours() ?? 12;
  const selectedMinute = currentDate?.getMinutes() ?? 0;

  const [hour12, setHour12] = useState(() => {
    const h = currentDate?.getHours() ?? 12;
    return h === 0 ? 12 : h > 12 ? h - 12 : h;
  });
  const [minute, setMinute] = useState(() => currentDate?.getMinutes() ?? 0);
  const [ampm, setAmpm] = useState<'AM' | 'PM'>(() => {
    const h = currentDate?.getHours() ?? 12;
    return h >= 12 ? 'PM' : 'AM';
  });

  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1).getDay();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const formatDisplay = () => {
    if (!currentDate) return 'Select date & time';
    const dateStr = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const h = currentDate.getHours();
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const m = String(currentDate.getMinutes()).padStart(2, '0');
    const ap = h >= 12 ? 'PM' : 'AM';
    return `${dateStr} · ${h12}:${m} ${ap}`;
  };

  const commit = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}T${hh}:${min}`);
  };

  const handleDayClick = (day: number) => {
    const newDate = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
    // convert hour12+ampm to 24h
    let h24 = hour12 % 12;
    if (ampm === 'PM') h24 += 12;
    newDate.setHours(h24, minute, 0, 0);
    commit(newDate);
    setIsOpen(false);
  };

  const handleTimeChange = (newHour: number, newMinute: number, newAmpm: 'AM' | 'PM') => {
    setHour12(newHour);
    setMinute(newMinute);
    setAmpm(newAmpm);
    let h24 = newHour % 12;
    if (newAmpm === 'PM') h24 += 12;
    const baseDate = currentDate || new Date(viewMonth.getFullYear(), viewMonth.getMonth(), viewMonth.getDate());
    const newDate = new Date(baseDate);
    newDate.setHours(h24, newMinute, 0, 0);
    commit(newDate);
  };

  const handleClear = () => { onChange(''); setIsOpen(false); };

  const hourOptions = Array.from({ length: 12 }, (_, i) => ({ label: String(i + 1), value: String(i + 1) }));
  const minuteOptions = Array.from({ length: 60 }, (_, i) => ({ label: String(i).padStart(2, '0'), value: String(i) }));
  const ampmOptions = [{ label: 'AM', value: 'AM' }, { label: 'PM', value: 'PM' }];

  return (
    <div className="relative" ref={ref}>
      <label className="block text-[12px] font-medium text-gray-700 mb-1.5">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 bg-white border rounded-lg text-[13px] transition-colors focus:outline-none ${
          isOpen ? 'border-[#5433EB] ring-1 ring-[#5433EB]/20' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <span className={currentDate ? 'text-gray-900' : 'text-gray-400'}>
          {formatDisplay()}
        </span>
        <Calendar className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 w-[320px] bg-white border border-gray-100 rounded-xl shadow-lg z-[60] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <button
              type="button"
              onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
              className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[13px] font-medium text-gray-900">
              {monthNames[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
              className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 px-2 pt-2">
            {dayNames.map((d) => (
              <div key={d} className="text-center text-[10px] font-medium text-gray-400 uppercase py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 px-2 pb-2">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected =
                currentDate &&
                day === selectedDay &&
                viewMonth.getMonth() === selectedMonth &&
                viewMonth.getFullYear() === selectedYear;
              const isToday = (() => {
                const t = new Date();
                return day === t.getDate() && viewMonth.getMonth() === t.getMonth() && viewMonth.getFullYear() === t.getFullYear();
              })();
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className={`h-8 w-8 mx-auto rounded-lg text-[12px] font-medium transition-colors ${
                    isSelected
                      ? 'bg-[#5433EB] text-white'
                      : isToday
                      ? 'bg-[#F3F0FF] text-[#5433EB] hover:bg-[#5433EB] hover:text-white'
                      : 'text-gray-700 hover:bg-[#F3F0FF] hover:text-[#5433EB]'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Time picker */}
          <div className="border-t border-gray-100 p-3 flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Hour</label>
              <CustomSelect
                value={String(hour12)}
                onChange={(v) => handleTimeChange(Number(v), minute, ampm)}
                options={hourOptions}
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Minute</label>
              <CustomSelect
                value={String(minute)}
                onChange={(v) => handleTimeChange(hour12, Number(v), ampm)}
                options={minuteOptions}
              />
            </div>
            <div className="w-24">
              <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Period</label>
              <CustomSelect
                value={ampm}
                onChange={(v) => handleTimeChange(hour12, minute, v as 'AM' | 'PM')}
                options={ampmOptions}
              />
            </div>
          </div>

          {/* Clear */}
          <div className="border-t border-gray-100 px-3 py-2 flex justify-between">
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-medium text-[#5433EB] hover:underline transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const OfferAddForm = forwardRef<OfferAddFormHandle, OfferAddFormProps>(function OfferAddForm(
  { products, variants, packages, categories, offerToEdit, onSuccess },
  ref
) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('percentage');
  const [value, setValue] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscountType, setCouponDiscountType] = useState('percentage');
  const [minimumOrderAmount, setMinimumOrderAmount] = useState('');
  const [maximumDiscountAmount, setMaximumDiscountAmount] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [productIds, setProductIds] = useState<string[]>([]);
  const [variantIds, setVariantIds] = useState<string[]>([]);
  const [packageIds, setPackageIds] = useState<string[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);

  const [buyQuantity, setBuyQuantity] = useState('1');
  const [getQuantity, setGetQuantity] = useState('1');
  const [getDiscountPercent, setGetDiscountPercent] = useState('100');

  const [productSearch, setProductSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (offerToEdit) {
      const meta = offerToEdit.metadata || {};
      setName(offerToEdit.name || '');
      setDescription(offerToEdit.description || '');
      setType(offerToEdit.type || 'percentage');
      setValue(offerToEdit.value == null ? '' : String(offerToEdit.value));
      setCouponCode(offerToEdit.couponCode || '');
      setCouponDiscountType(meta.discountType || 'percentage');
      setMinimumOrderAmount(offerToEdit.minimumOrderAmount || '');
      setMaximumDiscountAmount(offerToEdit.maximumDiscountAmount || '');
      setStartAt(offerToEdit.startAt ? new Date(offerToEdit.startAt).toISOString().slice(0, 16) : '');
      setEndAt(offerToEdit.endAt ? new Date(offerToEdit.endAt).toISOString().slice(0, 16) : '');
      setIsActive(offerToEdit.isActive ?? true);
      setProductIds(offerToEdit.offerProducts?.map((x: any) => x.productId) || []);
      setVariantIds(offerToEdit.offerVariants?.map((x: any) => x.variantId) || []);
      setPackageIds(offerToEdit.offerPackages?.map((x: any) => x.packageId) || []);
      setCategoryIds(offerToEdit.offerCategories?.map((x: any) => x.categoryId) || []);
      setBuyQuantity(String(meta.buyQuantity ?? 1));
      setGetQuantity(String(meta.getQuantity ?? 1));
      setGetDiscountPercent(String(meta.getDiscountPercent ?? 100));
    } else {
      setName(''); setDescription(''); setType('percentage'); setValue(''); setCouponCode('');
      setCouponDiscountType('percentage'); setMinimumOrderAmount(''); setMaximumDiscountAmount('');
      setStartAt(''); setEndAt(''); setIsActive(true);
      setProductIds([]); setVariantIds([]); setPackageIds([]); setCategoryIds([]);
      setBuyQuantity('1'); setGetQuantity('1'); setGetDiscountPercent('100');
    }
    setError('');
  }, [offerToEdit]);

  const toggleProduct = (productId: string) => {
    const selected = productIds.includes(productId);
    const relatedVariantIds = variants.filter((v) => v.productId === productId).map((v) => v.id);
    setProductIds(selected ? productIds.filter((id) => id !== productId) : [...productIds, productId]);
    if (selected) setVariantIds(variantIds.filter((id) => !relatedVariantIds.includes(id)));
  };

  const toggleVariant = (variantId: string) => {
    setVariantIds(variantIds.includes(variantId) ? variantIds.filter((id) => id !== variantId) : [...variantIds, variantId]);
  };

  const togglePackage = (id: string) => {
    setPackageIds(packageIds.includes(id) ? packageIds.filter((x) => x !== id) : [...packageIds, id]);
  };

  const toggleCategory = (id: string) => {
    setCategoryIds(categoryIds.includes(id) ? categoryIds.filter((x) => x !== id) : [...categoryIds, id]);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError('');

    try {
      const payload = {
        name,
        description,
        type,
        value: value || null,
        couponCode: type === 'coupon' ? couponCode : null,
        minimumOrderAmount: minimumOrderAmount || null,
        maximumDiscountAmount: maximumDiscountAmount || null,
        startAt: startAt ? new Date(startAt).toISOString() : null,
        endAt: endAt ? new Date(endAt).toISOString() : null,
        isActive,
        productIds, variantIds, packageIds, categoryIds,
        metadata: {
          discountType: couponDiscountType,
          buyQuantity: Number(buyQuantity),
          getQuantity: Number(getQuantity),
          getDiscountPercent: Number(getDiscountPercent),
        },
      };

      const url = offerToEdit ? `/api/offers/${offerToEdit.id}` : '/api/offers';
      const method = offerToEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save offer');

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  useImperativeHandle(ref, () => ({ submit: () => { handleSubmit(); } }));

  const couponTypeOptions = [
    { label: 'Percentage', value: 'percentage' },
    { label: 'Fixed amount', value: 'fixed' },
  ];

  const filteredProducts = products.filter((p) =>
    `${p.name || ''} ${p.sku || ''}`.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
      {error && <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-[13px] rounded-xl">{error}</div>}

      <div className="space-y-4">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Basic Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Offer Name *</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-black focus:outline-none focus:border-[#5433EB]" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Offer Type</label>
            <CustomSelect value={type} onChange={setType} options={TYPES} />
          </div>
          {type === 'coupon' && (
            <>
              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Coupon Discount Type</label>
                <CustomSelect value={couponDiscountType} onChange={setCouponDiscountType} options={couponTypeOptions} />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Coupon Code</label>
                <input required value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] font-mono text-black focus:outline-none focus:border-[#5433EB]" />
              </div>
            </>
          )}
          {type !== 'buy_x_get_y' && (
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1.5">
                {type === 'percentage' || (type === 'coupon' && couponDiscountType === 'percentage') ? 'Discount Percent' : 'Discount Amount ($)'}
              </label>
              <input required type="number" min="0.01" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-black focus:outline-none focus:border-[#5433EB]" />
            </div>
          )}
          {type === 'buy_x_get_y' && (
            <>
              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Buy Quantity</label>
                <input required type="number" min="1" value={buyQuantity} onChange={(e) => setBuyQuantity(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#5433EB]" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Get Quantity</label>
                <input required type="number" min="1" value={getQuantity} onChange={(e) => setGetQuantity(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#5433EB]" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Get Discount %</label>
                <input required type="number" min="0" max="100" value={getDiscountPercent} onChange={(e) => setGetDiscountPercent(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#5433EB]" />
              </div>
            </>
          )}
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Minimum Order Amount</label>
            <input type="number" min="0" step="0.01" value={minimumOrderAmount} onChange={(e) => setMinimumOrderAmount(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#5433EB]" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Maximum Discount</label>
            <input type="number" min="0" step="0.01" value={maximumDiscountAmount} onChange={(e) => setMaximumDiscountAmount(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#5433EB]" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Description</label>
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] resize-none" />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Schedule</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <DateTimePicker label="Starts At" value={startAt} onChange={setStartAt} />
          <DateTimePicker label="Ends At" value={endAt} onChange={setEndAt} />
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 text-[#5433EB] rounded border-gray-300" />
              <span className="text-[13px] font-medium text-gray-700">Offer is active</span>
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Targets (leave empty for storewide)</h4>

        <div className="rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] font-medium text-gray-700">Products & Variants</p>
            <span className="text-[10px] text-gray-400">{productIds.length} products, {variantIds.length} variants</span>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="search"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#5433EB]"
            />
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {filteredProducts.map((product) => {
              const isSelected = productIds.includes(product.id);
              const relatedVariants = variants.filter((v) => v.productId === product.id);
              return (
                <div key={product.id}>
                  <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded-lg cursor-pointer text-[13px]">
                    <input type="checkbox" checked={isSelected} onChange={() => toggleProduct(product.id)} className="w-4 h-4 text-[#5433EB] rounded border-gray-300" />
                    <span className="font-medium text-gray-900">{product.name}</span>
                    <span className="text-[11px] font-mono text-gray-400">{product.sku}</span>
                  </label>
                  {isSelected && relatedVariants.length > 0 && (
                    <div className="ml-6 pl-3 border-l-2 border-gray-100 space-y-0.5 mt-1">
                      {relatedVariants.map((v) => (
                        <label key={v.id} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer text-[12px]">
                          <input type="checkbox" checked={variantIds.includes(v.id)} onChange={() => toggleVariant(v.id)} className="w-3.5 h-3.5 text-[#5433EB] rounded border-gray-300" />
                          <span className="font-mono text-gray-600">{v.sku}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {filteredProducts.length === 0 && <p className="text-[12px] text-gray-400 py-3 text-center">No products found.</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-[12px] font-medium text-gray-700 mb-3">Categories</p>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer text-[13px]">
                  <input type="checkbox" checked={categoryIds.includes(cat.id)} onChange={() => toggleCategory(cat.id)} className="w-4 h-4 text-[#5433EB] rounded border-gray-300" />
                  {cat.name}
                </label>
              ))}
              {categories.length === 0 && <p className="text-[12px] text-gray-400">No categories.</p>}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-[12px] font-medium text-gray-700 mb-3">Packages</p>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {packages.map((pkg) => (
                <label key={pkg.id} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer text-[13px]">
                  <input type="checkbox" checked={packageIds.includes(pkg.id)} onChange={() => togglePackage(pkg.id)} className="w-4 h-4 text-[#5433EB] rounded border-gray-300" />
                  {pkg.name}
                </label>
              ))}
              {packages.length === 0 && <p className="text-[12px] text-gray-400">No packages.</p>}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
});

export default OfferAddForm;