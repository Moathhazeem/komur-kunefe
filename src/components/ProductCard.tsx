import React, { useState } from 'react';
import { Flame, Sparkles, Tag, ShoppingBag, Share2, ArrowLeft } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Calculate lowest price among variants or base price
  const minPrice =
    product.variants && product.variants.length > 0
      ? Math.min(...product.variants.map((v) => v.price || product.basePrice))
      : product.basePrice;

  const shareProduct = (e: React.MouseEvent, platform: 'whatsapp' | 'facebook' | 'copy') => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/#menu?product=${product.id}&utm_source=${platform}`;
    const text = `جرب ${product.name} من Kömür Künefe — كنافة ع الفحم في رافدية، نابلس! يبدأ من ${minPrice} شيكل.`;

    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + shareUrl)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('تم نسخ رابط الصنف بنجاح لمشاركته!');
    }
    setShowShareModal(false);
  };

  return (
    <div
      onClick={() => onOpenDetails(product)}
      className="group relative bg-white hover:bg-stone-50/50 rounded-2xl border border-stone-200 hover:border-[#DD6B20]/40 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenDetails(product);
        }
      }}
      aria-label={`عرض تفاصيل واختيار حجم ${product.name}`}
    >
      {/* Top Media & Badges */}
      <div className="relative aspect-4/3 w-full bg-[#DD6B20]/5 overflow-hidden">
        {product.image && !imageError ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#DD6B20]/10 via-stone-50 to-[#DD6B20]/5 text-center p-4">
            <div className="w-14 h-14 rounded-2xl bg-[#DD6B20]/10 border border-[#DD6B20]/20 flex items-center justify-center mb-2 shadow-inner">
              <Flame className="w-8 h-8 text-[#DD6B20]" />
            </div>
            <span className="text-xs font-bold text-slate-700 font-heading">
              كنافة نابلسية ع الفحم
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">تُخبز طازجة</span>
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
          {product.featured && (
            <span className="bg-[#DD6B20] text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-white" />
              الأكثر طلبًا
            </span>
          )}
          {product.isSeasonal && (
            <span className="bg-rose-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
              موسمي خاص
            </span>
          )}
        </div>

        {/* Estimated Price Indicator */}
        {product.isInitialPrice && (
          <div
            className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-sm text-[#DD6B20] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#DD6B20]/25 flex items-center gap-1 z-10 shadow-xs"
            title="سعر السوق التقديري - يخضع لمراجعة المحل"
          >
            <Tag className="w-3 h-3 text-[#DD6B20]" />
            <span>سعر تقديري</span>
          </div>
        )}

        {/* Quick Share Trigger */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowShareModal(true);
          }}
          className="absolute top-2.5 left-2.5 w-8 h-8 rounded-lg bg-white/80 hover:bg-[#DD6B20] text-slate-600 hover:text-white transition-colors flex items-center justify-center backdrop-blur-sm border border-slate-200/60 shadow-xs z-10 cursor-pointer"
          title="مشاركة هذا الصنف"
          aria-label="مشاركة"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content & Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#DD6B20] transition-colors font-heading leading-tight">
              {product.name}
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed mb-3">
            {product.description}
          </p>
        </div>

        {/* Card Footer: Starting Price & CTA Button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">يبدأ من</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-[#DD6B20] font-heading">
                {minPrice}
              </span>
              <span className="text-xs font-bold text-slate-500">شيكل</span>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(product);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#DD6B20] hover:bg-[#C2410C] text-white shadow-xs shadow-[#DD6B20]/20 transition-all cursor-pointer group-hover:scale-[1.02]"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>اختيار الحجم</span>
          </button>
        </div>
      </div>

      {/* Share Modal Backdrop */}
      {showShareModal && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 bg-white/95 backdrop-blur-sm p-4 flex flex-col justify-center items-center text-center z-20 animate-soft-fade"
        >
          <h4 className="text-sm font-bold text-slate-900 mb-1 font-heading">
            مشاركة {product.name}
          </h4>
          <p className="text-xs text-slate-500 mb-4">
            شارك هذا الصنف اللذيذ عبر منصتك المفضلة
          </p>
          <div className="flex flex-col gap-2 w-full max-w-[200px]">
            <button
              type="button"
              onClick={(e) => shareProduct(e, 'whatsapp')}
              className="py-2 px-3 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              واتساب
            </button>
            <button
              type="button"
              onClick={(e) => shareProduct(e, 'facebook')}
              className="py-2 px-3 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
            >
              فيسبوك
            </button>
            <button
              type="button"
              onClick={(e) => shareProduct(e, 'copy')}
              className="py-2 px-3 rounded-xl bg-[#DD6B20]/10 text-[#DD6B20] font-bold text-xs border border-[#DD6B20]/20 hover:bg-[#DD6B20]/15 transition-colors cursor-pointer"
            >
              نسخ الرابط
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowShareModal(false);
              }}
              className="mt-1 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
