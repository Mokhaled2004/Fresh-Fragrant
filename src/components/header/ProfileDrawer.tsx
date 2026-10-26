"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Package, Heart, User as UserIcon, Phone, Mail, Calendar, 
  Edit2, Lock, Check, ChevronRight, RotateCcw, Search, ArrowUpDown 
} from "lucide-react";
import Image from "next/image";

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: { 
    name?: string; 
    fullName?: string;
    email?: string; 
    phoneNumber?: string;
    createdAt?: string | Date;
    [key: string]: any 
  };
}

const MOCK_ORDERS = [
  {
    id: "ord-1",
    orderNumber: "FF-2026-0891",
    total: "94.50",
    status: "delivered",
    createdAt: "2026-10-12T10:30:00Z",
    items: [
      { name: "Cold-Pressed Olive Oil Soap", quantity: 2, imageUrl: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=200&auto=format&fit=crop" },
      { name: "Rosemary & Mint Conditioner", quantity: 1, imageUrl: "https://images.unsplash.com/photo-1608248593842-8021c6a8599b?q=80&w=200&auto=format&fit=crop" }
    ]
  },
  {
    id: "ord-2",
    orderNumber: "FF-2026-1024",
    total: "34.00",
    status: "processing",
    createdAt: "2026-10-22T14:15:00Z",
    items: [
      { name: "Charcoal Detox Body Bar", quantity: 3, imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=200&auto=format&fit=crop" }
    ]
  }
];

const MOCK_WISHLIST = [
  { id: "wish-1", name: "Lavender Essential Oil", price: "22.99", imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=200&auto=format&fit=crop" },
  { id: "wish-2", name: "Organic Bamboo Soap Dish", price: "8.99", imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=200&auto=format&fit=crop" }
];

export default function ProfileDrawer({ isOpen, onClose, user }: ProfileDrawerProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "wishlist">("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<typeof MOCK_ORDERS[0] | null>(null);
  
  // Order Filters
  const [orderSearch, setOrderSearch] = useState("");
  const [orderSort, setOrderSort] = useState<"newest" | "oldest">("newest");

  const [fullName, setFullName] = useState(user.fullName || user.name || "");
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const memberSince = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) 
    : null;

  const handleSaveProfile = (e: React.FormEvent) => { e.preventDefault(); setIsEditing(false); };
  const handleChangePassword = (e: React.FormEvent) => { e.preventDefault(); setIsChangingPassword(false); setOldPassword(""); setNewPassword(""); };
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  // Filter & Sort Orders
  const filteredOrders = useMemo(() => {
    let result = [...MOCK_ORDERS];
    
    // Search
    if (orderSearch) {
      const q = orderSearch.toLowerCase();
      result = result.filter(o => 
        o.orderNumber.toLowerCase().includes(q) || 
        o.items.some(i => i.name.toLowerCase().includes(q))
      );
    }
    
    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return orderSort === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [orderSearch, orderSort]);

  const handleOrderLastOrder = () => {
    if (MOCK_ORDERS.length > 0) {
      // Add logic to re-add the latest order to cart
      alert("Added last order to cart!"); 
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md h-full bg-white flex flex-col z-10 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-[18px] font-medium text-black">My Account</h2>
              <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex px-6 pt-2 border-b border-gray-100 bg-gray-50/50">
              <button onClick={() => { setActiveTab("profile"); setIsEditing(false); setSelectedOrder(null); }} className={`flex items-center gap-2 pb-3 px-2 text-[13px] font-medium transition-colors border-b-2 ${activeTab === "profile" ? "border-[#5433EB] text-[#5433EB]" : "border-transparent text-gray-500 hover:text-gray-900"}`}>
                <UserIcon className="w-4 h-4" /> Profile
              </button>
              <button onClick={() => { setActiveTab("orders"); setIsEditing(false); }} className={`flex items-center gap-2 pb-3 px-4 text-[13px] font-medium transition-colors border-b-2 ${activeTab === "orders" ? "border-[#5433EB] text-[#5433EB]" : "border-transparent text-gray-500 hover:text-gray-900"}`}>
                <Package className="w-4 h-4" /> Orders
              </button>
              <button onClick={() => { setActiveTab("wishlist"); setIsEditing(false); setSelectedOrder(null); }} className={`flex items-center gap-2 pb-3 px-4 text-[13px] font-medium transition-colors border-b-2 ${activeTab === "wishlist" ? "border-[#5433EB] text-[#5433EB]" : "border-transparent text-gray-500 hover:text-gray-900"}`}>
                <Heart className="w-4 h-4" /> Wishlist
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
              
              {/* PROFILE TAB */}
              {activeTab === "profile" && (
                <div>
                  <div className="flex justify-end mb-4">
                    {!isEditing && (
                      <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 text-[12px] font-medium text-[#5433EB] hover:text-[#4524DB] bg-[#F3F0FF] px-3 py-1.5 rounded-full transition-colors">
                        <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                      </button>
                    )}
                  </div>

                  {!isEditing ? (
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0"><UserIcon className="w-5 h-5 text-gray-400" /></div>
                        <div><label className="text-[11px] font-medium text-gray-500 uppercase tracking-[0.1em] block mb-0.5">Full Name</label><p className="text-[15px] font-medium text-black">{user.fullName || user.name || "N/A"}</p></div>
                      </div>
                      <div className="flex items-start gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0"><Mail className="w-5 h-5 text-gray-400" /></div>
                        <div><label className="text-[11px] font-medium text-gray-500 uppercase tracking-[0.1em] block mb-0.5">Email Address</label><p className="text-[15px] text-black">{user.email || "N/A"}</p></div>
                      </div>
                      <div className="flex items-start gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0"><Phone className="w-5 h-5 text-gray-400" /></div>
                        <div><label className="text-[11px] font-medium text-gray-500 uppercase tracking-[0.1em] block mb-0.5">Phone Number</label><p className="text-[15px] text-black">{user.phoneNumber || "Not provided"}</p></div>
                      </div>
                      {memberSince && (
                        <div className="flex items-start gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0"><Calendar className="w-5 h-5 text-gray-400" /></div>
                          <div><label className="text-[11px] font-medium text-gray-500 uppercase tracking-[0.1em] block mb-0.5">Member Since</label><p className="text-[15px] text-black">{memberSince}</p></div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <form onSubmit={handleSaveProfile} className="space-y-4">
                        <h3 className="text-[15px] font-medium text-black mb-2">Personal Details</h3>
                        <div><label className="text-[11px] font-medium text-gray-500 uppercase tracking-[0.1em] block mb-1">Full Name</label><input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] text-black focus:border-[#5433EB] focus:outline-none transition-colors" /></div>
                        <div><label className="text-[11px] font-medium text-gray-500 uppercase tracking-[0.1em] block mb-1">Phone Number</label><input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] text-black focus:border-[#5433EB] focus:outline-none transition-colors" /></div>
                        <div className="flex gap-3 pt-2">
                          <button type="submit" className="flex-1 bg-[#5433EB] text-white py-2.5 rounded-lg text-[13px] font-medium hover:bg-[#4524DB] transition-colors flex items-center justify-center gap-2"><Check className="w-4 h-4" /> Save</button>
                          <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-[13px] font-medium hover:bg-gray-200 transition-colors">Cancel</button>
                        </div>
                      </form>
                      <div className="pt-6 border-t border-gray-100">
                        {!isChangingPassword ? (
                          <button onClick={() => setIsChangingPassword(true)} className="flex items-center gap-2 text-[13px] font-medium text-gray-600 hover:text-black transition-colors"><Lock className="w-4 h-4" /> Change Password</button>
                        ) : (
                          <form onSubmit={handleChangePassword} className="space-y-4">
                            <h3 className="text-[15px] font-medium text-black mb-2">Change Password</h3>
                            <div><label className="text-[11px] font-medium text-gray-500 uppercase tracking-[0.1em] block mb-1">Current Password</label><input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] text-black focus:border-[#5433EB] focus:outline-none transition-colors" /></div>
                            <div><label className="text-[11px] font-medium text-gray-500 uppercase tracking-[0.1em] block mb-1">New Password</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] text-black focus:border-[#5433EB] focus:outline-none transition-colors" /></div>
                            <div className="flex gap-3 pt-2">
                              <button type="submit" className="flex-1 bg-black text-white py-2.5 rounded-lg text-[13px] font-medium hover:bg-gray-800 transition-colors">Update Password</button>
                              <button type="button" onClick={() => setIsChangingPassword(false)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-[13px] font-medium hover:bg-gray-200 transition-colors">Cancel</button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ORDERS TAB */}
              {activeTab === "orders" && (
                <div className="space-y-5">
                  {/* Top Bar: Order Last Order + Search + Sort */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={handleOrderLastOrder}
                        className="flex items-center gap-1.5 text-[12px] font-medium text-white bg-black px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Order Last Order
                      </button>
                      
                      <button 
                        onClick={() => setOrderSort(orderSort === 'newest' ? 'oldest' : 'newest')}
                        className="flex items-center gap-1.5 text-[12px] font-medium text-gray-600 hover:text-black transition-colors"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5" /> 
                        {orderSort === 'newest' ? 'Newest' : 'Oldest'}
                      </button>
                    </div>
                    
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search by order number or product..." 
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-black focus:border-[#5433EB] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Orders List */}
                  {filteredOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-[14px] text-gray-500">No orders found matching your search.</p>
                    </div>
                  ) : (
                    filteredOrders.map((order) => (
                      <div 
                        key={order.id} 
                        // FIXED BORDERS: Changed to rounded-2xl, border-gray-200, shadow-sm
                        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                      >
                        {/* Card Header - Clickable */}
                        <div 
                          onClick={() => setSelectedOrder(order)}
                          className="cursor-pointer group hover:bg-gray-50 transition-colors p-5"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-[14px] font-medium text-black group-hover:text-[#5433EB] transition-colors">
                                Order #{order.orderNumber}
                              </p>
                              <p className="text-[12px] text-gray-500 mt-0.5">
                                Placed on {formatDate(order.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                              }`}>
                                {order.status}
                              </span>
                              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
                            </div>
                          </div>

                          {/* Thumbnails & Total */}
                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div className="flex -space-x-3">
                              {order.items.slice(0, 3).map((item, idx) => (
                                <div key={idx} className="relative w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-100 shrink-0">
                                  <Image src={item.imageUrl} alt={item.name} fill sizes="40px" className="object-cover" />
                                </div>
                              ))}
                              {order.items.length > 3 && (
                                <div className="relative w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600 shrink-0">
                                  +{order.items.length - 3}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-[11px] text-gray-500">Total</p>
                              <p className="text-[15px] font-bold text-black">${order.total}</p>
                            </div>
                          </div>
                        </div>

                        {/* Card Footer - Order Again */}
                        <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100 flex justify-end">
                          <button 
                            onClick={(e) => { e.stopPropagation(); /* Add to cart logic here */ }}
                            className="flex items-center gap-1.5 text-[11px] font-medium text-black border border-gray-200 bg-white px-3 py-1.5 rounded-full hover:border-black transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" /> Order Again
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* WISHLIST TAB */}
              {activeTab === "wishlist" && (
                <div className="space-y-4">
                  {MOCK_WISHLIST.map((item) => (
                    <div key={item.id} className="flex gap-4 p-3 bg-white rounded-2xl border border-gray-200 shadow-sm">
                      <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                        <Image src={item.imageUrl} alt={item.name} fill sizes="80px" className="object-cover" />
                      </div>
                      <div className="flex flex-col justify-between flex-1 py-1">
                        <div>
                          <p className="text-[14px] font-medium text-black leading-tight">{item.name}</p>
                          <p className="text-[13px] font-bold text-[#5433EB] mt-1">${item.price}</p>
                        </div>
                        <button className="self-start text-[11px] font-medium text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-full hover:border-black hover:text-black transition-colors">Add to Cart</button>
                      </div>
                      <button className="self-start p-2 text-gray-400 hover:text-red-500 transition-colors"><Heart className="w-4 h-4 fill-red-500 text-red-500" /></button>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* ORDER DETAILS SLIDE-OVER */}
            <AnimatePresence>
              {selectedOrder && (
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="absolute inset-0 bg-white z-20 flex flex-col"
                >
                  <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100">
                    <button onClick={() => setSelectedOrder(null)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
                      <ChevronRight className="w-5 h-5 rotate-180 text-gray-500" />
                    </button>
                    <div>
                      <h2 className="text-[16px] font-medium text-black">Order Details</h2>
                      <p className="text-[11px] text-gray-500">#{selectedOrder.orderNumber}</p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-[11px] font-medium text-gray-500 uppercase tracking-[0.1em] mb-1">Status</p>
                      <p className="text-[15px] font-medium text-black capitalize">{selectedOrder.status}</p>
                    </div>

                    <div>
                      <h3 className="text-[13px] font-medium text-black mb-3">Items in this order</h3>
                      <div className="space-y-4">
                        {selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4">
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                              <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-cover" />
                            </div>
                            <div className="flex-1">
                              <p className="text-[14px] font-medium text-black">{item.name}</p>
                              <p className="text-[12px] text-gray-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[13px] text-gray-500">Total Paid</span>
                      <span className="text-[18px] font-bold text-black">${selectedOrder.total}</span>
                    </div>
                    <button 
                      onClick={() => { /* Add to cart logic */ }}
                      className="w-full flex items-center justify-center gap-2 bg-[#5433EB] text-white font-medium py-3.5 rounded-full transition-colors hover:bg-[#4524DB] text-[13px]"
                    >
                      <RotateCcw className="w-4 h-4" /> Order Again
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}