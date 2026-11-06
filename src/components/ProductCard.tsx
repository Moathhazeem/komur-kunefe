import React, { useEffect, useState } from 'react';
import { Droplets, Flame, Share2, ShoppingBag, Sparkles, Star, Tag } from 'lucide-react';
import { Product } from '../types';
import { calculateProductRating, getReviewsByProductId } from '../utils/reviewsStorage';
import { useScrollReveal } from '../hooks/useScrollReveal';
const CHARCOAL_SUBTITLES = [
  'مخبوزة على جمر الفحم',
  'جبنة نابلسية أصيلة',
  'سمن بلدي فاخر',
  'قرمشة ذهبية كل مرة',
  'كنافة طازجة على الفحم',
];

const getProductSubtitle = (product: Product) => {
  if (product.id === 'healthy-syrup') return 'قطر صحي بأحجام متعددة';
  if (product.category === 'charcoal') {
    const productIndex = Array.from(product.id).reduce((sum, character) => sum + character.charCodeAt(0), 0);
    return CHARCOAL_SUBTITLES[productIndex % CHARCOAL_SUBTITLES.length];
  }
  if (product.category === 'nutella') return 'شوكولاتة غنية مع جمر الفحم';
  if (product.category === 'oriental') return 'حلوى شرقية بطابع أصيل';
  if (product.category === 'beverages') return 'مشروب منعش يكمل طلبك';
  return 'تحضير طازج بمكونات مختارة';
};

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
  revealDelay?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails, revealDelay = 0 }) => {
  const [imageError, setImageError] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [rating, setRating] = useState({ averageRating: 0, totalReviews: 0 });
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ delay: revealDelay });
  const minPrice = product.variants.length ? Math.min(...product.variants.map((variant) => variant.price)) : product.basePrice;
  const subtitle = getProductSubtitle(product);
  const formattedRating = rating.totalReviews ? rating.averageRating.toFixed(2).replace(/(\.\d)0$/, '$1') : '0.0';

  useEffect(() => setRating(calculateProductRating(getReviewsByProductId(product.id))), [product.id]);

  const share = (platform: 'whatsapp' | 'copy') => {
    const url = `${window.location.origin}/product/${product.id}`;
    const message = `جرب ${product.name} من كُومُر كُونافيه — يبدأ من ${minPrice} شيكل.\n${url}`;
    if (platform === 'whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    else navigator.clipboard?.writeText(url);
    setShareOpen(false);
  };

  return (
    <article ref={ref} role="link" tabIndex={0} aria-label={`عرض تفاصيل ${product.name}`} onClick={() => onOpenDetails(product)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpenDetails(product); } }} className={`reveal-card ${isVisible ? 'is-visible' : ''} group cursor-pointer overflow-hidden rounded-[26px] border border-[#35241A]/10 bg-white shadow-[0_12px_35px_rgba(53,36,26,.06)] transition-all duration-500 hover:-translate-y-1 hover:border-[#C7652D]/40 hover:shadow-[0_22px_48px_rgba(53,36,26,.12)]`}>
      <div className="relative aspect-[1.08] overflow-hidden bg-[#F0E8DC]">
        {product.image && !imageError ? (
          <img src={product.image} alt={product.name} loading="lazy" onError={() => setImageError(true)} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-[#35241A] text-center text-[#F7F0E5]">
            {product.id === 'healthy-syrup' ? <Droplets className="h-10 w-10 text-[#DAB775]" /> : <Flame className="h-10 w-10 text-[#DAB775]" />}
            <span className="text-sm font-bold">{product.id === 'healthy-syrup' ? 'قطر صحي بأحجام متعددة' : 'تُخبز على جمر الفحم'}</span>
          </div>
        )}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <button type="button" onClick={(event) => { event.stopPropagation(); setShareOpen((open) => !open); }} aria-label="مشاركة الصنف" className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-[#17120F]/70 text-white backdrop-blur-sm hover:bg-[#C7652D] active:scale-95 transition-all"><Share2 className="h-4 w-4" /></button>
          <div className="flex flex-col items-end gap-1.5">
            {product.featured && <span className="flex items-center gap-1 rounded-full bg-[#DAB775] px-2.5 py-1 text-[10px] font-black text-[#35241A]"><Sparkles className="h-3 w-3" /> اختيارنا</span>}
            {!product.isAvailable && <span className="rounded-full bg-[#17120F]/80 px-2.5 py-1 text-[10px] font-bold text-white">غير متوفر الآن</span>}
          </div>
        </div>
        {product.isInitialPrice && <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-[#C7652D] backdrop-blur-sm"><Tag className="h-3 w-3" /> سعر تقديري</span>}
        {shareOpen && <div onClick={(event) => event.stopPropagation()} className="absolute left-3 top-14 z-10 flex w-36 flex-col gap-1 rounded-2xl border border-white/20 bg-[#17120F]/95 p-1.5 text-xs font-bold text-white shadow-xl"><button type="button" onClick={() => share('whatsapp')} className="flex min-h-[44px] items-center rounded-xl px-3 py-2 text-right hover:bg-white/10">واتساب</button><button type="button" onClick={() => share('copy')} className="flex min-h-[44px] items-center rounded-xl px-3 py-2 text-right hover:bg-white/10">نسخ الرابط</button></div>}
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-black leading-tight text-[#211814] line-clamp-2">{product.name}</h3>
            <p className="mt-1.5 text-xs font-semibold leading-relaxed text-[#75675C] line-clamp-2">{subtitle}</p>
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#F7F0E5] px-2.5 py-1 text-[10px] font-bold text-[#75675C]" aria-label={`التقييم ${formattedRating} من 5 من ${rating.totalReviews} تقييم`}><Star className="h-3 w-3 text-[#DAB775]" /> {formattedRating}<span className="text-[9px] text-[#9B8C80]">({rating.totalReviews})</span></span>
        </div>
        <div className="flex items-end justify-between gap-3 border-t border-[#35241A]/10 pt-4">
          <div><span className="block text-[10px] font-medium text-[#75675C]">يبدأ من</span><span className="text-xl sm:text-2xl font-black text-[#C7652D]">{minPrice}<small className="mr-1 text-xs text-[#75675C]">₪</small></span></div>
          <button type="button" onClick={(event) => { event.stopPropagation(); onOpenDetails(product); }} disabled={!product.isAvailable} className="flex min-h-[44px] items-center gap-2 rounded-full bg-[#17120F] px-4 py-2.5 text-xs font-black text-white hover:bg-[#C7652D] active:scale-95 transition-all disabled:cursor-not-allowed disabled:bg-[#D9D0C7]"><ShoppingBag className="h-4 w-4" /> {product.isAvailable ? 'اختيار الحجم' : 'غير متوفر'}</button>
        </div>
      </div>
    </article>
  );
};
