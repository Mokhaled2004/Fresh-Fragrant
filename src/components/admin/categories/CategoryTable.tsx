'use client';

import { Trash2, Edit3, FolderX, Eye, X, Package } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Loader } from '@/components/ui/Loader'; // <-- New Loader import

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

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: string;
  stock: number;
  imageUrl?: string | null;
  isActive: boolean;
}

interface CategoryTableProps {
  categories?: Category[];
  onEditClick: (category: Category) => void;
  onDeleteClick: (category: Category) => void;
}

const resolveImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  const c = url.trim();
  if (!c) return null;
  if (c.startsWith('http')) return c;
  if (c.startsWith('/')) return c;
  return `/${c}`;
};

function CategoryImage({ url, name }: { url: string | null | undefined; name: string }) {
  const [hasError, setHasError] = useState(false);
  const resolved = resolveImageUrl(url);
  if (!resolved || hasError) {
    return (
      <div className="flex items-center justify-center h-full text-[10px] uppercase tracking-wider text-gray-400 bg-[#F8F6F4]">
        No Img
      </div>
    );
  }
  return <Image src={resolved} alt={name} fill sizes="48px" className="object-cover" onError={() => setHasError(true)} />;
}

function ProductImage({ url, name }: { url: string | null | undefined; name: string }) {
  const [hasError, setHasError] = useState(false);
  const resolved = resolveImageUrl(url);
  if (!resolved || hasError) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <Package className="w-4 h-4 text-gray-300" />
      </div>
    );
  }
  return <Image src={resolved} alt={name} fill sizes="40px" className="object-cover" onError={() => setHasError(true)} />;
}

function CategoryProductsModal({
  category,
  onClose,
}: {
  category: Category;
  onClose: () => void;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch on mount
  useEffect(() => {
    fetch(`/api/products?categoryId=${category.id}`)
      .then((r) => r.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : data.products ?? [];
        setProducts(arr);
      })
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false));
  }, [category.id]);

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-[16px] font-medium text-black">Products in "{category.name}"</h3>
            <p className="text-[12px] text-gray-400 mt-0.5">Read-only view</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-black transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
              <Loader />
              <span className="text-[13px]">Loading products...</span>
            </div>
          ) : error ? (
            <div className="py-16 text-center text-[13px] text-red-500">{error}</div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center">
              <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-[14px] font-medium text-gray-500">No products in this category</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-3 px-5 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-400">Product</th>
                  <th className="py-3 px-5 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-400">SKU</th>
                  <th className="py-3 px-5 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-400">Price</th>
                  <th className="py-3 px-5 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-400">Stock</th>
                  <th className="py-3 px-5 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50 transition-colors"
                    style={i !== products.length - 1 ? { borderBottom: '1px solid #f9fafb' } : {}}
                  >
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                          <ProductImage url={p.imageUrl} name={p.name} />
                        </div>
                        <div>
                          <div className="text-[13px] font-medium text-gray-900 line-clamp-1">{p.name}</div>
                          <div className="text-[11px] font-mono text-gray-400">/{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-[12px] font-mono text-gray-500">{p.sku}</td>
                    <td className="py-3 px-5 text-[13px] text-gray-700">${Number(p.price).toFixed(2)}</td>
                    <td className="py-3 px-5 text-[13px] font-mono text-gray-700">{p.stock}</td>
                    <td className="py-3 px-5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                          p.isActive ? 'bg-[#F3F0FF] text-[#5433EB]' : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${p.isActive ? 'bg-[#5433EB]' : 'bg-gray-400'}`} />
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        {!loading && !error && products.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 shrink-0">
            <p className="text-[12px] text-gray-400">{products.length} product{products.length !== 1 ? 's' : ''} total</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CategoryTable({ categories = [], onEditClick, onDeleteClick }: CategoryTableProps) {
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);

  if (!categories || categories.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-[#F8F6F4] flex items-center justify-center mx-auto mb-4">
          <FolderX className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-[14px] font-medium text-gray-900 mb-1">No categories yet</p>
        <p className="text-[12px] text-gray-500">Add your first category to get started.</p>
      </div>
    );
  }

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-none">
            <thead>
              <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                <th className="py-4 px-6 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500">Image</th>
                <th className="py-4 px-6 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500">Name & Slug</th>
                <th className="py-4 px-6 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500">Parent</th>
                <th className="py-4 px-6 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500">Order</th>
                <th className="py-4 px-6 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500">Status</th>
                <th className="py-4 px-6 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              {categories.map((cat, index) => (
                <tr
                  key={cat.id}
                  className="hover:bg-[#FAFAFA] transition-colors"
                  style={index !== categories.length - 1 ? { borderBottom: '1px solid #f9fafb' } : { borderBottom: 'none' }}
                >
                  <td className="py-4 px-6">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                      <CategoryImage url={cat.imageUrl} name={cat.name} />
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-[14px] font-medium text-gray-900 leading-snug line-clamp-1">{cat.name}</div>
                    <div className="text-[11px] font-mono text-gray-400 mt-0.5">/{cat.slug}</div>
                  </td>
                  <td className="py-4 px-6 text-[13px] text-gray-600">
                    {cat.parentCategoryId ? categoryMap.get(cat.parentCategoryId) || 'Sub-category' : <span className="text-gray-400">Top-Level</span>}
                  </td>
                  <td className="py-4 px-6 font-mono text-[13px] text-gray-600">{cat.displayOrder}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                        cat.isActive ? 'bg-[#F3F0FF] text-[#5433EB]' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${cat.isActive ? 'bg-[#5433EB]' : 'bg-gray-400'}`} />
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setViewingCategory(cat); }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#5433EB] hover:bg-[#F3F0FF] transition-colors cursor-pointer outline-none"
                        title="View Products"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onEditClick(cat); }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#5433EB] hover:bg-[#F3F0FF] transition-colors cursor-pointer outline-none"
                        title="Edit Category"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onDeleteClick(cat); }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer outline-none"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {viewingCategory && (
        <CategoryProductsModal
          category={viewingCategory}
          onClose={() => setViewingCategory(null)}
        />
      )}
    </>
  );
}