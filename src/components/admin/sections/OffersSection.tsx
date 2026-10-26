'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, X, Save, Tag } from 'lucide-react';
import OfferTable from '@/components/admin/offers/OfferTable';
import OfferAddForm, { OfferAddFormHandle } from '@/components/admin/offers/OfferAddForm';
import OfferDeleteModal from '@/components/admin/offers/OfferDeleteModal';
import { Loader } from '@/components/ui/Loader'; // <-- New Loader import

export default function OffersSection() {
  const [offers, setOffers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any | null>(null);
  const [deleteOffer, setDeleteOffer] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const addFormRef = useRef<OfferAddFormHandle>(null);
  const editFormRef = useRef<OfferAddFormHandle>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [oRes, pRes, vRes, pkgRes, cRes] = await Promise.all([
        fetch('/api/offers'), fetch('/api/products'), fetch('/api/variants'),
        fetch('/api/packages'), fetch('/api/categories'),
      ]);
      if (oRes.ok) setOffers(await oRes.json());
      if (pRes.ok) setProducts(await pRes.json());
      if (vRes.ok) setVariants(await vRes.json());
      if (pkgRes.ok) setPackages(await pkgRes.json());
      if (cRes.ok) setCategories(await cRes.json());
    } catch (err) {
      console.error('Failed to load offers section data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDeleteConfirm = async (id: string) => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/offers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete offer');
      setOffers((prev) => prev.filter((o) => o.id !== id));
      setDeleteOffer(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-medium text-black tracking-tight">Offers & Coupons</h1>
          <p className="text-[14px] text-gray-500 mt-1">Create scheduled discounts for products, variants, packages, or categories.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#5433EB] hover:bg-[#4524DB] text-white rounded-full font-medium text-[13px] transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Offer</span>
        </button>
      </div>

      {/* Table / Loader */}
      {loading ? (
        <div className="w-full h-[400px] bg-white rounded-[24px] border border-gray-100 flex items-center justify-center">
          <Loader variant="inline" text="Loading offers..." />
        </div>
      ) : (
        <OfferTable
          offers={offers}
          onEditClick={(offer) => { setSelectedOffer(offer); setEditOpen(true); }}
          onDeleteClick={(offer) => setDeleteOffer(offer)}
        />
      )}

      {/* ADD MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-gray-100 bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F3F0FF] flex items-center justify-center">
                  <Tag className="w-5 h-5 text-[#5433EB]" />
                </div>
                <div>
                  <h3 className="text-[18px] font-medium text-black">Create New Offer</h3>
                  <p className="text-[13px] text-gray-500">Set up a discount, coupon, or bundle promo.</p>
                </div>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <OfferAddForm
                ref={addFormRef}
                products={products}
                variants={variants}
                packages={packages}
                categories={categories}
                offerToEdit={null}
                onSuccess={() => { fetchData(); setIsAddOpen(false); }}
              />
            </div>
            <div className="flex justify-end gap-3 px-6 sm:px-8 py-4 border-t border-gray-100 bg-white shrink-0">
              <button onClick={() => setIsAddOpen(false)} className="px-6 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full text-[13px] font-medium transition-colors">
                Cancel
              </button>
              <button onClick={() => addFormRef.current?.submit()} className="flex items-center gap-2 px-6 py-2.5 bg-[#5433EB] hover:bg-[#4524DB] text-white rounded-full text-[13px] font-medium transition-colors">
                <Plus className="w-4 h-4" />
                <span>Create Offer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editOpen && selectedOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-gray-100 bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F3F0FF] flex items-center justify-center">
                  <Tag className="w-5 h-5 text-[#5433EB]" />
                </div>
                <div>
                  <h3 className="text-[18px] font-medium text-black">Edit Offer</h3>
                  <p className="text-[13px] text-gray-500">{selectedOffer.name}</p>
                </div>
              </div>
              <button onClick={() => { setEditOpen(false); setSelectedOffer(null); }} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <OfferAddForm
                ref={editFormRef}
                products={products}
                variants={variants}
                packages={packages}
                categories={categories}
                offerToEdit={selectedOffer}
                onSuccess={() => { fetchData(); setEditOpen(false); setSelectedOffer(null); }}
              />
            </div>
            <div className="flex justify-end gap-3 px-6 sm:px-8 py-4 border-t border-gray-100 bg-white shrink-0">
              <button onClick={() => { setEditOpen(false); setSelectedOffer(null); }} className="px-6 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full text-[13px] font-medium transition-colors">
                Cancel
              </button>
              <button onClick={() => editFormRef.current?.submit()} className="flex items-center gap-2 px-6 py-2.5 bg-[#5433EB] hover:bg-[#4524DB] text-white rounded-full text-[13px] font-medium transition-colors">
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      <OfferDeleteModal
        isOpen={!!deleteOffer}
        offer={deleteOffer}
        onClose={() => setDeleteOffer(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
}