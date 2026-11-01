import { useReducedMotion } from 'motion/react';
import { ProductConfigurator } from '../components/product/ProductConfigurator';
import { ProductCard } from '../components/ProductCard';
import { ProductImage } from '../components/ProductImage';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Flame, Share2, Sparkles } from 'lucide-react';
import { Product, ProductVariant } from '../types';

interface ProductDetailsPageProps {
  productId: string | null;
  products: Product[];
  onNavigate: (tab: string) => void;
  onNavigateToProduct: (productId: string) => void;
  onAddToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
  onOpenCart: () => void;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({ productId, products, onNavigate, onNavigateToProduct, onAddToCart, onOpenCart }) => {
  const reduced = useReducedMotion();
  const addedTimer = useRef<number | null>(null);
  useEffect(() => () => { if(addedTimer.current !== null) window.clearTimeout(addedTimer.current); }, []);
  const product = useMemo(() => products.find((item) => item.id === productId) || null, [products, productId]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [cartError, setCartError] = useState('');

  useEffect(() => {
    if (!product) return;
    setSelectedVariant(product.variants.find((variant) => variant.isDefault) || product.variants[0] || { id: 'default', name: 'حجم واحد', price: product.basePrice });
    setQuantity(1);
    setJustAdded(false);

    window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' });
  }, [product, reduced]);

  if (!product) return <div className="mx-auto max-w-xl px-4 py-24 text-center"><Flame className="mx-auto h-12 w-12 text-[#C7652D]" /><h1 className="mt-5 text-2xl font-black text-[#211814]">لم يتم العثور على الصنف</h1><button type="button" onClick={() => onNavigate('menu')} className="mt-6 rounded-full bg-[#C7652D] px-6 py-3 text-sm font-black text-white">العودة إلى المنيو</button></div>;

  const variant = selectedVariant || product.variants[0] || { id: 'default', name: 'حجم واحد', price: product.basePrice };

  const related = products.filter((item) => item.id !== product.id && (item.category === product.category || item.featured)).slice(0, 3);

  const addToCart = () => {
    if (!product.isAvailable) return;
    try { onAddToCart(product, variant, quantity); setCartError(''); }
    catch(error) { setCartError(error instanceof Error ? error.message : 'تعذر الإضافة'); return; }
    setJustAdded(true);
    if(addedTimer.current !== null) window.clearTimeout(addedTimer.current);
    addedTimer.current = window.setTimeout(() => setJustAdded(false), 2200);
  };
  const share = () => navigator.clipboard?.writeText(`${window.location.origin}/product/${product.id}`);

  return (
    <div className="product-detail-page min-h-screen bg-[#FBF8F2] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-3"><button type="button" onClick={() => onNavigate('menu')} className="inline-flex items-center gap-2 text-sm font-black text-[#75675C] hover:text-[#C7652D]"><ArrowRight className="h-4 w-4" /> العودة للمنيو</button><button type="button" onClick={share} className="inline-flex items-center gap-2 rounded-full border border-[#35241A]/10 bg-white px-4 py-2.5 text-xs font-bold text-[#75675C] hover:border-[#C7652D]/40 hover:text-[#C7652D]"><Share2 className="h-3.5 w-3.5" /> مشاركة</button></div>
        <div className="grid items-start gap-10 lg:grid-cols-[.92fr_1.08fr] lg:gap-16">
          <div className="space-y-5 lg:sticky lg:top-28"><div className="relative aspect-[.95] overflow-hidden rounded-[30px] bg-[#35241A] shadow-2xl shadow-[#35241A]/15">{<ProductImage src={product.image} name={product.name} eager />}<div className="absolute inset-0 bg-gradient-to-t from-[#17120F]/65 via-transparent to-transparent" />{product.featured && <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-[#DAB775] px-3 py-1.5 text-xs font-black text-[#35241A]"><Sparkles className="h-3.5 w-3.5" /> اختيارنا</span>}<div className="absolute bottom-5 right-5 text-white"><span className="text-xs text-[#DAB775]">تُحضّر عند الطلب</span><p className="mt-1 text-lg font-black">ساخنة من الفحم إلى يدك</p></div></div><div className="rounded-[24px] border border-[#DAB775]/30 bg-[#F0E8DC] p-5"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C7652D] text-white"><Flame className="h-5 w-5" /></span><div><h3 className="text-sm font-black text-[#211814]">حكاية الجمر</h3><p className="mt-1 text-xs text-[#75675C]">قرمشة ذهبية من رافدية</p></div></div><p className="mt-4 text-xs leading-7 text-[#75675C]">نجهّزها لحظة وصول الطلب على جمر الفحم الطبيعي لتصلك ساخنة كما تحب.</p></div></div>

          <div className="space-y-8">{cartError && <p role="alert" className="status-notice">{cartError}</p>}<div><div className="flex flex-wrap items-center gap-2 text-xs font-bold"><span className="rounded-full bg-[#F0E8DC] px-3 py-1.5 text-[#C7652D]">{product.category === 'charcoal' ? 'على الفحم' : 'من المنيو'}</span><span className={`rounded-full px-3 py-1.5 ${product.isAvailable ? 'bg-[#E3F3EA] text-[#1B7C4B]' : 'bg-[#FCE6E2] text-[#A94434]'}`}>{product.isAvailable ? 'متوفر الآن' : 'غير متوفر مؤقتاً'}</span></div><h1 className="mt-4 text-4xl font-black leading-tight text-[#211814] sm:text-6xl">{product.name}</h1><p className="mt-5 max-w-2xl text-base leading-8 text-[#75675C]">{product.description}</p></div>
            <div className="grid grid-cols-3 border-y border-[#35241A]/10 py-5 text-center"><div><span className="block text-[10px] text-[#75675C]">الخبز</span><strong className="mt-1 block text-xs text-[#C7652D]">جمر الفحم</strong></div><div className="border-x border-[#35241A]/10"><span className="block text-[10px] text-[#75675C]">الاستلام</span><strong className="mt-1 block text-xs text-[#C7652D]">رافدية</strong></div><div><span className="block text-[10px] text-[#75675C]">التحضير</span><strong className="mt-1 block text-xs text-[#C7652D]">حسب موعد الاستلام</strong></div></div>
            <ProductConfigurator product={product} variant={variant} quantity={quantity} justAdded={justAdded} onVariant={setSelectedVariant} onQuantity={setQuantity} onAdd={addToCart} onOpenCart={onOpenCart} />
            <section className="signature-panel"><h2 className="text-xl font-black">تجارب من الفرع</h2><p className="my-3 text-sm text-stone-600">اقرأ التقييمات المعتمدة أو شارك تجربتك ليتم مراجعتها.</p><button className="signature-button secondary" onClick={()=>onNavigate('reviews')}>التقييمات ومشاركة تجربة</button></section>
          </div>
        </div>
        {related.length > 0 && <section className="mt-20 border-t border-[#35241A]/10 pt-10"><div className="flex items-end justify-between"><div><span className="text-xs font-black text-[#C7652D]">يمكن أن يعجبك أيضاً</span><h2 className="mt-2 text-2xl font-black text-[#211814]">نكهات من نفس النار</h2></div><button type="button" onClick={() => onNavigate('menu')} className="hidden items-center gap-2 text-xs font-black text-[#C7652D] sm:flex">كل المنيو <ArrowLeft className="h-4 w-4" /></button></div><div className="mt-6 grid gap-5 md:grid-cols-3">{related.map((item) => <ProductCard key={item.id} product={item} onOpenDetails={selected => onNavigateToProduct(selected.id)} />)}</div></section>}
      </div>
    </div>
  );
};
