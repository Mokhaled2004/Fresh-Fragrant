'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, RefreshCw } from 'lucide-react';
import { Loader } from '@/components/ui/Loader'; // <-- New Loader import

interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  variantId: string | null;
  productName: string;
  productImage: string | null;
  variantMetadata: Record<string, unknown> | null;
  unitPrice: string;
  quantity: number;
  lineTotal: string;
  createdAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  userId: string | null;
  shippingName: string;
  shippingPhone: string;
  shippingEmail: string | null;
  shippingAddress: string;
  shippingCity: string;
  shippingCountry: string;
  shippingPostalCode: string | null;
  subtotal: string;
  discount: string;
  shippingCost: string;
  total: string;
  currency: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

const COLUMNS = [
  { id: 'pending',    label: 'PENDING',    color: 'bg-yellow-100 text-yellow-700',  headerColor: 'bg-yellow-50 border-yellow-200' },
  { id: 'processing', label: 'PROCESSING', color: 'bg-blue-100 text-blue-700',      headerColor: 'bg-blue-50 border-blue-200' },
  { id: 'shipped',    label: 'SHIPPED',    color: 'bg-cyan-100 text-cyan-700',       headerColor: 'bg-cyan-50 border-cyan-200' },
  { id: 'completed',  label: 'COMPLETED',  color: 'bg-green-100 text-green-700',    headerColor: 'bg-green-50 border-green-200' },
  { id: 'cancelled',  label: 'CANCELLED',  color: 'bg-red-100 text-red-700',        headerColor: 'bg-red-50 border-red-200' },
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
`;

export default function OrdersSection() {
  return (
    <>
      <style>{scrollbarStyles}</style>
      <OrdersSectionContent />
    </>
  );
}

function OrdersSectionContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (e) {
      console.error('Failed to fetch orders', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    // Also update modal if open
    setSelectedOrder((prev) =>
      prev && prev.id === orderId ? { ...prev, status: newStatus } : prev
    );
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.error('Failed to update order status', e);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.shippingName.toLowerCase().includes(q) ||
      (o.shippingEmail?.toLowerCase().includes(q) ?? false) ||
      o.orderNumber.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2 text-gray-400">
        <Loader />
        <p className="text-[14px]">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col custom-scrollbar">
      {/* Top Bar */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <h2 className="text-[22px] font-semibold text-black">Orders</h2>
          <span className="bg-[#5433EB]/10 text-[#5433EB] text-[12px] font-semibold px-2.5 py-0.5 rounded-full">
            {filteredOrders.length}
          </span>
        </div>
        
        <input
          type="text"
          placeholder="Search by name, email, order #..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[240px] max-w-sm border border-[#5433EB]/20 rounded-full px-4 py-2 text-[13px] text-black placeholder:text-gray-400 focus:border-[#5433EB] focus:ring-2 focus:ring-[#5433EB]/20 focus:outline-none transition-all"
        />
        
        <button
          onClick={fetchOrders}
          className="flex items-center gap-1.5 text-[13px] font-medium text-[#5433EB] hover:text-white bg-[#5433EB]/5 hover:bg-[#5433EB] border border-[#5433EB]/20 rounded-full px-4 py-2 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
        {COLUMNS.map((col) => {
          const colOrders = filteredOrders.filter((o) => o.status === col.id);
          
          return (
            <div
              key={col.id}
              className="min-w-[260px] w-[260px] flex-shrink-0 flex flex-col"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggingId) {
                  handleStatusChange(draggingId, col.id);
                  setDraggingId(null);
                }
              }}
            >
              {/* Column Header - Changed to rounded-full for a clean pill shape */}
              <div className={`rounded-full border px-5 py-2 mb-3 flex items-center justify-between ${col.headerColor}`}>
                <span className="text-[11px] font-bold tracking-wider text-gray-700">{col.label}</span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${col.color}`}>
                  {colOrders.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 space-y-0">
                {colOrders.map((order) => (
                  <div
                    key={order.id}
                    draggable
                    onDragStart={() => setDraggingId(order.id)}
                    onClick={() => setSelectedOrder(order)}
                    className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 mb-3 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-[#5433EB]/30 transition-all"
                  >
                    {/* Top row: status badge + date */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${col.color}`}>
                        {col.label}
                      </span>
                      <span className="text-[10px] text-gray-400">{formatDate(order.createdAt)}</span>
                    </div>
                    {/* Customer name */}
                    <p className="text-[13px] font-medium text-black truncate">{order.shippingName}</p>
                    {/* Address snippet */}
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">
                      {order.shippingAddress}, {order.shippingCity}
                    </p>
                    {/* Total */}
                    <p className="text-[13px] font-semibold text-black mt-2">
                      {order.currency} {Number(order.total).toFixed(2)}
                    </p>
                  </div>
                ))}
                {colOrders.length === 0 && (
                  <div className={`rounded-xl border-2 border-dashed p-4 text-center transition-colors ${
                    draggingId ? 'border-[#5433EB]/40 bg-[#5433EB]/5' : 'border-gray-200 bg-gray-50/50'
                  }`}>
                    <p className={`text-[11px] font-medium ${
                      draggingId ? 'text-[#5433EB]' : 'text-gray-400'
                    }`}>Drop here</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedOrder(null); }}
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col relative">
            <div className="overflow-y-auto flex-1 px-8 pt-8 pb-8 custom-scrollbar">
              {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-[18px] font-semibold text-black">{selectedOrder.orderNumber}</h3>
                {(() => {
                  const col = COLUMNS.find((c) => c.id === selectedOrder.status);
                  return col ? (
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${col.color}`}>
                      {col.label}
                    </span>
                  ) : null;
                })()}
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Shipping Details */}
            <div className="mb-6">
              <h4 className="text-[12px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Shipping Details</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  ['Name', selectedOrder.shippingName],
                  ['Phone', selectedOrder.shippingPhone],
                  ['Email', selectedOrder.shippingEmail || '—'],
                  ['City', selectedOrder.shippingCity],
                  ['Country', selectedOrder.shippingCountry],
                  ['Postal Code', selectedOrder.shippingPostalCode || '—'],
                  ['Address', selectedOrder.shippingAddress],
                  ['Payment', selectedOrder.paymentMethod || '—'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
                    <p className="text-[13px] text-black font-medium">{value}</p>
                  </div>
                ))}
                {selectedOrder.notes && (
                  <div className="col-span-2">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Notes</p>
                    <p className="text-[13px] text-black font-medium">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-6">
              <h4 className="text-[12px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Items</h4>
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500">
                      <th className="text-left px-3 py-2.5 font-medium">Product</th>
                      <th className="text-center px-3 py-2.5 font-medium">Qty</th>
                      <th className="text-right px-3 py-2.5 font-medium">Unit</th>
                      <th className="text-right px-3 py-2.5 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id} className="border-t border-gray-100">
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            {item.productImage && (
                              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                                <Image
                                  src={item.productImage}
                                  alt={item.productName}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <span className="font-medium text-black">{item.productName}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-center text-gray-600">{item.quantity}</td>
                        <td className="px-3 py-2.5 text-right text-gray-600">
                          {selectedOrder.currency} {Number(item.unitPrice).toFixed(2)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium text-black">
                          {selectedOrder.currency} {Number(item.lineTotal).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="border border-gray-100 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-[13px] text-gray-600">
                <span>Subtotal</span>
                <span>{selectedOrder.currency} {Number(selectedOrder.subtotal).toFixed(2)}</span>
              </div>
              {Number(selectedOrder.discount) > 0 && (
                <div className="flex justify-between text-[13px] text-green-600">
                  <span>Discount</span>
                  <span>− {selectedOrder.currency} {Number(selectedOrder.discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[13px] text-gray-600">
                <span>Shipping</span>
                <span>
                  {Number(selectedOrder.shippingCost) === 0
                    ? 'Free'
                    : `${selectedOrder.currency} ${Number(selectedOrder.shippingCost).toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-[15px] font-bold text-black pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{selectedOrder.currency} {Number(selectedOrder.total).toFixed(2)}</span>
              </div>
            </div>

            {/* Status Change */}
            <div className="mt-5">
              <h4 className="text-[12px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Change Status</h4>
              <div className="flex flex-wrap gap-2">
                {COLUMNS.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => handleStatusChange(selectedOrder.id, col.id)}
                    className={`text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all ${
                      selectedOrder.status === col.id
                        ? `${col.color} ring-2 ring-offset-1 ring-current`
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {col.label}
                  </button>
                ))}
              </div>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}