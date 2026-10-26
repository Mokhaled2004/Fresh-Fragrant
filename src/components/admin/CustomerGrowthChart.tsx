'use client';

import { useEffect, useState, useRef } from 'react';

const GREEN = '#34D399';

interface CustomerGrowthChartProps {
  userGrowth?: { month: string; count: number }[];
  growthPct?: number;
}

const MOCK_GROWTH = [
  { month: 'Jan', count: 120 },
  { month: 'Feb', count: 210 },
  { month: 'Mar', count: 180 },
  { month: 'Apr', count: 340 },
  { month: 'May', count: 290 },
  { month: 'Jun', count: 450 },
  { month: 'Jul', count: 520 },
];

export function CustomerGrowthChart({ 
  userGrowth = MOCK_GROWTH, 
  growthPct = 15.4 
}: CustomerGrowthChartProps) {
  const [mounted, setMounted] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const maxCount = Math.max(...userGrowth.map(r => r.count), 1);
  
  const width = 1000;
  const height = 300;
  const paddingX = 20;
  const paddingY = 20;

  // Calculate points
  const getPoint = (val: number, index: number) => {
    const x = paddingX + (index / Math.max(userGrowth.length - 1, 1)) * (width - paddingX * 2);
    const y = height - (val / maxCount) * (height - paddingY * 2) - paddingY;
    return { x, y };
  };

  const points = userGrowth.map((r, i) => getPoint(r.count, i));

  // Generate Smooth Curve Path
  const getCurvePath = (pts: { x: number, y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 3;
      const cp1y = p0.y;
      const cp2x = p0.x + 2 * (p1.x - p0.x) / 3;
      const cp2y = p1.y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const linePath = getCurvePath(points);
  const areaPath = linePath ? `${linePath} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z` : '';

  // Handle Mouse Move for Tooltips
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const svgX = (x / rect.width) * width;
    
    let closestIndex = 0;
    let minDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - svgX);
      if (dist < minDist) {
        minDist = dist;
        closestIndex = i;
      }
    });
    setHoveredIndex(closestIndex);
  };

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] flex flex-col h-full relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-start justify-between mb-8 z-10">
        <div>
          <p className="text-[15px] font-medium text-black">Customer Growth</p>
          <p className="text-[12px] text-gray-400 mt-0.5">New registrations per month</p>
        </div>
        
        {/* Growth Badge & Info */}
        <div className="flex flex-col items-end gap-1">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${growthPct >= 0 ? 'bg-[#e8f8ef] text-[#22c55e]' : 'bg-[#feecec] text-[#ef4444]'}`}>
            {growthPct >= 0 ? '+' : ''}{growthPct}%
          </span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative flex-1 h-[240px]">
        {userGrowth.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-[13px] text-gray-400">
            No data available
          </div>
        )}
        
        {userGrowth.length > 0 && (
          <svg 
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`} 
            className="w-full h-full overflow-visible cursor-crosshair"
            preserveAspectRatio="none"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Background Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <line 
                key={i}
                x1={paddingX} 
                y1={height - (ratio * (height - paddingY * 2)) - paddingY} 
                x2={width - paddingX} 
                y2={height - (ratio * (height - paddingY * 2)) - paddingY} 
                stroke="#f3f4f6" 
                strokeDasharray="4 4"
                vectorEffect="non-scaling-stroke"
              />
            ))}

            <defs>
              {/* Gradient for the Area Fill */}
              <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={GREEN} stopOpacity="0.25" />
                <stop offset="100%" stopColor={GREEN} stopOpacity="0" />
              </linearGradient>

              {/* Glow Effect for the Line */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Filled Area */}
            <path 
              d={areaPath} 
              fill="url(#greenGradient)" 
              className={`transition-opacity duration-1000 delay-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}
            />

            {/* The Glowing Line */}
            <path 
              d={linePath} 
              fill="none" 
              stroke={GREEN} 
              strokeWidth="4" 
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              className="transition-all duration-[1500ms] ease-out"
              style={{ strokeDasharray: 3000, strokeDashoffset: mounted ? 0 : 3000 }}
            />

            {/* The Data Dots (Only visible on hover) */}
            {hoveredIndex !== null && (
              <g>
                {/* Vertical Guide Line */}
                <line 
                  x1={points[hoveredIndex].x} 
                  y1={paddingY} 
                  x2={points[hoveredIndex].x} 
                  y2={height} 
                  stroke="#d1d5db" 
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  vectorEffect="non-scaling-stroke"
                />
                {/* Highlighted Dot */}
                <circle 
                  cx={points[hoveredIndex].x} 
                  cy={points[hoveredIndex].y} 
                  r="6" 
                  fill="#fff" 
                  stroke={GREEN} 
                  strokeWidth="3"
                  vectorEffect="non-scaling-stroke"
                  className="shadow-lg"
                />
              </g>
            )}
          </svg>
        )}

        {/* Floating Tooltip */}
        {hoveredIndex !== null && (
          <div 
            className="absolute bg-[#1e1b4b] text-white text-[12px] font-medium py-2 px-3 rounded-lg shadow-xl pointer-events-none z-20 transition-all duration-75"
            style={{ 
              left: `${(points[hoveredIndex].x / width) * 100}%`, 
              top: `${(points[hoveredIndex].y / height) * 100}%`,
              transform: 'translate(-50%, -120%)',
            }}
          >
            {userGrowth[hoveredIndex].count} users
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1e1b4b] rotate-45" />
          </div>
        )}
      </div>

      {/* X Axis Labels */}
      <div className="flex justify-between px-2 pt-4 border-t border-gray-50 mt-2">
        {userGrowth.map((item, i) => (
          <span key={i} className="text-[11px] font-medium text-gray-400">
            {item.month}
          </span>
        ))}
      </div>
    </div>
  );
}