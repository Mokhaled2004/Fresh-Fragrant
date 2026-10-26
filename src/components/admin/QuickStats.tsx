'use client';

import { ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';

// Shape of the stats object passed from DashboardSection
export interface QuickStatsProps {
  stats: {
    revenue: { value: number; pct: number };
    orders:  { value: number; pct: number };
    users:   { value: number; pct: number };
    sold:    { value: number; pct: number };
  };
}

// Mock data for Top Products
const TOP_PRODUCTS = [
  { name: 'Cold-Pressed Olive Oil Soap', sales: 342, total: 500, color: '#5433EB' },
  { name: 'Rosemary & Mint Conditioner', sales: 289, total: 500, color: '#3B82F6' },
  { name: 'Lavender Essential Oil', sales: 156, total: 500, color: '#34D399' },
  { name: 'Charcoal Detox Body Bar', sales: 94, total: 500, color: '#F472B6' },
];

// Mock data for Recent Orders
const RECENT_ORDERS = [
  { id: '#FF-2026-0891', customer: 'Mo Khalid', date: '2 mins ago', total: '$94.50', status: 'processing' },
  { id: '#FF-2026-0890', customer: 'Sarah Ahmed', date: '1 hour ago', total: '$34.00', status: 'completed' },
  { id: '#FF-2026-0889', customer: 'Ali Hassan', date: '3 hours ago', total: '$112.20', status: 'completed' },
];

export function QuickStats({ stats }: QuickStatsProps) {
  return (
    <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] flex flex-col h-full">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[15px] font-medium text-black">Recent Activity</p>
          <p className="text-[12px] text-gray-400">Your store's latest updates</p>
        </div>
        <Link 
          href="/admin/orders" 
          className="text-[11px] font-medium text-[#5433EB] hover:underline flex items-center gap-1"
        >
          View All <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
        
        {/* Top Selling Products */}
        <div>
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-4">Top Selling Products</h4>
          <div className="space-y-4">
            {TOP_PRODUCTS.map((product) => {
              const percentage = Math.round((product.sales / product.total) * 100);
              return (
                <div key={product.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px] font-medium text-gray-800 line-clamp-1">{product.name}</span>
                    <span className="text-[12px] font-semibold text-black">{product.sales} sold</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${percentage}%`, backgroundColor: product.color }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Orders */}
        <div>
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-4">Recent Orders</h4>
          <div className="space-y-3">
            {RECENT_ORDERS.map((order) => (
              <div 
                key={order.id} 
                className="flex items-center justify-between p-3 -mx-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    order.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-500'
                  }`}>
                    {order.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-gray-900">{order.id}</p>
                    <p className="text-[11px] text-gray-500">{order.customer} • {order.date}</p>
                  </div>
                </div>
                <span className="text-[13px] font-semibold text-black">{order.total}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}