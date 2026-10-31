import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowRight,
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
  ShieldCheck,
  ChevronLeft,
  ArrowLeft,
} from 'lucide-react';
import { Product, ProductVariant, Review } from '../types';
import { StarRating } from '../components/StarRating';
import { ProductReviewsSection } from '../components/ProductReviewsSection';
import {
  getReviewsByProductId,
  addReview as saveNewReview,
  calculateProductRating,
} from '../utils/reviewsStorage';

export interface ProductDetailsPageProps {
  productId: string | null;
  products: Product[];
  onNavigate: (tab: string) => void;
  onNavigateToProduct: (productId: string) => void;
  onAddToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
  onOpenCart: () => void;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  productId,
  products,
  onNavigate,
  onNavigateToProduct,
  onAddToCart,
  onOpenCart,
}) => {
  // Find current product
  const product = useMemo(() => {
    return products.find((p) => p.id === productId) || null;
  }, [products, productId]);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [justAdded, setJustAdded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [showShareToast, setShowShareToast] = useState<boolean>(false);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Initialize selections when product changes
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
      setReviews(getReviewsByProductId(product.id));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [product]);

  const handleAddNewReview = (reviewData: { userName: string; rating: number; comment: string }) => {
    if (!product) return;
    const created = saveNewReview({
      productId: product.id,
      ...reviewData,
    });
    setReviews((prev) => [created, ...prev]);
  };

  const { averageRating, totalReviews } = calculateProductRating(reviews);

  const scrollToReviews = () => {
    const el = document.getElementById('product-reviews-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#DD6B20]/10 text-[#DD6B20] mx-auto flex items-center justify-center">
          <Flame className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
          لم يتم العثور على هذا الصنف
        </h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          قد يكون الرابط غير صحيح أو تم تحديث قائمة الأصناف في المنيو.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('menu')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#DD6B20] hover:bg-[#C2410C] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى كامل المنيو</span>
        </button>
      </div>
    );
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
    }, 2500);
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/product/${product.id}`;
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
  };

  // Related products (from same category or featured)
  const relatedProducts = products
    .filter((p) => p.id !== product.id && (p.category === product.category || p.featured))
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10 animate-soft-fade text-right">
      
      {/* 1. Top Navigation Bar: Back to Menu & Breadcrumbs & Share */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-4">
        <div className="flex items-center gap-3">
          {/* Prominent Back Button */}
          <button
            type="button"
            onClick={() => onNavigate('menu')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-stone-200 text-slate-700 hover:text-[#DD6B20] hover:border-[#DD6B20]/40 transition-all font-bold text-sm shadow-xs cursor-pointer group"
          >
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-[#DD6B20]" />
            <span>الرجوع إلى المنيو</span>
          </button>

          {/* Breadcrumb Trail */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <button
              onClick={() => onNavigate('home')}
              className="hover:text-[#DD6B20] transition-colors cursor-pointer"
            >
              الرئيسية
            </button>
            <span className="text-slate-300">/</span>
            <button
              onClick={() => onNavigate('menu')}
              className="hover:text-[#DD6B20] transition-colors cursor-pointer"
            >
              المنيو
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-[#DD6B20] font-bold truncate max-w-[200px]">
              {product.name}
            </span>
          </div>
        </div>

        {/* Share Button & Toast */}
        <div className="relative flex items-center gap-2 self-end sm:self-auto">
          {showShareToast && (
            <div className="bg-slate-900 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-lg flex items-center gap-1.5 animate-soft-fade">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>تم نسخ رابط الصنف بنجاح!</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-slate-700 hover:text-[#DD6B20] hover:border-[#DD6B20]/40 transition-all font-bold text-xs shadow-xs cursor-pointer"
            title="مشاركة رابط هذا الصنف"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>مشاركة الصنف</span>
          </button>
        </div>
      </div>

      {/* 2. Main Full-Page Product Showcase (Two-Column Balanced Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Right Column (in RTL): Hero Media & Craftsmanship Showcase */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-6">
          {/* Main Product Image Container */}
          <div className="relative aspect-4/3 sm:aspect-16/10 w-full bg-stone-100 rounded-3xl overflow-hidden shadow-md border border-stone-200/80 group">
            {product.image && !imageError ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#DD6B20]/15 via-stone-50 to-[#DD6B20]/5 text-center p-8">
                <div className="w-20 h-20 rounded-2xl bg-[#DD6B20]/10 border border-[#DD6B20]/20 flex items-center justify-center mb-3 shadow-inner">
                  <Flame className="w-10 h-10 text-[#DD6B20]" />
                </div>
                <span className="text-base font-bold text-slate-800 font-heading">
                  كنافة نابلسية ع الفحم
                </span>
                <span className="text-xs text-slate-400 mt-1">تُخبز طازجة على جمر الفحم الطبيعي</span>
              </div>
            )}

            {/* Badges Overlay */}
            <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-10">
              {product.featured && (
                <span className="bg-[#DD6B20] text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  الأكثر طلبًا
                </span>
              )}

              {product.isSeasonal && (
                <span className="bg-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-white" />
                  موسمي خاص
                </span>
              )}

              {product.isInitialPrice && (
                <div
                  className="bg-white/95 backdrop-blur-md text-[#DD6B20] text-xs font-bold px-3 py-1 rounded-xl border border-[#DD6B20]/25 flex items-center gap-1.5 shadow-xs"
                  title="سعر السوق التقديري - يخضع لمراجعة المحل"
                >
                  <Tag className="w-3.5 h-3.5 text-[#DD6B20]" />
                  <span>سعر تقديري</span>
                </div>
              )}
            </div>
          </div>

          {/* Charcoal Heritage Feature Card */}
          <div className="bg-gradient-to-br from-[#DD6B20]/10 via-white to-stone-50 border border-[#DD6B20]/25 rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#DD6B20] text-white flex items-center justify-center shadow-md shadow-[#DD6B20]/20 shrink-0">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  سر النكهة: جمر الفحم الطبيعي
                </h3>
                <span className="text-xs text-slate-500">
                  رافدية - الشارع الرئيسي، نابلس
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              نُعد صينيتك لحظة طلبك على جمر هادئ لتكتسب الكنافة قرمشتها الذهبية المميزة ومطة الجبنة البلدية النابلسية بالسمن البلدي الفاخر.
            </p>

            <div className="pt-2 border-t border-[#DD6B20]/15 grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Clock className="w-4 h-4 text-[#DD6B20]" />
                <span>تجهيز طازج: 10-15 دقيقة</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <MapPin className="w-4 h-4 text-[#DD6B20]" />
                <span>استلام ساخن من الفرع</span>
              </div>
            </div>
          </div>
        </div>

        {/* Left Column (in RTL): Product Details, Size Selector, Pricing & Cart Action */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-8">
          
          {/* Title & Category Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#DD6B20] bg-[#DD6B20]/10 border border-[#DD6B20]/20 px-3 py-1 rounded-lg">
                {categoryLabels[product.category] || 'كنافة على الفحم'}
              </span>
              {product.isAvailable ? (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  متوفر للطلب الآن
                </span>
              ) : (
                <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                  غير متوفر مؤقتاً
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-heading leading-tight">
              {product.name}
            </h1>

            {/* Top Star Rating & Quick-Access Review Link */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <StarRating rating={Math.round(averageRating)} size="md" />
              <div className="flex items-baseline gap-1">
                <span className="text-sm sm:text-base font-black text-slate-900 font-heading">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-xs text-slate-400">/ 5</span>
              </div>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={scrollToReviews}
                className="text-xs sm:text-sm font-bold text-[#DD6B20] hover:text-[#C2410C] underline decoration-[#DD6B20]/40 hover:decoration-[#C2410C] underline-offset-4 transition-colors cursor-pointer"
              >
                {totalReviews > 0
                  ? `عرض التقييمات (${totalReviews}) أو أضف رأيك`
                  : 'كن أول من يقيم هذا الصنف / أضف رأيك'}
              </button>
            </div>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal pt-1">
              {product.description}
            </p>
          </div>

          {/* Quality Pillars Highlights */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-stone-50 border border-stone-200/80 text-center">
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 block font-medium">طريقة الخبز</span>
              <span className="text-xs sm:text-sm font-bold text-[#DD6B20]">فحم طبيعي 100%</span>
            </div>
            <div className="space-y-1 border-x border-stone-200">
              <span className="text-[11px] text-slate-400 block font-medium">المكونات</span>
              <span className="text-xs sm:text-sm font-bold text-[#DD6B20]">سمن بلدي فاخر</span>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 block font-medium">الجبنة</span>
              <span className="text-xs sm:text-sm font-bold text-[#DD6B20]">بلدية نابلسية</span>
            </div>
          </div>

          {/* 3. Dedicated Size Selector Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#DD6B20]" />
                <span>اختر الحجم المناسب:</span>
              </label>
              <span className="text-xs text-slate-500 font-medium">
                {product.variants.length > 1
                  ? `${product.variants.length} خيارات متاحة`
                  : 'حجم موحد'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                          className={`text-sm sm:text-base font-bold block ${
                            isSelected ? 'text-slate-900' : 'text-slate-700'
                          }`}
                        >
                          {variant.name}
                        </span>
                        {variant.takeawayPrice && (
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            سفري: {variant.takeawayPrice} ₪ | صالة: {variant.dineInPrice || variant.price} ₪
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      <span
                        className={`text-lg sm:text-xl font-black font-heading ${
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

          {/* 4. Quantity Selector */}
          <div className="pt-2 flex items-center justify-between bg-stone-50/80 p-4 sm:p-5 rounded-2xl border border-stone-200/80">
            <div>
              <span className="text-sm sm:text-base font-bold text-slate-900 block">تحديد الكمية:</span>
              <span className="text-xs text-slate-500">كم صحن أو سدر ترغب بطلبه؟</span>
            </div>

            <div className="flex items-center gap-3.5 bg-white border border-stone-200 rounded-2xl p-1.5 shadow-xs">
              <button
                type="button"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-600 hover:text-[#DD6B20] hover:bg-[#DD6B20]/10 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-600 transition-colors cursor-pointer"
                aria-label="إنقاص الكمية"
              >
                <Minus className="w-4 h-4 stroke-[2.5]" />
              </button>

              <span className="w-10 text-center text-lg sm:text-xl font-black text-slate-900 font-heading">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() => handleQuantityChange(1)}
                className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-600 hover:text-[#DD6B20] hover:bg-[#DD6B20]/10 transition-colors cursor-pointer"
                aria-label="زيادة الكمية"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* 5. Sticky / Prominent Order Action Card */}
          <div className="p-5 sm:p-7 rounded-3xl bg-white border-2 border-[#DD6B20]/25 shadow-lg space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs sm:text-sm text-slate-500 font-medium block">
                  المجموع الإجمالي ({quantity} {quantity === 1 ? 'طلب' : 'طلبات'} - {currentVariant.name}):
                </span>
                <div className="flex items-baseline gap-1.5 pt-1">
                  <span className="text-3xl sm:text-4xl font-black text-[#DD6B20] font-heading">
                    {totalPrice}
                  </span>
                  <span className="text-sm font-bold text-slate-600">شيكل فلسطيني (₪)</span>
                </div>
              </div>

              {product.isInitialPrice && (
                <span className="text-xs bg-amber-50 text-[#DD6B20] border border-[#DD6B20]/20 px-3 py-1 rounded-lg font-bold">
                  سعر تقديري
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleAdd}
                disabled={!product.isAvailable}
                className={`flex-1 flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-black text-base sm:text-lg transition-all duration-200 shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.99] ${
                  !product.isAvailable
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed hover:scale-100 shadow-none'
                    : justAdded
                    ? 'bg-emerald-600 text-white shadow-emerald-600/25'
                    : 'bg-[#DD6B20] hover:bg-[#C2410C] text-white shadow-[#DD6B20]/25'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-6 h-6 stroke-[3]" />
                    <span>تمت الإضافة إلى السلة بنجاح!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-6 h-6" />
                    <span>إضافة إلى السلة ({totalPrice} ₪)</span>
                  </>
                )}
              </button>

              {justAdded && (
                <button
                  type="button"
                  onClick={onOpenCart}
                  className="px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer animate-soft-fade shadow-md"
                >
                  <span>عرض السلة وإتمام الطلب</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              يتم تجهيز الكنافة فور وصول الطلب وتسليمها ساخنة من فرعنا في رافدية - الشارع الرئيسي.
            </p>
          </div>

          {/* Product Reviews & Star Rating Section */}
          <ProductReviewsSection
            productId={product.id}
            productName={product.name}
            reviews={reviews}
            onAddReview={handleAddNewReview}
            initiallyOpenForm={true}
          />

        </div>

      </div>

      {/* 3. Recommended Products Section */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-stone-200/80 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#DD6B20] block">اختيارات أخرى مقترحة</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                أصناف أخرى مخبوزة على الفحم قد تعجبك
              </h2>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('menu')}
              className="text-xs sm:text-sm font-bold text-[#DD6B20] hover:text-[#C2410C] flex items-center gap-1 cursor-pointer"
            >
              <span>كامل المنيو</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => (
              <div
                key={rel.id}
                onClick={() => onNavigateToProduct(rel.id)}
                className="bg-white rounded-2xl border border-stone-200 p-4 hover:border-[#DD6B20]/40 transition-all hover:shadow-md cursor-pointer flex items-center gap-4 group"
              >
                <div className="w-20 h-20 rounded-xl bg-stone-100 overflow-hidden shrink-0">
                  {rel.image ? (
                    <img
                      src={rel.image}
                      alt={rel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#DD6B20]/10 text-[#DD6B20]">
                      <Flame className="w-6 h-6" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#DD6B20] transition-colors truncate">
                    {rel.name}
                  </h4>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {rel.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-black text-[#DD6B20]">
                      {rel.basePrice} ₪
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 group-hover:text-[#DD6B20] transition-colors flex items-center gap-1">
                      <span>عرض الصنف</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

