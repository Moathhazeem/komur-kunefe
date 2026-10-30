import React from 'react';
import { Sparkles, Calendar, Tag, ArrowLeft, Flame } from 'lucide-react';
import { Offer } from '../types';

interface OffersPageProps {
  offers: Offer[];
  onNavigate: (tab: string) => void;
}

export const OffersPage: React.FC<OffersPageProps> = ({ offers, onNavigate }) => {
  const activeOffers = offers.filter((o) => o.isActive);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 text-right space-y-10">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 bg-white text-orange-700 border border-orange-200 px-4 py-1.5 rounded-full text-xs font-bold shadow-xs">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span>عروض العيد، رمضان، ونهاية الأسبوع</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 font-heading">
          العروض والمناسبات الخاصة
        </h1>
        <p className="text-sm sm:text-base text-slate-500">
          استمتع بأشهى باقات وسدور الكنافة على الفحم ونواشف العيد بخصومات وباقات عائلية مميزة.
        </p>
      </div>

      {/* Offers Grid */}
      {activeOffers.length === 0 ? (
        <div className="bg-white border border-orange-100 rounded-3xl p-12 text-center space-y-3 max-w-lg mx-auto shadow-xs">
          <Tag className="w-10 h-10 text-orange-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 font-heading">
            لا توجد عروض موسمية نشطة حالياً
          </h3>
          <p className="text-xs text-slate-500">
            تابعونا باستمرار أو تفقدوا حسابنا على الإنستغرام لإعلانات عروض الأعياد والمناسبات القادمة.
          </p>
          <button
            onClick={() => onNavigate('menu')}
            className="mt-2 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors"
          >
            تصفح المنيو الأساسي
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {activeOffers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white border-2 border-orange-200 hover:border-orange-400 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md relative overflow-hidden flex flex-col justify-between group transition-all hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-xs px-3 py-1 rounded-full shadow-xs">
                    {offer.badge}
                  </span>
                  {offer.discountPercent > 0 && (
                    <span className="text-xl sm:text-2xl font-black text-orange-600 font-heading">
                      خصم {offer.discountPercent}%
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-black text-slate-900 font-heading leading-tight group-hover:text-orange-600 transition-colors">
                  {offer.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {offer.description}
                </p>

                {offer.includedProductNames && offer.includedProductNames.length > 0 && (
                  <div className="pt-2 space-y-1.5 border-t border-slate-100">
                    <span className="text-xs text-slate-500 block font-semibold">الأصناف المشمولة في العرض:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {offer.includedProductNames.map((name, i) => (
                        <span key={i} className="text-xs bg-orange-50 text-orange-700 px-2.5 py-1 rounded-lg border border-orange-200 font-medium">
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-orange-500" />
                  <span>ساري حتى نهاية الموسم</span>
                </div>

                <button
                  onClick={() => onNavigate('menu')}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-transform hover:scale-105"
                >
                  <span>اطلب العرض الآن</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Event Orders Callout */}
      <div className="bg-white border border-orange-200 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2 text-right">
          <div className="flex items-center gap-2 text-xs font-bold text-orange-600">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>سدور الأفراح والمناسبات الخاصة في نابلس</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
            عندك مناسبة أو عزومة عائلية؟
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            نوفر سدور كنافة ع الفحم بأحجام كبيرة للأفراح، التخرج، والعزائم مع سخانات خاصة للمحافظة على حرارة الكنافة ومطة الجبنة.
          </p>
        </div>

        <a
          href="https://wa.me/970562606061?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D9%88%D8%AF%20%D8%A7%D9%84%D8%AD%D8%AC%D8%B2%20%D9%84%D8%B3%D8%AF%D9%88%D8%B1%20%D9%85%D9%86%D8%A7%D8%B3%D8%A8%D8%A7%D8%AA%20%D8%B9%20%D8%A7%D9%84%D9%81%D8%AD%D9%85"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold text-xs shrink-0 transition-colors text-center"
        >
          تواصل لحجز سدر المناسبات عبر واتساب
        </a>
      </div>

    </div>
  );
};
