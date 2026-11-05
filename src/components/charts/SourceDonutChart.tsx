import React, { useState } from 'react';
import { Share2, Globe, MessageCircle, Instagram, Facebook, PieChart, Layers } from 'lucide-react';

interface SourceDonutChartProps {
  sources?: Record<string, number>;
  className?: string;
}

interface Segment {
  id: string;
  name: string;
  count: number;
  percentage: number;
  color: string;
  hoverColor: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const SourceDonutChart: React.FC<SourceDonutChartProps> = ({
  sources = {},
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'macro' | 'channels'>('macro');
  const [hoveredSegmentId, setHoveredSegmentId] = useState<string | null>(null);

  // Normalize counts
  const instagram = sources.instagram || 0;
  const whatsapp = sources.whatsapp || 0;
  const facebook = sources.facebook || 0;
  const website = sources.website || 0;

  const socialCount = instagram + whatsapp + facebook;
  const total = Math.max(socialCount + website, 1);

  // Macro view segments: Social Media vs Website Direct
  const macroSegments: Segment[] = [
    {
      id: 'social',
      name: 'وسائل التواصل الاجتماعي',
      count: socialCount,
      percentage: Math.round((socialCount / total) * 100),
      color: '#ec4899', // pink-500
      hoverColor: '#db2777',
      textColor: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      icon: Share2,
    },
    {
      id: 'website',
      name: 'الموقع المباشر',
      count: website,
      percentage: Math.round((website / total) * 100),
      color: '#f59e0b', // amber-500
      hoverColor: '#d97706',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      icon: Globe,
    }
  ];

  // Detailed channel segments
  const channelSegments: Segment[] = [
    {
      id: 'instagram',
      name: 'إنستغرام (Instagram)',
      count: instagram,
      percentage: Math.round((instagram / total) * 100),
      color: '#e1306c',
      hoverColor: '#c13584',
      textColor: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      icon: Instagram,
    },
    {
      id: 'whatsapp',
      name: 'واتساب (WhatsApp)',
      count: whatsapp,
      percentage: Math.round((whatsapp / total) * 100),
      color: '#10b981', // emerald-500
      hoverColor: '#059669',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      icon: MessageCircle,
    },
    {
      id: 'facebook',
      name: 'فيسبوك (Facebook)',
      count: facebook,
      percentage: Math.round((facebook / total) * 100),
      color: '#d97706', // amber-600 warm charcoal brand theme
      hoverColor: '#b45309',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-100',
      borderColor: 'border-amber-300',
      icon: Facebook,
    },
    {
      id: 'website',
      name: 'الموقع المباشر (Web)',
      count: website,
      percentage: Math.round((website / total) * 100),
      color: '#f59e0b', // amber-500
      hoverColor: '#d97706',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      icon: Globe,
    }
  ];

  const currentSegments = viewMode === 'macro' ? macroSegments : channelSegments;
  const activeSegment = currentSegments.find(s => s.id === hoveredSegmentId) || null;

  // SVG Geometry for Donut
  const size = 200;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2; // radius ~ 86
  const circumference = 2 * Math.PI * radius;

  // Calculate slice offsets
  let accumulatedOffset = 0;
  const slices = currentSegments.map(seg => {
    const fraction = total > 0 ? seg.count / total : 0;
    const strokeDash = fraction * circumference;
    const currentOffset = accumulatedOffset;
    accumulatedOffset += strokeDash;

    return {
      ...seg,
      strokeDasharray: `${strokeDash} ${circumference}`,
      strokeDashoffset: -currentOffset,
    };
  });

  return (
    <div className={`bg-white border border-amber-100 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm hover:shadow-md transition-all ${className}`}>
      {/* Header & Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 via-rose-500 to-amber-500 text-white flex items-center justify-center shadow-sm">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base font-heading">
              مصادر الطلبات والزبائن (Donut Chart)
            </h3>
            <p className="text-xs text-slate-400">
              نسبة الطلبات القادمة من وسائل التواصل مقابل الموقع الإلكتروني
            </p>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 self-start sm:self-auto text-xs">
          <button
            onClick={() => { setViewMode('macro'); setHoveredSegmentId(null); }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'macro'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-pink-500" />
            <span>السوشال مقابل الموقع</span>
          </button>
          <button
            onClick={() => { setViewMode('channels'); setHoveredSegmentId(null); }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'channels'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            <span>تفصيل القنوات الأربعة</span>
          </button>
        </div>
      </div>

      {/* Main Visual Layout: Donut SVG + Legend Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Donut SVG Graphic with Center Metrics */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative py-2">
          <div className="relative w-[210px] h-[210px] flex items-center justify-center">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox={`0 0 ${size} ${size}`}
            >
              {/* Background circle track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#f1f5f9"
                strokeWidth={strokeWidth}
              />

              {/* Slices */}
              {slices.map((slice) => {
                const isHovered = hoveredSegmentId === slice.id;
                return (
                  <circle
                    key={slice.id}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={isHovered ? slice.hoverColor : slice.color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredSegmentId(slice.id)}
                    onMouseLeave={() => setHoveredSegmentId(null)}
                    style={{
                      filter: isHovered ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' : 'none'
                    }}
                  />
                );
              })}
            </svg>

            {/* Donut Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
              {activeSegment ? (
                <div className="animate-fadeIn space-y-0.5">
                  <span className={`text-[11px] font-bold block ${activeSegment.textColor}`}>
                    {activeSegment.name}
                  </span>
                  <div className="text-2xl font-black text-slate-800 font-mono">
                    {activeSegment.percentage}%
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold block font-mono">
                    {activeSegment.count} طلب
                  </span>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-slate-400 block">
                    إجمالي الطلبات
                  </span>
                  <div className="text-3xl font-black text-slate-800 font-heading">
                    {total}
                  </div>
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold inline-block">
                    {total} طلب مؤكد
                  </span>
                </div>
              )}
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 text-center">
            * مرر المؤشر فوق أي قسم لعرض النسبة والعدد الدقيق
          </p>
        </div>

        {/* Right: Legend Breakdown Cards */}
        <div className="lg:col-span-7 space-y-3">
          {/* Macro Ratio Highlight Bar */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-pink-600 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5" />
                سوشال ميديا ({Math.round((socialCount / total) * 100)}%)
              </span>
              <span className="text-amber-600 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                الموقع المباشر ({Math.round((website / total) * 100)}%)
              </span>
            </div>
            
            {/* Split Progress Track */}
            <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-rose-400 transition-all duration-500"
                style={{ width: `${(socialCount / total) * 100}%` }}
                title={`السوشال ميديا: ${Math.round((socialCount / total) * 100)}%`}
              />
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                style={{ width: `${(website / total) * 100}%` }}
                title={`الموقع الإلكتروني: ${Math.round((website / total) * 100)}%`}
              />
            </div>
          </div>

          {/* Cards for each Channel / Segment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {currentSegments.map((seg) => {
              const Icon = seg.icon;
              const isHovered = hoveredSegmentId === seg.id;

              return (
                <div
                  key={seg.id}
                  onMouseEnter={() => setHoveredSegmentId(seg.id)}
                  onMouseLeave={() => setHoveredSegmentId(null)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${seg.bgColor} ${
                    isHovered
                      ? `${seg.borderColor} shadow-sm ring-1 ring-current scale-[1.01]`
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-xs"
                        style={{ backgroundColor: seg.color }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 text-xs block leading-tight">
                          {seg.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {seg.count} طلب
                        </span>
                      </div>
                    </div>

                    <div className="text-left font-mono">
                      <span className={`text-base font-black ${seg.textColor}`}>
                        {seg.percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Channel Insight */}
          <div className="text-[11px] text-slate-500 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100 flex items-center justify-between">
            <span>
              💡 <strong>ملاحظة تسويقية:</strong> تستحوذ منصات التواصل على الحصة الكبرى من الطلبات، ويُعد إنستغرام وواتساب القنوات الأسرع تحويلاً للزبائن.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

