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

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight font-heading leading-tight sm:leading-none">
            سر القرمشة والجبنة البلدية <br />
            <span className="ember-text-gradient">على جمر الفحم الهادئ</span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
            في قلب نابلس، نُعيد إحياء الطريقة العريقة بإعداد الكنافة النابلسية بالسمن البلدي والجبنة الساخنة المخبوزة ببطء على الفحم الطبيعي.
          </p>

          {/* CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('menu')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#DD6B20] hover:bg-[#C05621] text-white font-black text-base shadow-md shadow-[#DD6B20]/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              <span>اطلب أونلاين واستلم ساخنًا</span>
              <ArrowLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => onNavigate('story')}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-[#DD6B20]/5 text-slate-700 border border-slate-200 hover:border-[#DD6B20]/30 font-bold text-base transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <span>حكايتنا مع الفحم</span>
            </button>
          </div>

          {/* Highlights bar */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto text-right">
            <div className="bg-white/95 border border-[#DD6B20]/15 p-3 rounded-2xl shadow-xs">
              <span className="text-xs text-slate-400 block font-medium">طريقة التحضير</span>
              <span className="text-sm font-bold text-[#DD6B20]">جمر فحم طبيعي 100%</span>
            </div>
            <div className="bg-white/95 border border-[#DD6B20]/15 p-3 rounded-2xl shadow-xs">
              <span className="text-xs text-slate-400 block font-medium">الجبنة المستخدمة</span>
              <span className="text-sm font-bold text-[#DD6B20]">جبنة بلدية نابلسية</span>
            </div>
            <div className="bg-white/95 border border-[#DD6B20]/15 p-3 rounded-2xl shadow-xs">
              <span className="text-xs text-slate-400 block font-medium">طريقة الاستلام</span>
              <span className="text-sm font-bold text-[#DD6B20]">استلام سريع من المحل</span>
            </div>
            <div className="bg-white/95 border border-[#DD6B20]/15 p-3 rounded-2xl shadow-xs">
              <span className="text-xs text-slate-400 block font-medium">الموقع</span>
              <span className="text-sm font-bold text-[#DD6B20]">رافدية - الشارع الرئيسي</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Seasonal Offers Banner */}
      {activeOffers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#DD6B20] to-[#C05621] border border-[#DD6B20]/40 rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden text-white">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-right">
                <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full backdrop-blur-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{activeOffers[0].badge}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white font-heading">
                  {activeOffers[0].title}
                </h3>
                <p className="text-sm text-orange-50/90 max-w-2xl leading-relaxed">
                  {activeOffers[0].description}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => onNavigate('offers')}
                  className="px-6 py-3.5 rounded-xl bg-white text-[#DD6B20] hover:bg-[#DD6B20]/5 font-black text-sm shadow-md transition-all cursor-pointer"
                >
                  تصفح جميع العروض
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Featured Products Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#DD6B20]/15 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#DD6B20] mb-1">
              <Flame className="w-4 h-4 text-[#DD6B20]" />
              <span>مختاراتنا لك</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 font-heading">
              أشهر أصناف الكنافة ع الفحم
            </h2>
          </div>
          <button
            onClick={() => onNavigate('menu')}
            className="text-sm font-bold text-[#DD6B20] hover:text-[#C05621] flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <span>عرض كامل المنيو والأسعار</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetails={(p) => onNavigateToProduct(p.id)}
            />
          ))}
        </div>
      </section>

      {/* 4. Delivery Demand Measuring Section ("تحب نوفر توصيل؟") */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-[#DD6B20]/20 hover:border-[#DD6B20]/40 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center gap-4 text-right">
            <div className="w-14 h-14 rounded-2xl bg-[#DD6B20]/10 border border-[#DD6B20]/20 flex items-center justify-center text-[#DD6B20] shrink-0">
              <Bike className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-block bg-[#DD6B20]/10 text-[#DD6B20] text-[11px] font-bold px-2.5 py-0.5 rounded-md mb-1">
                خدمة التوصيل قريبًا
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-heading">
                تحب نوفر خدمة التوصيل لبيتك في نابلس؟
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                حالياً نوفر الاستلام المباشر من المحل. سجّل منطقتك لتكون أول من تصله الكنافة ساخنة فور تدشين الأسطول!
              </p>
            </div>
          </div>

          <button
            onClick={onOpenDeliverySurvey}
            className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-[#DD6B20] hover:bg-[#C05621] text-white font-bold text-sm shrink-0 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Bike className="w-4 h-4" />
            <span>نعم، مهتم بالتوصيل (حدد منطقتك)</span>
          </button>
        </div>
      </section>

      {/* 5. Family & Coal Story Snippet */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center bg-white border border-[#DD6B20]/15 rounded-3xl p-6 sm:p-12 overflow-hidden shadow-xs">
          
          <div className="space-y-4 text-right">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#DD6B20]">حكايتنا في رافدية</span>
              {settings?.isStoryDraft && (
                <span className="text-[10px] bg-[#DD6B20]/10 text-[#DD6B20] border border-[#DD6B20]/20 px-2 py-0.5 rounded-md font-medium">
                  نص مؤقت - قابل للتعديل من لوحة التحكم
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 font-heading leading-tight">
              لماذا الكنافة ع الفحم تختلف عن أي كنافة أخرى؟
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {settings?.ourStory ||
                'بدأت قصة "كُومُر كُونافيه" من إيماننا بأن سر الكنافة النابلسية الحقيقي لا يكتمل إلا مع حرارة جمر الفحم الهادئة. نستخدم أجود أنواع الجبنة البلدية النابلسية الطازجة مع السمن الأصيل، ونخبز كل صحن وسدر على الفحم لنوفر نكهة مدخنة خفيفة وقرمشة ذهبية لا تنسى.'}
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('story')}
                className="text-sm font-bold text-[#DD6B20] hover:text-[#C05621] flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>اقرأ القصة كاملة وسر المكونات</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Aesthetic Visual Side */}
          <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-[#DD6B20]/5 border border-[#DD6B20]/15">
            <img
              src="https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=800&q=80"
              alt="كنافة ع الفحم في رافدية"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent flex items-end p-6">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Flame className="w-4 h-4 text-[#DD6B20]" />
                <span>فرع رافدية - الشارع الرئيسي (نابلس)</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 6. Customer Reviews (Transparent & Authentic) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#DD6B20]/15 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#DD6B20] mb-1">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>تجارب حقيقية</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 font-heading">
              آراء زبائننا في نابلس
            </h2>
          </div>
          <button
            onClick={() => onNavigate('reviews')}
            className="px-5 py-2.5 rounded-xl bg-[#DD6B20]/10 hover:bg-[#DD6B20]/15 text-[#DD6B20] border border-[#DD6B20]/20 font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <span>شاركنا رأيك وتقييمك</span>
          </button>
        </div>

        {reviews.length === 0 ? (
          <div className="bg-white border border-[#DD6B20]/15 rounded-3xl p-12 text-center space-y-3 shadow-xs">
            <Star className="w-10 h-10 text-[#DD6B20]/40 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              كن أول من يشاركنا رأيه في كُومُر كُونافيه!
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              تذوقت الكنافة ع الفحم؟ رأيك يهمنا جدًا ويسعدنا مشاركته مع زوار الموقع.
            </p>
            <button
              onClick={() => onNavigate('reviews')}
              className="mt-2 px-6 py-2.5 rounded-xl bg-[#DD6B20] hover:bg-[#C05621] text-white font-bold text-xs cursor-pointer"
            >
              أضف تقييمك الآن
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.slice(0, 3).map((rev) => (
              <div
                key={rev.id}
                className="bg-white border border-[#DD6B20]/15 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-xs relative"
              >
                {rev.isDemo && (
                  <span className="absolute top-3 left-3 text-[9px] bg-[#DD6B20]/10 text-[#DD6B20] border border-[#DD6B20]/20 px-1.5 py-0.5 rounded font-semibold">
                    تجريبي
                  </span>
                )}
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold text-slate-800">{rev.customerName}</span>
                  <span>{new Date(rev.createdAt).toLocaleDateString('ar-EG')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 7. Store Location & Hours Snapshot */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-[#DD6B20]/15 rounded-3xl p-6 sm:p-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center shadow-xs">
          
          <div className="space-y-2 text-right">
            <div className="flex items-center gap-2 text-xs font-bold text-[#DD6B20]">
              <MapPin className="w-4 h-4 text-[#DD6B20]" />
              <span>محل واحد، وجهة واحدة</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
              زورونا في رافدية
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {settings?.branch || 'رافِدية - الشارع الرئيسي (نابلس، فلسطين)'}
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('contact')}
                className="text-xs font-bold text-[#DD6B20] hover:text-[#C05621] hover:underline cursor-pointer"
              >
                عرض الخريطة التفاعلية وساعات الدوام ←
              </button>
            </div>
          </div>

          <div className="space-y-2 text-right">
            <div className="flex items-center gap-2 text-xs font-bold text-[#DD6B20]">
              <Phone className="w-4 h-4 text-[#DD6B20]" />
              <span>الهاتف والواتساب المباشر</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading dir-ltr text-right">
              {settings?.phone || '+970 562 606 061'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              نستقبل طلباتكم واستفساراتكم وسدور المناسبات يومياً.
            </p>
            <div className="pt-2">
              <a
                href="https://wa.me/970562606061"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:underline"
              >
                <span>محادثة واتساب فورية</span>
                <span>←</span>
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => onNavigate('menu')}
              className="w-full py-4 rounded-xl bg-[#DD6B20] hover:bg-[#C05621] text-white font-black text-sm shadow-md transition-all text-center shadow-[#DD6B20]/20 cursor-pointer"
            >
              اطلب أونلاين الآن
            </button>
            <button
              onClick={() => onNavigate('track')}
              className="w-full py-3 rounded-xl bg-[#DD6B20]/10 hover:bg-[#DD6B20]/15 text-[#DD6B20] border border-[#DD6B20]/20 font-bold text-xs text-center transition-colors cursor-pointer"
            >
              تتبع حالة طلب سابق
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};
