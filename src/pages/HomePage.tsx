import { isActiveOffer } from '../utils/offers';
import { ProductImage } from '../components/ProductImage';
import React from 'react';
import { ArrowLeft, Clock3, Flame, MapPin, Phone, Sparkles, Star } from 'lucide-react';
import { Offer, Product, ProductVariant, Review, StoreSettings } from '../types';
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

export const HomePage: React.FC<HomePageProps> = ({ products, offers, reviews, settings, onNavigate, onNavigateToProduct }) => {
  const featuredProducts = products.filter((product) => product.featured || product.category === 'charcoal').slice(0, 4);
  const activeOffers = offers.filter(isActiveOffer);
  const heroProduct = featuredProducts[0] || products[0];

  return (
    <div className="overflow-hidden pb-20">
      <section className="charcoal-grain relative isolate min-h-[520px] text-right text-[#F7F0E5] sm:min-h-[600px]">
        <div className="absolute -left-28 top-20 h-80 w-80 rounded-full bg-[#C7652D]/30 blur-3xl hero-ember" />
        <div className="mx-auto grid min-h-[650px] max-w-7xl items-center gap-12 px-4 py-14 sm:min-h-[600px] sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:px-8">
          <div className="relative z-10 max-w-2xl animate-soft-slide-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#DAB775]/30 bg-white/5 px-3.5 py-2 text-xs font-bold text-[#DAB775]"><Flame className="h-4 w-4" /> كنافة نابلسية تُجهّز على الفحم</div>
            <h1 className="brand-display max-w-xl text-5xl font-black leading-[1.08] sm:text-7xl">مش بس كنافة...<br /><span className="ember-text-gradient">تجربة عالجمر.</span></h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-[#D5C7B9] sm:text-lg">من رافدية، نخبز طلبك لحظة بلحظة على جمر الفحم الطبيعي. قرمشة ذهبية، جبنة نابلسية، ودفا لا ينحكى.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button type="button" onClick={() => onNavigate('menu')} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C7652D] px-6 py-4 text-sm font-black text-white shadow-xl shadow-[#C7652D]/25 hover:bg-[#A94E20]">اطلب كنافتك <ArrowLeft className="h-4 w-4" /></button>
              <button type="button" onClick={() => onNavigate('story')} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-4 text-sm font-bold text-[#F7F0E5] hover:border-[#DAB775]/60 hover:text-[#DAB775]">اكتشف حكايتنا</button>
            </div>
            <div className="mt-12 flex flex-wrap gap-x-7 gap-y-3 text-xs font-bold text-[#BDAFA2]"><span className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#DAB775]" /> تُجهّز طازجة عند الطلب</span><span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#DAB775]" /> رافدية، نابلس</span></div>
          </div>
          <div className="relative mx-auto w-full max-w-xl lg:order-first">
            <div className="absolute -inset-4 rounded-[40px] border border-[#DAB775]/15" />
            <div className="relative aspect-[1.4] overflow-hidden rounded-[32px] bg-[#35241A] shadow-2xl shadow-black/40 sm:aspect-[.95]">
              {<ProductImage src={heroProduct?.image} name={heroProduct?.name || "كنافة نابلسية"} eager />}
              <div className="absolute inset-0 bg-gradient-to-t from-[#17120F] via-transparent to-[#17120F]/20" />
              <div className="absolute bottom-6 right-6 left-6 flex items-end justify-between gap-4"><div><span className="text-xs text-[#DAB775]">من مختاراتنا</span><strong className="mt-1 block text-xl font-black">{heroProduct?.name || 'كنافة نابلسية'}</strong></div><span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C7652D] text-white"><Flame className="h-5 w-5" /></span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-8 px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 border-b border-[#35241A]/10 pb-6 sm:flex-row sm:items-end"><div><span className="flex items-center gap-2 text-xs font-black tracking-wide text-[#C7652D]"><Sparkles className="h-4 w-4" /> مختارات من النار</span><h2 className="mt-2 text-3xl font-black text-[#211814] sm:text-4xl">أصنافنا التي تُسمع قرمشتها</h2></div><button type="button" onClick={() => onNavigate('menu')} className="flex items-center gap-2 text-sm font-black text-[#C7652D] hover:text-[#A94E20]">كل المنيو <ArrowLeft className="h-4 w-4" /></button></div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{featuredProducts.map((product, index) => <ProductCard key={product.id} product={product} revealDelay={index * 70} onOpenDetails={() => onNavigateToProduct(product.id)} />)}</div>
      </section>

      <section className="bg-[#F0E8DC] py-20"><div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8"><div className="relative overflow-hidden rounded-[30px] bg-[#35241A] p-8 text-[#F7F0E5] sm:p-12"><div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[#C7652D]/40 blur-3xl" /><div className="relative"><span className="text-xs font-black text-[#DAB775]">حكاية الجمر</span><h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">السر مش بس بالمكونات.<br /><span className="text-[#DAB775]">السر بالنار.</span></h2><p className="mt-5 text-sm leading-8 text-[#D5C7B9]">{settings?.ourStory || 'نخبز الكنافة على حرارة جمر الفحم الهادئة لنحافظ على القرمشة الذهبية ونقدمها ساخنة من الفرن إلى يدك.'}</p><button type="button" onClick={() => onNavigate('story')} className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#DAB775]/40 px-5 py-3 text-sm font-bold text-[#DAB775] hover:bg-[#DAB775]/10">اقرأ القصة <ArrowLeft className="h-4 w-4" /></button></div></div><div className="space-y-7 text-right"><span className="text-xs font-black text-[#C7652D]">من أول شرارة حتى آخر لقمة</span><h2 className="text-3xl font-black text-[#211814] sm:text-4xl">تجربة تُحضّر قدامك</h2><div className="space-y-5"><div className="flex gap-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#C7652D] text-sm font-black text-white">01</span><div><h3 className="font-black text-[#211814]">اختار مزاجك</h3><p className="mt-1 text-sm leading-7 text-[#75675C]">من إسطنبولية بالقشطة إلى الكنافة النابلسية الناعمة، كل صنف يبدأ من مكونات حقيقية.</p></div></div><div className="flex gap-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#35241A] text-sm font-black text-[#DAB775]">02</span><div><h3 className="font-black text-[#211814]">حدّد الحجم</h3><p className="mt-1 text-sm leading-7 text-[#75675C]">اختر الحجم والسعر الظاهرين من بيانات المنيو، وعدّل الكمية قبل الإضافة.</p></div></div><div className="flex gap-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DAB775] text-sm font-black text-[#35241A]">03</span><div><h3 className="font-black text-[#211814]">استلمها ساخنة</h3><p className="mt-1 text-sm leading-7 text-[#75675C]">نجهّز طلبك للاستلام من فرع رافدية في الوقت الذي اخترته.</p></div></div></div></div></div></section>

      {activeOffers.length > 0 && <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"><div className="relative overflow-hidden rounded-[30px] bg-[#C7652D] p-7 text-white sm:p-10"><div className="absolute -left-12 -top-16 h-52 w-52 rounded-full border-[24px] border-white/10" /><div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end"><div className="max-w-2xl"><span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black">{activeOffers[0].badge}</span><h2 className="mt-4 text-3xl font-black sm:text-4xl">{activeOffers[0].title}</h2><p className="mt-3 text-sm leading-7 text-white/80">{activeOffers[0].description}</p></div><button type="button" onClick={() => onNavigate('offers')} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#17120F] px-6 py-4 text-sm font-black text-white hover:bg-[#35241A]">شوف العرض <ArrowLeft className="h-4 w-4" /></button></div></div></section>}

      {reviews.length > 0 && <section className="mx-auto max-w-7xl space-y-8 px-4 pb-20 sm:px-6 lg:px-8"><div className="text-center"><span className="text-xs font-black text-[#C7652D]">تجارب حقيقية</span><h2 className="mt-2 text-3xl font-black text-[#211814]">كلام الناس بعد أول لقمة</h2></div><div className="grid gap-5 md:grid-cols-3">{reviews.filter((review) => review.isApproved && !review.isDemo).slice(0, 3).map((review) => <article key={review.id} className="rounded-[24px] border border-[#35241A]/10 bg-white p-6"><div className="flex gap-1 text-[#DAB775]">{Array.from({ length: review.rating }).map((_, index) => <Star key={index} className="h-4 w-4 fill-current" />)}</div><p className="mt-5 text-sm leading-8 text-[#75675C]">“{review.comment}”</p><div className="mt-5 border-t border-[#35241A]/10 pt-4 text-xs font-bold text-[#211814]">{review.customerName || review.userName || 'زبوننا'}</div></article>)}</div></section>}

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8"><div className="grid gap-8 rounded-[30px] bg-[#17120F] p-7 text-[#F7F0E5] sm:p-10 md:grid-cols-[1fr_auto] md:items-center"><div><span className="text-xs font-black text-[#DAB775]">زورونا في رافدية</span><h2 className="mt-3 text-3xl font-black">خلّي أول تجربة تبدأ من الفرع.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-[#D5C7B9]">{settings?.branch || 'رافدية - الشارع الرئيسي، نابلس، فلسطين'}</p><div className="mt-5 flex flex-wrap gap-5 text-xs font-bold text-[#BDAFA2]"><span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#DAB775]" /> رافدية، نابلس</span><span className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#DAB775]" /> {settings?.phone || '+970 562 606 061'}</span></div></div><div className="flex flex-col gap-3 sm:flex-row"><a href={`tel:${settings?.phone || '+970562606061'}`} className="rounded-full border border-white/15 px-6 py-3 text-center text-sm font-bold hover:border-[#DAB775]/50 hover:text-[#DAB775]">اتصل بنا</a><button type="button" onClick={() => onNavigate('menu')} className="rounded-full bg-[#DAB775] px-6 py-3 text-sm font-black text-[#35241A] hover:bg-[#E3C78F]">اطلب الآن</button></div></div></section>
    </div>
  );
};
