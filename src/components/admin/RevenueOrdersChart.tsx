'use client';

import { useEffect, useState, useRef } from 'react';

const PURPLE = '#5433EB';
const BLUE   = '#3B82F6';

interface RevenueOrdersChartProps {
  monthlyRevenue?: { month: string; revenue: string; orderCount: number }[];
}

const MOCK_DATA = [
  { month: 'Jan', revenue: '4500', orderCount: 120 },
  { month: 'Feb', revenue: '6200', orderCount: 180 },
  { month: 'Mar', revenue: '3800', orderCount: 95 },
  { month: 'Apr', revenue: '8500', orderCount: 240 },
  { month: 'May', revenue: '7200', orderCount: 210 },
  { month: 'Jun', revenue: '9800', orderCount: 310 },
  { month: 'Jul', revenue: '8100', orderCount: 260 },
];

const TIME_FILTERS = ['Today', 'Week', 'Month'];

export function RevenueOrdersChart({ monthlyRevenue = MOCK_DATA }: RevenueOrdersChartProps) {
  const [animate, setAnimate] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const [showRevenue, setShowRevenue] = useState(true);
  const [showOrders, setShowOrders] = useState(true);
  
  const [timeFilter, setTimeFilter] = useState('Month');

  // Unique key forces React to remount the SVG paths
  const animationKey = `${showRevenue}-${showOrders}-${timeFilter}`;

  const svgRef = useRef<SVGSVGElement>(null);

  // FIXED: Dependency array size is always 3
  useEffect(() => {
    setAnimate(false);
    
    const raf = requestAnimationFrame(() => {
      const timer = setTimeout(() => {
        setAnimate(true);
      }, 50);
      return () => clearTimeout(timer);
    });

    return () => cancelAnimationFrame(raf);
  }, [showRevenue, showOrders, timeFilter]);

  const fmt = (n: number) => {
    if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
    return `$${n}`;
  };

  const maxRevenue = Math.max(...monthlyRevenue.map(r => Number(r.revenue)), 1);
  const maxOrders = Math.max(...monthlyRevenue.map(r => r.orderCount), 1);

  const width = 1000;
  const height = 300;
  const paddingX = 20;
  const paddingY = 20;

  const getPoint = (val: number, max: number, index: number) => {
    const x = paddingX + (index / Math.max(monthlyRevenue.length - 1, 1)) * (width - paddingX * 2);
    const y = height - (val / max) * (height - paddingY * 2) - paddingY;
    return { x, y };
  };

  const revenuePoints = monthlyRevenue.map((r, i) => getPoint(Number(r.revenue), maxRevenue, i));
  const orderPoints = monthlyRevenue.map((r, i) => getPoint(r.orderCount, maxOrders, i));

  const getCurvePath = (points: { x: number, y: number }[]) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 3;
      const cp1y = p0.y;
      const cp2x = p0.x + 2 * (p1.x - p0.x) / 3;
      const cp2y = p1.y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const revenueCurve = getCurvePath(revenuePoints);
  const orderCurve = getCurvePath(orderPoints);

  const revenueArea = revenueCurve ? `${revenueCurve} L ${revenuePoints[revenuePoints.length - 1].x},${height} L ${revenuePoints[0].x},${height} Z` : '';
  const orderArea = orderCurve ? `${orderCurve} L ${orderPoints[orderPoints.length - 1].x},${height} L ${orderPoints[0].x},${height} Z` : '';

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const svgX = (x / rect.width) * width;
    
    let closestIndex = 0;
    let minDist = Infinity;
    revenuePoints.forEach((p, i) => {
      const dist = Math.abs(p.x - svgX);
      if (dist < minDist) {
        minDist = dist;
        closestIndex = i;
      }
    });
    setHoveredIndex(closestIndex);
  };

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] relative w-full overflow-hidden">
      
      {/* Header Row */}
      <div className="flex items-center justify-between mb-6 relative">
        
        <div className="w-1/3 min-w-[150px]">
          <p className="text-[15px] font-medium text-black mb-0.5">Revenue & Orders</p>
          <p className="text-[12px] text-gray-400">Monthly breakdown</p>
        </div>
        
        {/* CENTERED Time Filter Buttons */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-gray-50 rounded-full p-1 border border-gray-200">
          {TIME_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-4 py-1.5 text-[12px] font-medium rounded-full transition-all duration-200 ${
                timeFilter === filter 
                  ? 'bg-[#5433EB] text-white shadow-sm' 
                  : 'text-gray-500 hover:text-black hover:bg-gray-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Legends Area */}
        <div className="w-1/3 flex items-center justify-end gap-4">
          <button 
            onClick={() => setShowRevenue(!showRevenue)}
            className={`flex items-center gap-1.5 text-[12px] transition-opacity ${showRevenue ? 'text-gray-600 opacity-100' : 'text-gray-400 opacity-50'}`}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PURPLE }} /> Revenue
          </button>
          
          <button 
            onClick={() => setShowOrders(!showOrders)}
            className={`flex items-center gap-1.5 text-[12px] transition-opacity ${showOrders ? 'text-gray-600 opacity-100' : 'text-gray-400 opacity-50'}`}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: BLUE }} /> Orders
          </button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative h-[280px] w-full mt-4">
        {monthlyRevenue.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-[13px] text-gray-400">
            No data available
          </div>
        )}

        {monthlyRevenue.length > 0 && (
          <svg 
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`} 
            className="w-full h-full overflow-visible cursor-crosshair"
            preserveAspectRatio="none"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <defs>
              <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={PURPLE} stopOpacity="0.2" />
                <stop offset="100%" stopColor={PURPLE} stopOpacity="0" />
              </linearGradient>
              <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BLUE} stopOpacity="0.15" />
                <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
              </linearGradient>
            </defs>

            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <line 
                key={`grid-${i}`}
                x1={paddingX} 
                y1={height - (ratio * (height - paddingY * 2)) - paddingY} 
                x2={width - paddingX} 
                y2={height - (ratio * (height - paddingY * 2)) - paddingY} 
                stroke="#f3f4f6" 
                strokeDasharray="4 4"
                vectorEffect="non-scaling-stroke"
              />
            ))}

            {/* REVENUE LAYER */}
            {showRevenue && (
              <g key={`revenue-${animationKey}`}>
                <path 
                  d={revenueArea} 
                  fill="url(#purpleGradient)" 
                  className={`transition-opacity duration-1000 delay-500 ${animate ? 'opacity-100' : 'opacity-0'}`}
                />
                <path 
                  d={revenueCurve} 
                  fill="none" 
                  stroke={PURPLE} 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  className="transition-all duration-[1500ms] ease-out"
                  style={{ strokeDasharray: 3000, strokeDashoffset: animate ? 0 : 3000 }}
                />
              </g>
            )}

            {/* ORDERS LAYER */}
            {showOrders && (
              <g key={`orders-${animationKey}`}>
                <path 
                  d={orderArea} 
                  fill="url(#blueGradient)" 
                  className={`transition-opacity duration-1000 delay-500 ${animate ? 'opacity-100' : 'opacity-0'}`}
                />
                <path 
                  d={orderCurve} 
                  fill="none" 
                  stroke={BLUE} 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  className="transition-all duration-[1500ms] ease-out"
                  style={{ strokeDasharray: 3000, strokeDashoffset: animate ? 0 : 3000 }}
                />
              </g>
            )}

            {/* Interactive Hover Line & Dots */}
            {hoveredIndex !== null && (
              <g>
                <line 
                  x1={revenuePoints[hoveredIndex].x} 
                  y1={paddingY} 
                  x2={revenuePoints[hoveredIndex].x} 
                  y2={height} 
                  stroke="#d1d5db" 
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  vectorEffect="non-scaling-stroke"
                />
                {showRevenue && <circle cx={revenuePoints[hoveredIndex].x} cy={revenuePoints[hoveredIndex].y} r="5" fill="#fff" stroke={PURPLE} strokeWidth="3" vectorEffect="non-scaling-stroke" />}
                {showOrders && <circle cx={orderPoints[hoveredIndex].x} cy={orderPoints[hoveredIndex].y} r="5" fill="#fff" stroke={BLUE} strokeWidth="3" vectorEffect="non-scaling-stroke" />}
              </g>
            )}
          </svg>
        )}

        {/* Floating Tooltip */}
        {hoveredIndex !== null && (
          <div 
            className="absolute top-0 bg-[#1e1b4b] text-white text-[11px] py-2 px-3 rounded-lg shadow-xl pointer-events-none z-20 transition-all duration-75"
            style={{ 
              left: `${(revenuePoints[hoveredIndex].x / width) * 100}%`, 
              transform: 'translateX(-50%)',
              marginTop: '10px'
            }}
          >
            <p className="font-semibold mb-1">{monthlyRevenue[hoveredIndex].month}</p>
            {showRevenue && (
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: PURPLE }} /> {fmt(Number(monthlyRevenue[hoveredIndex].revenue))}</div>
            )}
            {showOrders && (
              <div className="flex items-center gap-1.5 mt-0.5"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: BLUE }} /> {monthlyRevenue[hoveredIndex].orderCount} orders</div>
            )}
          </div>
        )}
      </div>

      {/* X Axis Labels */}
      <div className="flex justify-between gap-2 px-2 pt-2">
        {monthlyRevenue.map((item, i) => (
          <span key={`label-${i}`} className="flex-1 text-center text-[11px] font-medium text-gray-400">
            {item.month}
          </span>
        ))}
      </div>
    </div>
  );
}