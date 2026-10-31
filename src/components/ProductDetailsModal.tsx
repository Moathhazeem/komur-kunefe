import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  Flame,
  Sparkles,
  Tag,
  Plus,
  Minus,
  Check,
  Share2,
  Clock,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { Product, ProductVariant, Review } from '../types';
import { StarRating } from './StarRating';
import { ProductReviewsSection } from './ProductReviewsSection';
import {
  getReviewsByProductId,
  addReview as saveNewReview,
  calculateProductRating,
} from '../utils/reviewsStorage';

export interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [justAdded, setJustAdded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [showShareToast, setShowShareToast] = useState<boolean>(false);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Initialize or reset selections whenever the product changes or modal opens
  useEffect(() => {
    if (product) {
      const defaultVariant =
        product.variants.find((v) => v.isDefault) ||
        product.variants[0] || {
          id: 'default',
          name: 'حجم واحد',
          price: product.basePrice,
        };
      setSelectedVariant(defaultVariant);
      setQuantity(1);
      setJustAdded(false);
      setImageError(false);
      // Fetch reviews for this product
      setReviews(getReviewsByProductId(product.id));
    }
  }, [product, isOpen]);

  const handleAddNewReview = (reviewData: { userName: string; rating: number; comment: string }) => {
    if (!product) return;
    const created = saveNewReview({
      productId: product.id,
      ...reviewData,
    });
    setReviews((prev) => [created, ...prev]);
  };

  const { averageRating, totalReviews } = calculateProductRating(reviews);


  // Handle body scroll lock & Escape key
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) {
    return null;
  }

  const currentVariant =
    selectedVariant ||
    product.variants[0] || {
      id: 'default',
      name: 'حجم واحد',
      price: product.basePrice,
    };

  const unitPrice = currentVariant.price || product.basePrice;
  const totalPrice = unitPrice * quantity;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAdd = () => {
    if (!product.isAvailable) return;
    onAddToCart(product, currentVariant, quantity);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      onClose();
    }, 900);
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/#menu?product=${product.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2500);
    }
  };

  const categoryLabels: Record<string, string> = {
    charcoal: 'كنافة على الفحم',
    nutella: 'كنافة نوتيلا ومودرن',
    nawashef: 'نواشف العيد (موسمي)',
    other: 'مشروبات وأصناف أخرى',
    offers: 'عروض خاصة',
    oriental: 'حلويات شرقية',
    beverages: 'مشروبات',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
      onClick={onClose}
    >
      {/* Spacious Fuller Viewport Modal Container */}
      <div
        className="relative w-full max-w-5xl lg:max-w-6xl my-auto h-[94vh] sm:h-[90vh] md:h-[86vh] lg:h-[84vh] bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col md:flex-row text-right animate-modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Controls at Top (Available on mobile & desktop) */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-30 flex items-center gap-2">
          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-[#DD6B20] backdrop-blur-md shadow-md border border-slate-200/60 flex items-center justify-center transition-all cursor-pointer"
            title="مشاركة الصنف"
            aria-label="مشاركة الصنف"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 backdrop-blur-md shadow-md border border-slate-200/60 flex items-center justify-center transition-all cursor-pointer"
            title="إغلاق النافذة"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share Feedback Toast */}
        {showShareToast && (
          <div className="absolute top-16 left-4 z-40 bg-slate-900 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-lg flex items-center gap-1.5 animate-soft-fade">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>تم نسخ رابط الصنف بنجاح!</span>
          </div>
        )}

        {/* 1. Hero Media Column (Right in RTL desktop, Top on mobile) */}
        <div className="relative w-full md:w-5/12 lg:w-1/2 h-64 sm:h-72 md:h-full bg-stone-900 shrink-0 overflow-hidden flex flex-col justify-between">
          {/* Main Product Image */}
          {product.image && !imageError ? (
            <img
              src={product.image}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#DD6B20]/15 via-stone-900 to-black text-center p-6">
              <div className="w-20 h-20 rounded-2xl bg-[#DD6B20]/20 border border-[#DD6B20]/30 flex items-center justify-center mb-3 shadow-inner">
                <Flame className="w-11 h-11 text-[#DD6B20]" />
              </div>
              <span className="text-base font-bold text-white font-heading">
                كنافة نابلسية ع الفحم
              </span>
              <span className="text-xs text-stone-300 mt-1">تُخبز طازجة على جمر الفحم الطبيعي</span>
            </div>
          )}

          {/* Vignette Gradients for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40 pointer-events-none" />

          {/* Top Badges Overlay */}
          <div className="relative z-10 p-4 sm:p-5 flex flex-col items-end gap-2">
            {product.featured && (
              <span className="bg-[#DD6B20] text-white text-xs font-black px-3.5 py-1.5 rounded-xl shadow-md flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                الأكثر طلبًا
              </span>
            )}

            {product.isSeasonal && (
              <span className="bg-rose-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-md flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-white" />
                موسمي خاص
              </span>
            )}

            {product.isInitialPrice && (
              <div
                className="bg-white/95 backdrop-blur-md text-[#DD6B20] text-xs font-bold px-3 py-1.5 rounded-xl border border-[#DD6B20]/25 flex items-center gap-1.5 shadow-sm"
                title="سعر السوق التقديري - يخضع لمراجعة المحل"
              >
                <Tag className="w-3.5 h-3.5 text-[#DD6B20]" />
                <span>سعر تقديري</span>
              </div>
            )}
          </div>

          {/* Bottom Coal Craftsmanship Showcase (Desktop & Tablet) */}
          <div className="relative z-10 p-5 sm:p-6 text-white space-y-2.5">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold border border-white/20 text-amber-200">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>خبز فحم طبيعي 100%</span>
            </div>

            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-medium hidden sm:block">
              تُعد وتُحمر على الجمر الهادئ لحظة بلحظة مع الجبنة البلدية النابلسية الفاخرة والسمن البلدي الأصيل.
            </p>

            <div className="flex items-center gap-4 text-xs text-stone-300 pt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>تحضير فوري</span>
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>فرع رافدية</span>
              </span>
            </div>
          </div>
        </div>

        {/* 2. Details & Customization Column (Left in RTL desktop) */}
        <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
          {/* Scrollable Middle Content Body */}
          <div className="overflow-y-auto flex-1 p-5 sm:p-7 md:p-8 lg:p-9 space-y-6 scrollbar-thin">
            {/* Header: Category & Title */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#DD6B20] bg-[#DD6B20]/10 px-2.5 py-0.5 rounded-md">
                  {categoryLabels[product.category] || 'كنافة على الفحم'}
                </span>
                {product.isAvailable ? (
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    متوفر الآن
                  </span>
                ) : (
                  <span className="text-xs font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                    غير متوفر حاليًا
                  </span>
                )}
              </div>

              <h2
                id="product-modal-title"
                className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 font-heading leading-tight"
              >
                {product.name}
              </h2>

              {/* Star Rating & Reviews Count Bar */}
              <div className="flex items-center gap-2 pt-0.5">
                <StarRating rating={Math.round(averageRating)} size="sm" />
                <span className="text-xs font-black text-slate-800">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-xs text-slate-400">/ 5</span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-500">
                  ({totalReviews} {totalReviews === 1 ? 'تقييم' : totalReviews === 2 ? 'تقييمان' : 'تقييمات'})
                </span>
              </div>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed pt-1">
                {product.description}
              </p>
            </div>

            {/* Quality Pillars Bar */}
            <div className="grid grid-cols-3 gap-3 py-3 border-y border-stone-100 text-center">
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60">
                <span className="text-[11px] text-slate-400 block font-medium">طريقة الخبز</span>
                <span className="text-xs sm:text-sm font-bold text-[#DD6B20]">فحم طبيعي 100%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60">
                <span className="text-[11px] text-slate-400 block font-medium">المكونات</span>
                <span className="text-xs sm:text-sm font-bold text-[#DD6B20]">سمن بلدي فاخر</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60">
                <span className="text-[11px] text-slate-400 block font-medium">الجبنة</span>
                <span className="text-xs sm:text-sm font-bold text-[#DD6B20]">بلدية نابلسية</span>
              </div>
            </div>

            {/* Dedicated Size Selector Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#DD6B20]" />
                  <span>اختر الحجم المناسب:</span>
                </label>
                <span className="text-xs text-slate-500 font-medium">
                  {product.variants.length > 1
                    ? `${product.variants.length} خيارات متوفرة`
                    : 'حجم موحد'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.variants.map((variant) => {
                  const isSelected = currentVariant.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-4 rounded-2xl text-right transition-all border-2 flex items-center justify-between gap-3 cursor-pointer group ${
                        isSelected
                          ? 'border-[#DD6B20] bg-[#DD6B20]/10 text-slate-900 shadow-sm'
                          : 'border-stone-200 bg-white hover:border-[#DD6B20]/40 text-slate-700 hover:bg-stone-50/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Radio Indicator */}
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-[#DD6B20] bg-[#DD6B20]'
                              : 'border-slate-300 group-hover:border-[#DD6B20]/50'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <div>
                          <span
                            className={`text-xs sm:text-sm font-bold block ${
                              isSelected ? 'text-slate-900' : 'text-slate-700'
                            }`}
                          >
                            {variant.name}
                          </span>
                          {variant.takeawayPrice && (
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              سفري: {variant.takeawayPrice} ₪ | صالة: {variant.dineInPrice || variant.price} ₪
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-left shrink-0">
                        <span
                          className={`text-base sm:text-lg font-black font-heading ${
                            isSelected ? 'text-[#DD6B20]' : 'text-slate-800'
                          }`}
                        >
                          {variant.price}
                        </span>
                        <span className="text-xs text-slate-500 mr-1 font-bold">₪</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="pt-2 flex items-center justify-between bg-stone-50/80 p-4 rounded-2xl border border-stone-200/80">
              <div>
                <span className="text-sm font-bold text-slate-800 block">تحديد الكمية</span>
                <span className="text-xs text-slate-500">اختر عدد الصحون أو السدور</span>
              </div>

              <div className="flex items-center gap-3 bg-white border border-stone-200 rounded-xl p-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-600 hover:text-[#DD6B20] hover:bg-[#DD6B20]/10 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-600 transition-colors cursor-pointer"
                  aria-label="إنقاص الكمية"
                >
                  <Minus className="w-4 h-4 stroke-[2.5]" />
                </button>

                <span className="w-9 text-center text-base sm:text-lg font-black text-slate-900 font-heading">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-600 hover:text-[#DD6B20] hover:bg-[#DD6B20]/10 transition-colors cursor-pointer"
                  aria-label="زيادة الكمية"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Product Reviews & Star Rating System */}
            <ProductReviewsSection
              productId={product.id}
              productName={product.name}
              reviews={reviews}
              onAddReview={handleAddNewReview}
            />
          </div>

          {/* Sticky Bottom Footer: Dynamic Price & Prominent CTA */}
          <div className="p-4 sm:p-5 md:p-6 bg-white border-t border-stone-200 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shrink-0">
            {/* Dynamic Total Price */}
            <div className="flex items-center sm:flex-col items-start justify-between sm:justify-center">
              <span className="text-xs text-slate-400 font-medium">المجموع الإجمالي</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#DD6B20] font-heading">
                  {totalPrice}
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-600">شيكل (₪)</span>
              </div>
            </div>

            {/* Prominent Add to Cart Button */}
            <button
              type="button"
              onClick={handleAdd}
              disabled={!product.isAvailable || justAdded}
              className={`flex-1 sm:max-w-sm flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl font-black text-sm sm:text-base transition-all duration-200 shadow-md cursor-pointer hover:scale-[1.02] active:scale-95 ${
                !product.isAvailable
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed hover:scale-100 shadow-none'
                  : justAdded
                  ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                  : 'bg-[#DD6B20] hover:bg-[#C2410C] text-white shadow-[#DD6B20]/25'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>تمت الإضافة للسلة بنجاح!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  <span>إضافة إلى السلة ({totalPrice} ₪)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
