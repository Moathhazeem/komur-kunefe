import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Clock3, Flame, MapPin, Minus, Plus, Share2, ShoppingBag, Sparkles } from 'lucide-react';
import { Product, ProductVariant, Review } from '../types';
import { ProductReviewsSection } from '../components/ProductReviewsSection';
import { StarRating } from '../components/StarRating';
import { addReview as saveNewReview, calculateProductRating, getReviewsByProductId } from '../utils/reviewsStorage';

interface ProductDetailsPageProps {
  productId: string | null;
  products: Product[];
  onNavigate: (tab: string) => void;
  onNavigateToProduct: (productId: string) => void;
  onAddToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
  onOpenCart: () => void;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({ productId, products, onNavigate, onNavigateToProduct, onAddToCart, onOpenCart }) => {
  const product = useMemo(() => products.find((item) => item.id === productId) || null, [products, productId]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (!product) return;
    setSelectedVariant(product.variants.find((variant) => variant.isDefault) || product.variants[0] || { id: 'default', name: 'حجم واحد', price: product.basePrice });
    setQuantity(1);
    setJustAdded(false);
    setImageError(false);
    setReviews(getReviewsByProductId(product.id));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product]);

  if (!product) return <div className="mx-auto max-w-xl px-4 py-24 text-center"><Flame className="mx-auto h-12 w-12 text-[#C7652D]" /><h1 className="mt-5 text-2xl font-black text-[#211814]">لم يتم العثور على الصنف</h1><button type="button" onClick={() => onNavigate('menu')} className="mt-6 rounded-full bg-[#C7652D] px-6 py-3 text-sm font-black text-white">العودة إلى المنيو</button></div>;

  const variant = selectedVariant || product.variants[0] || { id: 'default', name: 'حجم واحد', price: product.basePrice };
  const total = variant.price * quantity;
  const rating = calculateProductRating(reviews);
  const related = products.filter((item) => item.id !== product.id && (item.category === product.category || item.featured)).slice(0, 3);

  const addToCart = () => {
    if (!product.isAvailable) return;
    onAddToCart(product, variant, quantity);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 2200);
  };
  const addReview = (data: { userName: string; rating: number; comment: string }) => {
    const created = saveNewReview({ productId: product.id, ...data });
    setReviews((current) => [created, ...current]);
  };
  const share = () => navigator.clipboard?.writeText(`${window.location.origin}/product/${product.id}`);

  return (
    <div className="min-h-screen bg-[#FBF8F2] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-3"><button type="button" onClick={() => onNavigate('menu')} className="inline-flex items-center gap-2 text-sm font-black text-[#75675C] hover:text-[#C7652D]"><ArrowRight className="h-4 w-4" /> العودة للمنيو</button><button type="button" onClick={share} className="inline-flex items-center gap-2 rounded-full border border-[#35241A]/10 bg-white px-4 py-2.5 text-xs font-bold text-[#75675C] hover:border-[#C7652D]/40 hover:text-[#C7652D]"><Share2 className="h-3.5 w-3.5" /> مشاركة</button></div>
        <div className="grid items-start gap-10 lg:grid-cols-[.92fr_1.08fr] lg:gap-16">
          <div className="space-y-5 lg:sticky lg:top-28"><div className="relative aspect-[.95] overflow-hidden rounded-[30px] bg-[#35241A] shadow-2xl shadow-[#35241A]/15">{product.image && !imageError ? <img src={product.image} alt={product.name} onError={() => setImageError(true)} className="h-full w-full object-cover" /> : <div className="flex h-full flex-col items-center justify-center gap-3 text-[#DAB775]"><Flame className="h-16 w-16" /><span className="font-bold">كنافة تُخبز على الجمر</span></div>}<div className="absolute inset-0 bg-gradient-to-t from-[#17120F]/65 via-transparent to-transparent" />{product.featured && <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-[#DAB775] px-3 py-1.5 text-xs font-black text-[#35241A]"><Sparkles className="h-3.5 w-3.5" /> اختيارنا</span>}<div className="absolute bottom-5 right-5 text-white"><span className="text-xs text-[#DAB775]">تُحضّر عند الطلب</span><p className="mt-1 text-lg font-black">ساخنة من الفحم إلى يدك</p></div></div><div className="rounded-[24px] border border-[#DAB775]/30 bg-[#F0E8DC] p-5"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C7652D] text-white"><Flame className="h-5 w-5" /></span><div><h3 className="text-sm font-black text-[#211814]">حكاية الجمر</h3><p className="mt-1 text-xs text-[#75675C]">قرمشة ذهبية من رافدية</p></div></div><p className="mt-4 text-xs leading-7 text-[#75675C]">نجهّزها لحظة وصول الطلب على جمر الفحم الطبيعي لتصلك ساخنة كما تحب.</p></div></div>

          <div className="space-y-8"><div><div className="flex flex-wrap items-center gap-2 text-xs font-bold"><span className="rounded-full bg-[#F0E8DC] px-3 py-1.5 text-[#C7652D]">{product.category === 'charcoal' ? 'على الفحم' : 'من المنيو'}</span><span className={`rounded-full px-3 py-1.5 ${product.isAvailable ? 'bg-[#E3F3EA] text-[#1B7C4B]' : 'bg-[#FCE6E2] text-[#A94434]'}`}>{product.isAvailable ? 'متوفر الآن' : 'غير متوفر مؤقتاً'}</span></div><h1 className="mt-4 text-4xl font-black leading-tight text-[#211814] sm:text-6xl">{product.name}</h1><div className="mt-4 flex items-center gap-3"><StarRating rating={Math.round(rating.averageRating)} size="sm" /><span className="text-sm font-black text-[#211814]">{rating.averageRating.toFixed(1)}</span><span className="text-xs text-[#75675C]">({rating.totalReviews} تقييم)</span></div><p className="mt-5 max-w-2xl text-base leading-8 text-[#75675C]">{product.description}</p></div>
            <div className="grid grid-cols-3 border-y border-[#35241A]/10 py-5 text-center"><div><span className="block text-[10px] text-[#75675C]">الخبز</span><strong className="mt-1 block text-xs text-[#C7652D]">جمر الفحم</strong></div><div className="border-x border-[#35241A]/10"><span className="block text-[10px] text-[#75675C]">الاستلام</span><strong className="mt-1 block text-xs text-[#C7652D]">رافدية</strong></div><div><span className="block text-[10px] text-[#75675C]">التحضير</span><strong className="mt-1 block text-xs text-[#C7652D]">10–15 دقيقة</strong></div></div>
            <div><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-black text-[#211814]">اختار الحجم</h2><span className="text-xs text-[#75675C]">{product.variants.length} خيارات</span></div><div className="grid gap-3 sm:grid-cols-2">{product.variants.map((item) => <button key={item.id} type="button" onClick={() => setSelectedVariant(item)} className={`flex items-center justify-between gap-3 rounded-2xl border-2 p-4 text-right ${variant.id === item.id ? 'border-[#C7652D] bg-[#F0E8DC]' : 'border-[#35241A]/10 bg-white hover:border-[#C7652D]/35'}`}><span><span className="flex items-center gap-2 text-sm font-black text-[#211814]"><span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${variant.id === item.id ? 'border-[#C7652D] bg-[#C7652D]' : 'border-[#B9ADA3]'}`}>{variant.id === item.id && <Check className="h-3 w-3 text-white" />}</span>{item.name}</span>{item.takeawayPrice && <small className="mt-1 block pr-7 text-[10px] text-[#75675C]">سفري: {item.takeawayPrice} ₪</small>}</span><strong className="shrink-0 text-lg font-black text-[#C7652D]">{item.price} <small className="text-xs text-[#75675C]">₪</small></strong></button>)}</div></div>
            <div className="rounded-[24px] bg-[#17120F] p-5 text-[#F7F0E5]"><div className="flex items-center justify-between gap-4"><div><span className="text-xs text-[#BDAFA2]">الكمية</span><div className="mt-2 flex items-center gap-3"><button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} disabled={quantity <= 1} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-[#DAB775] disabled:opacity-40" aria-label="إنقاص الكمية"><Minus className="h-4 w-4" /></button><span className="w-6 text-center text-xl font-black">{quantity}</span><button type="button" onClick={() => setQuantity((current) => current + 1)} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-[#DAB775]" aria-label="زيادة الكمية"><Plus className="h-4 w-4" /></button></div></div><div className="text-left"><span className="block text-xs text-[#BDAFA2]">المجموع</span><strong className="text-3xl font-black text-[#DAB775]">{total}<small className="mr-1 text-sm text-[#BDAFA2]">₪</small></strong></div></div><div className="mt-5 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={addToCart} disabled={!product.isAvailable} className={`flex-1 rounded-full px-5 py-4 text-sm font-black ${justAdded ? 'bg-[#1C8C5E] text-white' : 'bg-[#C7652D] text-white hover:bg-[#A94E20]'} disabled:cursor-not-allowed disabled:bg-[#6D625B]`}>{justAdded ? <span className="flex items-center justify-center gap-2"><Check className="h-5 w-5" /> تمت الإضافة</span> : <span className="flex items-center justify-center gap-2"><ShoppingBag className="h-5 w-5" /> أضف للسلة · {total} ₪</span>}</button>{justAdded && <button type="button" onClick={onOpenCart} className="rounded-full border border-white/15 px-5 py-4 text-sm font-bold text-[#F7F0E5]">عرض السلة <ArrowLeft className="mr-1 inline h-4 w-4" /></button>}</div><p className="mt-4 flex items-center gap-2 text-xs text-[#BDAFA2]"><MapPin className="h-4 w-4 text-[#DAB775]" /> الاستلام من فرع رافدية فقط · <Clock3 className="h-4 w-4 text-[#DAB775]" /> تجهيز طازج</p></div>
            <ProductReviewsSection productId={product.id} productName={product.name} reviews={reviews} onAddReview={addReview} initiallyOpenForm={true} />
          </div>
        </div>
        {related.length > 0 && <section className="mt-20 border-t border-[#35241A]/10 pt-10"><div className="flex items-end justify-between"><div><span className="text-xs font-black text-[#C7652D]">يمكن أن يعجبك أيضاً</span><h2 className="mt-2 text-2xl font-black text-[#211814]">نكهات من نفس النار</h2></div><button type="button" onClick={() => onNavigate('menu')} className="hidden items-center gap-2 text-xs font-black text-[#C7652D] sm:flex">كل المنيو <ArrowLeft className="h-4 w-4" /></button></div><div className="mt-6 grid gap-5 md:grid-cols-3">{related.map((item) => <button key={item.id} type="button" onClick={() => onNavigateToProduct(item.id)} className="group overflow-hidden rounded-[22px] border border-[#35241A]/10 bg-white text-right"><div className="aspect-[1.4] overflow-hidden bg-[#F0E8DC]"><img src={item.image} alt={item.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /></div><div className="p-4"><strong className="text-sm font-black text-[#211814]">{item.name}</strong><span className="mt-2 block text-xs font-bold text-[#C7652D]">يبدأ من {Math.min(...item.variants.map((v) => v.price))} ₪</span></div></button>)}</div></section>}
      </div>
    </div>
  );
};
