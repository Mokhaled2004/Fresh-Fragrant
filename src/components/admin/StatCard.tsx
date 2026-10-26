import { TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';

const PURPLE = '#5433EB';
const TIME_FILTERS = ['Day', 'Week', 'Month'];

export function StatCard({
  label, sub, value, pct, icon: Icon, format = 'num', solid = false,
}: {
  label: string; sub: string; value: number; pct: number;
  icon: React.ElementType; format?: 'money' | 'num'; solid?: boolean;
}) {
  const [timeFilter, setTimeFilter] = useState('Month');
  const up = pct >= 0;

  function formatValue(n: number) {
    if (format === 'money') {
      if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
      if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
      return `$${n.toLocaleString()}`;
    }
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
  }

  return (
    <div
      className="rounded-[24px] p-5 flex flex-col shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.08)] transition-shadow duration-300 relative overflow-hidden"
      style={{ background: solid ? PURPLE : '#fff' }}
    >
      {/* 
        Decorative Cutoff Circles 
        These sit in the top-right and bottom-left corners and are clipped by overflow-hidden.
      */}
      <div 
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none transition-transform duration-700 hover:scale-110"
        style={{ background: solid ? 'rgba(255,255,255,0.12)' : `${PURPLE}08` }}
      />
      <div 
        className="absolute -bottom-16 -left-8 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: solid ? 'rgba(255,255,255,0.08)' : `${PURPLE}04` }}
      />

      {/* Main Content (z-10 to sit above the circles) */}
      <div className="relative z-10 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm"
            style={{ background: solid ? 'rgba(255,255,255,0.18)' : `${PURPLE}12` }}
          >
            <Icon className="w-[18px] h-[18px]" style={{ color: solid ? '#fff' : PURPLE }} />
          </div>
          
          {/* Filter */}
          <div className={`flex items-center rounded-full p-0.5 ${solid ? 'bg-white/10' : 'bg-gray-50 border border-gray-100'}`}>
            {TIME_FILTERS.map(t => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={`px-2 py-0.5 text-[9px] font-medium rounded-full transition-all ${
                  timeFilter === t 
                    ? solid ? 'bg-white text-[#5433EB]' : 'bg-[#5433EB] text-white' 
                    : solid ? 'text-white/60 hover:text-white' : 'text-gray-400 hover:text-black'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <p className="text-[12px] font-medium" style={{ color: solid ? 'rgba(255,255,255,0.7)' : '#9ca3af' }}>
          {label}
        </p>

        <p className="text-[28px] font-bold tracking-tight leading-none mt-1" style={{ color: solid ? '#fff' : '#000' }}>
          {formatValue(value)}
        </p>

        <div className="flex items-center justify-between mt-auto pt-4">
          <p className="text-[11px] flex items-center gap-1" style={{ color: solid ? 'rgba(255,255,255,0.55)' : '#9ca3af' }}>
            {up
              ? <TrendingUp className="w-3.5 h-3.5" style={{ color: solid ? 'rgba(255,255,255,0.7)' : '#22c55e' }} />
              : <TrendingDown className="w-3.5 h-3.5" style={{ color: solid ? '#fca5a5' : '#ef4444' }} />}
            {sub}
          </p>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm"
            style={{
              background: up ? (solid ? 'rgba(255,255,255,0.22)' : '#dcfce7') : (solid ? 'rgba(255,80,80,0.25)' : '#fee2e2'),
              color: up ? (solid ? '#fff' : '#16a34a') : (solid ? '#fca5a5' : '#dc2626'),
            }}
          >
            {up ? '+' : ''}{pct}%
          </span>
        </div>
      </div>
    </div>
  );
}