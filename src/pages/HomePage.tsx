import React from 'react';
import { Flame, ArrowLeft, Bike, Star, Sparkles, MapPin, Phone, Heart } from 'lucide-react';
import { Product, ProductVariant, Offer, Review, StoreSettings } from '../types';
import { ProductCard } from '../components/ProductCard';

interface HomePageProps {
  products: Product[];
  offers: Offer[];
  reviews: Review[];
  settings: StoreSettings | null;
  onNavigate: (tab: string) => void;
  onNavigateToProduct: (productId: string) => void;
  onAddToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
  onOpenDeliverySurvey: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  offers,
  reviews,
  settings,
  onNavigate,
  onNavigateToProduct,
  onAddToCart,
  onOpenDeliverySurvey,
}) => {
  const featuredProducts = products.filter((p) => p.featured || p.category === 'charcoal').slice(0, 4);
  const activeOffers = offers.filter((o) => o.isActive);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">

      {/* 1. Hero Section */}
      <section className="relative min-h-[520px] lg:min-h-[580px] flex items-center justify-center bg-gradient-to-b from-[#DD6B20]/10 via-[#DD6B20]/5 to-white border-b border-[#DD6B20]/15 overflow-hidden px-4">

        {/* Subtle glow background */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#DD6B20]/15 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center space-y-6 py-12 sm:py-20 z-10 animate-soft-fade">

          {/* Top Pill / Badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-[#DD6B20]/25 text-[#DD6B20] px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-xs">
            <Flame className="w-4 h-4 text-[#DD6B20]" />
            <span>كنافة نابلسية أصلية تُخبز على جمر الفحم الطبيعي</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#DD6B20]/60" />
            <span className="text-[#DD6B20] font-extrabold">رافدية - الشارع الرئيسي</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight font-heading leading-tight">
            المذاق النابلسي الأصيل <br className="hidden sm:inline" />
            <span className="text-[#DD6B20] inline-block mt-2">على جمر الفحم الطبيعي</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-600 leading-relaxed font-normal">
            نخبز كل صحن وسدر كنافة وإسطنبولية بحرفية نابلسية عالية باستخدام السمن البلدي الفاخر والجبنة البلدية الطازجة على الجمر الهادئ.
          </p>

          {/* Quick Notice Banner on Hero */}
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200/80 px-4 py-2 rounded-2xl text-xs sm:text-sm text-amber-900 font-bold shadow-xs">
            <span>🍨</span>
            <span>إمكانية إضافة بوظة تركية فاخرة لأي صنف بـ 3 شيكل فقط!</span>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <button
              type="button"
              onClick={() => onNavigate('menu')}
              className="w-full sm:w-auto px-8 py-4 bg-[#DD6B20] hover:bg-[#C2410C] text-white font-black text-base rounded-2xl shadow-lg shadow-[#DD6B20]/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span>تصفح منيو الأصناف والأسعار</span>
              <ArrowLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={onOpenDeliverySurvey}
              className="w-full sm:w-auto px-6 py-4 bg-white hover:bg-stone-50 text-slate-700 hover:text-slate-900 font-bold text-sm sm:text-base rounded-2xl border border-stone-200/80 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Bike className="w-4 h-4 text-[#DD6B20]" />
              <span>طلب توصيل لموقعك</span>
            </button>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-10 text-right">
            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-stone-200/70 shadow-xs">
              <span className="text-xl sm:text-2xl font-black text-[#DD6B20] font-heading block">100%</span>
              <span className="text-xs sm:text-sm text-slate-600 font-bold">فحم طبيعي بدون غاز</span>
            </div>
            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-stone-200/70 shadow-xs">
              <span className="text-xl sm:text-2xl font-black text-[#DD6B20] font-heading block">بلدية</span>
              <span className="text-xs sm:text-sm text-slate-600 font-bold">جبنة نابلسية طازجة</span>
            </div>
            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-stone-200/70 shadow-xs">
              <span className="text-xl sm:text-2xl font-black text-[#DD6B20] font-heading block">فوري</span>
              <span className="text-xs sm:text-sm text-slate-600 font-bold">تجهيز طازج فور الطلب</span>
            </div>
            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-stone-200/70 shadow-xs">
              <span className="text-xl sm:text-2xl font-black text-[#DD6B20] font-heading block">فاخر</span>
              <span className="text-xs sm:text-sm text-slate-600 font-bold">سمن بلدي وفستق حلبي</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200/80 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#DD6B20] uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>مختارات Kömür Künefe الفاخرة</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 font-heading">
              الأصناف الأكثر طلباً على الفحم
            </h2>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('menu')}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#DD6B20] hover:text-[#C2410C] transition-colors cursor-pointer group"
          >
            <span>عرض كامل المنيو والأسعار</span>
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              revealDelay={Math.min(index * 60, 240)}
              onOpenDetails={() => onNavigateToProduct(product.id)}
            />
          ))}

        </div>
      </section>

      {/* 3. Special Offers Section */}
      {activeOffers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-linear-to-r from-stone-900 via-stone-800 to-black rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-4 max-w-2xl">
              <span className="inline-block bg-[#DD6B20] text-white text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                {activeOffers[0].badge}
              </span>
              <h3 className="text-2xl sm:text-4xl font-black font-heading leading-tight">
                {activeOffers[0].title}
              </h3>
              <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-normal">
                {activeOffers[0].description}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('menu')}
                  className="px-6 py-3.5 bg-white text-slate-900 hover:bg-stone-100 font-black text-sm rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  اطلب الآن واستفد من العرض
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Customer Testimonials / Social Proof */}
      {reviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#DD6B20] uppercase tracking-wider">
              آراء زبائننا في نابلس
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
              تجربة حقيقية بطعم الفحم لا تُنسى
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.slice(0, 3).map((rev) => (
              <div
                key={rev.id}
                className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow space-y-3"
              >
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  "{rev.comment}"
                </p>
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">
                    {rev.customerName || rev.userName || 'زبون مميز'}
                  </span>
                  <span className="text-slate-400">زبون موثق</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Branch Location & Visit Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-right">
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
              تفضل بزيارتنا في فرع رافدية
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
              {settings?.branch || 'رافدية - الشارع الرئيسي، نابلس، فلسطين. استمتع برائحة جمر الفحم والكنافة الطازجة لحظة خروجها من النار.'}
            </p>
            <div className="flex items-center gap-4 pt-1 text-xs text-slate-500 font-semibold">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#DD6B20]" />
                <span>رافدية - الشارع الرئيسي</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#DD6B20]" />
                <span>{settings?.phone || '+970 562 606 061'}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <a
              href={`https://wa.me/${settings?.whatsapp || '970562606061'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all text-center"
            >
              تواصل عبر واتساب
            </a>
            <button
              type="button"
              onClick={() => onNavigate('menu')}
              className="flex-1 sm:flex-none px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all text-center cursor-pointer"
            >
              عرض المنيو
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
