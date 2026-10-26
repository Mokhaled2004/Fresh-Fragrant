'use client';

import { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react';

import { ProductStatistic } from '@/components/admin/ProductStatistic';
import { QuickStats } from '@/components/admin/QuickStats';
import { RevenueOrdersChart } from '@/components/admin/RevenueOrdersChart';
import { CustomerGrowthChart } from '@/components/admin/CustomerGrowthChart';
import { StatCard } from '@/components/admin/StatCard';
import { Loader } from '@/components/ui/Loader'; // <-- New Loader import

const PURPLE = '#5433EB';

interface DashboardData {
  stats: {
    revenue: { value: number; pct: number };
    orders:  { value: number; pct: number };
    users:   { value: number; pct: number };
    sold:    { value: number; pct: number };
  };
  monthlyRevenue: { month: string; revenue: string; orderCount: number }[];
  categorySales:  { categoryName: string; count: number }[];
  userGrowth:     { month: string; count: number }[];
}

// ── MOCK DATA (Used when the database is empty) ───────────────────────────────
const MOCK_STATS = {
  revenue: { value: 54200, pct: 12.5 },
  orders:  { value: 1240,  pct: 8.2  },
  users:   { value: 856,   pct: 15.4 },
  sold:    { value: 3420,  pct: 4.1  },
};

const MOCK_MONTHLY_REVENUE = [
  { month: 'Jan', revenue: '4500', orderCount: 120 },
  { month: 'Feb', revenue: '6200', orderCount: 180 },
  { month: 'Mar', revenue: '3800', orderCount: 95 },
  { month: 'Apr', revenue: '8500', orderCount: 240 },
  { month: 'May', revenue: '7200', orderCount: 210 },
  { month: 'Jun', revenue: '9800', orderCount: 310 },
  { month: 'Jul', revenue: '8100', orderCount: 260 },
];

const MOCK_USER_GROWTH = [
  { month: 'Jan', count: 120 },
  { month: 'Feb', count: 210 },
  { month: 'Mar', count: 180 },
  { month: 'Apr', count: 340 },
  { month: 'May', count: 290 },
  { month: 'Jun', count: 450 },
  { month: 'Jul', count: 520 },
];

const MOCK_CATEGORY_SALES = [
  { categoryName: 'Electronic', count: 2487 },
  { categoryName: 'Games',      count: 1828 },
  { categoryName: 'Furniture',  count: 1463 },
];

// Reusable card-shaped container for loading states
function CardLoader({ height, text }: { height: string; text?: string }) {
  return (
    <div 
      className={`w-full ${height} bg-white rounded-[24px] shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] flex items-center justify-center`}
    >
      <Loader variant="inline" text={text} />
    </div>
  );
}

export default function DashboardSection() {
  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => r.json())
      .then(json => { 
        if (json?.stats && json?.monthlyRevenue) setData(json); 
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Fallback to Mock Data if real data is missing or empty
  const stats = data?.stats ?? MOCK_STATS;
  
  const monthlyRevenue = (data?.monthlyRevenue && data.monthlyRevenue.length > 0) 
    ? data.monthlyRevenue 
    : MOCK_MONTHLY_REVENUE;
    
  const userGrowth = (data?.userGrowth && data.userGrowth.length > 0) 
    ? data.userGrowth 
    : MOCK_USER_GROWTH;

  const categorySales = (data?.categorySales && data.categorySales.length > 0) 
    ? data.categorySales 
    : MOCK_CATEGORY_SALES;

  const totalSales = categorySales.reduce((s, r) => s + Number(r.count), 0);

  return (
    <div className="w-full space-y-5 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-medium text-black tracking-tight">Dashboard</h1>
        <p className="text-[14px] text-gray-500 mt-1">Welcome back — here's what's happening this month.</p>
      </div>

      {/* ── Row 1: KPI cards (left) + Product Statistic donut (right) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-stretch">
        
        {/* KPI 2×2 grid — takes 2 cols */}
        <div className="xl:col-span-2">
          {loading ? (
            <div className="grid grid-cols-2 gap-5 h-full">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-[160px] bg-white rounded-[24px] shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] flex items-center justify-center">
                  <Loader variant="inline" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 h-full">
              <StatCard label="Total Sales" sub="Products vs last month" value={stats.revenue.value} pct={stats.revenue.pct} icon={DollarSign} format="money" solid />
              <StatCard label="Total Orders" sub="Orders vs last month" value={stats.orders.value} pct={stats.orders.pct} icon={ShoppingCart} />
              <StatCard label="Visitor" sub="Users vs last month" value={stats.users.value} pct={stats.users.pct} icon={Users} />
              <StatCard label="Total Sold Products" sub="Products vs last month" value={stats.sold.value} pct={stats.sold.pct} icon={Package} />
            </div>
          )}
        </div>

        {/* Product Statistic — takes 1 col */}
        <div className="xl:col-span-1 h-full">
          {loading ? (
            <CardLoader height="h-full min-h-[340px]" />
          ) : (
            <ProductStatistic
              categories={
                categorySales.slice(0, 3).map((r, i) => ({
                  name:  r.categoryName,
                  count: Number(r.count),
                  pct:   [1.8, 2.3, -1.04][i] ?? 0,
                  color: [PURPLE, '#ef4444', '#d1d5db'][i],
                }))
              }
              totalSales={totalSales}
              growthPct={stats.sold.pct}
            />
          )}
        </div>
      </div>

      {/* ── Row 2: Bar Chart (full width) ── */}
      <div>
        {loading ? (
          <CardLoader height="h-[340px]" />
        ) : (
          <RevenueOrdersChart monthlyRevenue={monthlyRevenue} />
        )}
      </div>

      {/* ── Row 3: Line Chart + Quick Stats ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-stretch">
        {loading ? (
          <CardLoader height="h-[320px]" />
        ) : (
          <CustomerGrowthChart userGrowth={userGrowth} growthPct={stats.users.pct} />
        )}
        {loading ? (
          <CardLoader height="h-[320px]" />
        ) : (
          <QuickStats stats={stats} />
        )}
      </div>
    </div>
  );
}