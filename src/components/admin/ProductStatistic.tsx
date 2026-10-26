'use client';

import { useState } from 'react';
import { Lamp, Gamepad2, Armchair, Tag } from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';

const PURPLE = '#5433EB';
const RED    = '#ef4444';
const GREY   = '#d1d5db';

interface Category {
  name:  string;
  count: number;
  pct:   number;
  color: string;
  icon?:  any; // Made optional to prevent crashes
}

interface ProductStatisticProps {
  categories?: Category[];
  totalSales?: number;
  growthPct?:  number;
}

const MOCK: Category[] = [
  { name: 'Electronic', count: 2487, pct:  1.8,  color: PURPLE, icon: Lamp    },
  { name: 'Games',      count: 1828, pct:  2.3,  color: RED,    icon: Gamepad2 },
  { name: 'Furniture',  count: 1463, pct: -1.04, color: GREY,   icon: Armchair },
];

const TIME_OPTIONS = [
  { label: 'Today', value: 'Today' },
  { label: 'This Week', value: 'This Week' },
  { label: 'This Month', value: 'This Month' },
  { label: 'This Year', value: 'This Year' },
];

function num(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(3)}`;
  return String(n);
}

function Arc({ percent, color, radius, thickness }: { percent: number, color: string, radius: number, thickness: number }) {
  const angle = Math.PI / 4;
  const startX = 100 - radius * Math.cos(angle);
  const startY = 100 + radius * Math.sin(angle);
  const endX = 100 + radius * Math.cos(angle);
  const endY = 100 + radius * Math.sin(angle);

  const d = `M ${startX} ${startY} A ${radius} ${radius} 0 1 1 ${endX} ${endY}`;
  const totalLength = 2 * Math.PI * radius * 0.75;

  return (
    <g className="group/arc cursor-pointer">
      <path
        d={d}
        fill="none"
        stroke="#F3F4F6"
        strokeWidth={thickness}
        strokeLinecap="round"
        className="transition-all duration-300 group-hover/arc:stroke-gray-200"
      />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={thickness}
        strokeLinecap="round"
        strokeDasharray={`${totalLength * (percent / 100)} ${totalLength}`}
        className="transition-all duration-1000 ease-out group-hover/arc:brightness-110"
      />
    </g>
  );
}

export function ProductStatistic({
  categories = MOCK,
  totalSales  = MOCK.reduce((s, r) => s + r.count, 0),
  growthPct   = 5.34,
}: ProductStatisticProps) {
  const [timeRange, setTimeRange] = useState('Today');
  
  const cats = categories.slice(0, 3);
  const max  = Math.max(...cats.map(c => c.count), 1);
  const percentages = cats.map(c => Math.round((c.count / max) * 100));

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.08)] transition-shadow duration-300 flex flex-col h-full">
      
      {/* Header */}
      <div className="flex items-start justify-between z-10">
        <div>
          <p className="text-[16px] font-medium text-black tracking-tight">Product Statistic</p>
          <p className="text-[12px] text-gray-500 mt-0.5">Track your product sales</p>
        </div>
        
        <div className="w-[110px]">
          <CustomSelect
            value={timeRange}
            onChange={setTimeRange}
            options={TIME_OPTIONS}
          />
        </div>
      </div>

      {/* Main Visual Area - Centered Flexbox */}
      <div className="flex-1 flex items-center justify-center gap-8 mt-2 mb-4">
        
        {/* SVG Chart */}
        <div className="w-[170px] h-[170px] shrink-0">
          <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
            <Arc percent={percentages[0]} color={cats[0].color} radius={85} thickness={16} />
            <Arc percent={percentages[1]} color={cats[1].color} radius={60} thickness={16} />
            <Arc percent={percentages[2]} color={cats[2].color} radius={35} thickness={16} />
          </svg>
        </div>

        {/* Stats */}
        <div className="flex flex-col items-start shrink-0">
          <p className="text-[36px] font-semibold text-black leading-none tracking-tight">
            {num(totalSales)}
          </p>
          <p className="text-[13px] text-gray-500 mt-1.5">Products Sales</p>
          <span className={`mt-2 text-[11px] font-bold px-2.5 py-1 rounded-full ${
            growthPct >= 0 ? 'bg-[#e8f8ef] text-[#22c55e]' : 'bg-[#feecec] text-[#ef4444]'
          }`}>
            {growthPct >= 0 ? '+' : ''}{growthPct}%
          </span>
        </div>

      </div>

      {/* Category Rows */}
      <ul className="mt-2 space-y-1 pt-4 border-t border-gray-100 w-full">
        {cats.map((cat) => {
          // Fallback to Tag icon if icon is undefined
          const Icon = cat.icon || Tag;
          
          return (
            <li 
              key={cat.name} 
              className="flex items-center justify-between px-2 py-2 -mx-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-[18px] h-[18px] text-gray-500 group-hover:text-[#5433EB] transition-colors" strokeWidth={1.5} />
                <span className="text-[13px] font-medium text-gray-800 group-hover:text-black transition-colors">
                  {cat.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-semibold text-black">{num(cat.count)}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  cat.pct >= 0 ? 'bg-[#e8f8ef] text-[#22c55e]' : 'bg-[#feecec] text-[#ef4444]'
                }`}>
                  {cat.pct >= 0 ? '+' : ''}{Math.abs(cat.pct)}%
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}