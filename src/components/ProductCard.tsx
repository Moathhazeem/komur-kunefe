import React, { useState } from 'react';
import { Flame, Plus, Check, Share2, Sparkles, Tag } from 'lucide-react';
import { Product, ProductVariant } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  // Selected variant (defaults to default variant or first variant)
  const defaultVar = product.variants.find((v) => v.isDefault) || product.variants[0] || {
    id: 'default',
    name: 'حجم واحد',
    price: product.basePrice,
  };

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(defaultVar);
  const [justAdded, setJustAdded] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleAdd = () => {
    onAddToCart(product, selectedVariant, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  const currentPrice = selectedVariant.price || product.basePrice;

  const shareProduct = (platform: 'whatsapp' | 'facebook' | 'copy') => {
    const shareUrl = `${window.location.origin}/#menu?product=${product.id}&utm_source=${platform}`;
    const text = `جرب ${product.name} من Kömür Künefe — كنافة ع الفحم في رافدية، نابلس! السعر: ${currentPrice} شيكل.`;

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
    <div className="group relative bg-white hover:bg-orange-50/30 rounded-2xl border border-orange-100 hover:border-orange-300 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1">
      
      {/* Top Media & Badges */}
      <div className="relative aspect-4/3 w-full bg-orange-50/50 overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : null}

        {/* Elegant Placeholder overlay if no image or fallback */}
        {!product.image && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100/40 text-center p-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center mb-2 shadow-inner">
              <Flame className="w-8 h-8 text-orange-500" />
            </div>
            <span className="text-xs font-bold text-slate-700 font-heading">
              كنافة نابلسية ع الفحم
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">صورة قيد الرفع</span>
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
          {product.featured && (
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-white" />
              الأكثر طلبًا
            </span>
          )}
          {product.isSeasonal && (
            <span className="bg-rose-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-xs">
              موسمي خاص
            </span>
          )}
        </div>

        {/* Indicator */}
        {product.isInitialPrice && (
          <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-orange-200 flex items-center gap-1 z-10 shadow-xs" title="سعر السوق التقديري - يخضع لمراجعة المحل">
            <Tag className="w-3 h-3 text-orange-500" />
            <span>سعر تقديري</span>
          </div>
        )}

        {/* Quick Share Trigger */}
        <button
          onClick={() => setShowShareModal(true)}
          className="absolute top-2.5 left-2.5 w-8 h-8 rounded-lg bg-white/80 hover:bg-orange-500 text-slate-600 hover:text-white transition-colors flex items-center justify-center backdrop-blur-sm border border-slate-200/60 shadow-xs z-10"
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
            <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors font-heading leading-tight">
              {product.name}
            </h3>
          </div>
          
          <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed mb-3">
            {product.description}
          </p>
        </div>

        {/* Variants / Size Picker */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">الحجم:</span>
            {product.variants.length > 1 ? (
              <span className="text-[11px] text-orange-600 font-medium">متوفر بأحجام متعددة</span>
            ) : (
              <span className="text-[11px] text-slate-400">حجم واحد</span>
            )}
          </div>

          {/* Size buttons */}
          <div className="grid grid-cols-2 gap-1.5">
            {product.variants.map((v) => {
              const isSelected = selectedVariant.id === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariant(v)}
                  className={`px-2 py-1.5 rounded-xl text-xs font-semibold text-right transition-all border ${
                    isSelected
                      ? 'bg-orange-50 text-orange-600 border-orange-400 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-orange-200'
                  }`}
                >
                  <div className="truncate">{v.name}</div>
                  <div className="text-[11px] font-black text-orange-600">{v.price} ₪</div>
                </button>
              );
            })}
          </div>

          {/* Price & Add to Cart action */}
          <div className="pt-2 flex items-center justify-between gap-2">
            <div>
              <span className="text-xs text-slate-400 block">السعر</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black text-orange-600 font-heading">
                  {currentPrice}
                </span>
                <span className="text-xs font-bold text-slate-500">شيكل</span>
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={!product.isAvailable}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xs ${
                !product.isAvailable
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : justAdded
                  ? 'bg-emerald-600 text-white scale-95'
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white hover:scale-[1.02] shadow-orange-100'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>تمت الإضافة!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>إضافة للسلة</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Share Modal Backdrop */}
      {showShareModal && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm p-4 flex flex-col justify-center items-center text-center z-20 animate-fadeIn">
          <h4 className="text-sm font-bold text-slate-900 mb-1 font-heading">مشاركة {product.name}</h4>
          <p className="text-xs text-slate-500 mb-4">شارك هذا الصنف اللذيذ عبر منصتك المفضلة</p>
          <div className="flex flex-col gap-2 w-full max-w-[200px]">
            <button
              onClick={() => shareProduct('whatsapp')}
              className="py-2 px-3 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              واتساب
            </button>
            <button
              onClick={() => shareProduct('facebook')}
              className="py-2 px-3 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              فيسبوك
            </button>
            <button
              onClick={() => shareProduct('copy')}
              className="py-2 px-3 rounded-xl bg-orange-50 text-orange-700 font-bold text-xs border border-orange-200 hover:bg-orange-100 transition-colors"
            >
              نسخ الرابط
            </button>
            <button
              onClick={() => setShowShareModal(false)}
              className="mt-1 text-xs text-slate-400 hover:text-slate-600"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
