import React, { useState, useId } from 'react';
import { Clock, Flame, TrendingUp, Sparkles, Activity } from 'lucide-react';

interface PeakHoursAreaChartProps {
  hourlyDistribution?: Record<number, number>;
  className?: string;
}

export const PeakHoursAreaChart: React.FC<PeakHoursAreaChartProps> = ({
  hourlyDistribution = {},
  className = ''
}) => {
  const chartId = useId();
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  // Normalize 24 hours (0 to 23)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const data = hours.map((h) => ({
    hour: h,
    count: hourlyDistribution[h] ?? (hourlyDistribution[String(h) as any] || 0)
  }));

  const totalOrders = data.reduce((sum, d) => sum + d.count, 0);
  const maxCount = Math.max(...data.map(d => d.count), 6);
  const peakItem = [...data].sort((a, b) => b.count - a.count)[0];

  // Helper: Format hour in Arabic 12-hour format
  const formatArabicHour = (h: number): string => {
    if (h === 0) return '12:00 منتصف الليل';
    if (h === 12) return '12:00 ظهراً';
    if (h < 12) return `${h}:00 صباحاً`;
    return `${h - 12}:00 مساءً`;
  };

  const formatShortHour = (h: number): string => {
    if (h === 0) return '12 ص';
    if (h === 12) return '12 م';
    if (h < 12) return `${h} ص`;
    return `${h - 12} م`;
  };

  // SVG Geometry Settings
  const width = 760;
  const height = 240;
  const padding = { top: 35, right: 35, bottom: 45, left: 45 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Map data to coordinates (RTL friendly, but SVG coordinates: left to right x increases)
  const points = data.map((d, index) => {
    const x = padding.left + (index / (data.length - 1)) * innerWidth;
    const y = padding.top + innerHeight - (d.count / maxCount) * innerHeight;
    return { ...d, x, y };
  });

  // Generate smooth cubic Bezier path
  const generateSmoothPath = (pts: Array<{ x: number; y: number }>) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;

    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i < pts.length - 2 ? pts[i + 2] : p2;

      // Catmull-Rom to Cubic Bezier conversion
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;

      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    return d;
  };

  const smoothLinePath = generateSmoothPath(points);
  
  // Create closed area path
  const baselineY = padding.top + innerHeight;
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const areaPath = `${smoothLinePath} L ${lastPoint.x} ${baselineY} L ${firstPoint.x} ${baselineY} Z`;

  // Grid lines
  const gridSteps = 4;
  const gridValues = Array.from({ length: gridSteps + 1 }, (_, i) => 
    Math.round((maxCount / gridSteps) * i)
  );

  // Active hover point
  const activePoint = hoveredHour !== null ? points.find(p => p.hour === hoveredHour) : null;

  // Mouse move handler to find closest hour
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const relativeX = (clientX / rect.width) * width;

    // Calculate nearest hour index
    const clampedX = Math.max(padding.left, Math.min(padding.left + innerWidth, relativeX));
    const normalized = (clampedX - padding.left) / innerWidth;
    const hourIndex = Math.round(normalized * (data.length - 1));
    setHoveredHour(hourIndex);
  };

  return (
    <div className={`bg-white border border-amber-100 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm hover:shadow-md transition-all ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-sm">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base font-heading">
              ساعات الذروة والنشاط اليومي (Fluid Area Chart)
            </h3>
            <p className="text-xs text-slate-400">
              توزيع حركة الطلبات على مدار 24 ساعة لتحديد أوقات الإقبال الأشد
            </p>
          </div>
        </div>

        {/* Peak Callout Badge */}
        {peakItem && peakItem.count > 0 && (
          <div className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-900 font-bold text-xs flex items-center gap-2 self-start sm:self-auto shadow-xs">
            <Flame className="w-4 h-4 text-orange-600 animate-pulse" />
            <span>
              ساعة الذروة الكبرى: <strong className="text-orange-700">{formatShortHour(peakItem.hour)}</strong> ({peakItem.count} طلب)
            </span>
          </div>
        )}
      </div>

      {/* Area Chart SVG Container */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredHour(null)}
        >
          <defs>
            {/* Fluid Area Gradient */}
            <linearGradient id={`areaGradient-${chartId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#ea580c" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>

            {/* Glowing Stroke Gradient */}
            <linearGradient id={`lineGradient-${chartId}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>

            {/* Shadow filter for top line */}
            <filter id={`glow-${chartId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#f59e0b" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Horizontal Gridlines & Y-Axis values */}
          {gridValues.map((val) => {
            const y = padding.top + innerHeight - (val / maxCount) * innerHeight;
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + innerWidth}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                  strokeDasharray={val === 0 ? 'none' : '4 4'}
                />
                <text
                  x={padding.left - 10}
                  y={y + 3.5}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px] font-mono tabular-nums font-bold"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Fluid Area Fill */}
          <path
            d={areaPath}
            fill={`url(#areaGradient-${chartId})`}
            className="transition-all duration-300"
          />

          {/* Smooth Line Stroke */}
          <path
            d={smoothLinePath}
            fill="none"
            stroke={`url(#lineGradient-${chartId})`}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#glow-${chartId})`}
          />

          {/* X-Axis Hour Labels (every 3 hours) */}
          {points
            .filter((p) => p.hour % 3 === 0 || p.hour === 23)
            .map((p) => (
              <g key={p.hour} transform={`translate(${p.x}, ${baselineY + 18})`}>
                <text
                  textAnchor="middle"
                  className="fill-slate-400 text-[10px] font-sans font-bold"
                >
                  {formatShortHour(p.hour)}
                </text>
              </g>
            ))}

          {/* Peak Point Static Highlight */}
          {peakItem && peakItem.count > 0 && (
            (() => {
              const peakPt = points.find(p => p.hour === peakItem.hour);
              if (!peakPt) return null;
              return (
                <g transform={`translate(${peakPt.x}, ${peakPt.y})`}>
                  <circle r="7" fill="#ea580c" opacity="0.25" className="animate-ping" />
                  <circle r="5" fill="#ea580c" stroke="#ffffff" strokeWidth="2" />
                </g>
              );
            })()
          )}

          {/* Interactive Hover Guides & Active Point */}
          {activePoint && (
            <g>
              {/* Vertical Guide Line */}
              <line
                x1={activePoint.x}
                y1={padding.top}
                x2={activePoint.x}
                y2={baselineY}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.8"
              />

              {/* Glowing Active Marker */}
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="6"
                fill="#ea580c"
                stroke="#ffffff"
                strokeWidth="2.5"
                filter={`url(#glow-${chartId})`}
              />
            </g>
          )}
        </svg>

        {/* Floating Tooltip HTML Overlay */}
        {activePoint && (
          <div
            className="absolute z-10 pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-75"
            style={{
              left: `${(activePoint.x / width) * 100}%`,
              top: `${Math.max(10, ((activePoint.y - 12) / height) * 100)}%`
            }}
          >
            <div className="bg-slate-900/95 text-white px-3 py-2 rounded-xl shadow-xl border border-amber-500/40 text-xs backdrop-blur-sm whitespace-nowrap space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold text-amber-200">
                  {formatArabicHour(activePoint.hour)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 font-mono pt-0.5">
                <span className="text-white font-black text-sm">
                  {activePoint.count} <span className="text-slate-300 text-xs font-normal">طلب</span>
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                  {totalOrders > 0 ? Math.round((activePoint.count / totalOrders) * 100) : 0}% من اليوم
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Insights & Kitchen Prep Guideline */}
      <div className="p-3.5 bg-gradient-to-l from-amber-50/70 via-orange-50/40 to-slate-50 rounded-xl border border-amber-200/60 text-xs text-slate-700 flex items-start gap-2.5">
        <Flame className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-amber-900">نصيحة التشغيل وفرن الفحم: </strong>
          تتركز ذروة الطلب في رافدية بنابلس بين <strong className="text-amber-800">الساعة 6:00 مساءً وحتى 11:00 مساءً</strong>. ننصح بتجهيز كميات إضافية من جمر الفحم الطبيعي وصواني الجبنة البلدية المحلاة قبل الساعة 5:30 مساءً لضمان سرعة إخراج الطلبات الساخنة دون تأخير.
        </div>
      </div>
    </div>
  );
};

