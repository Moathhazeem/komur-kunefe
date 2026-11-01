import { useState } from 'react';
import { ArrowUpLeft, Share2, Plus } from 'lucide-react';
import type { Product } from '../types';
import { ProductImage } from './ProductImage';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
  revealDelay?: number;
}
export function ProductCard({ product, onOpenDetails, revealDelay = 0 }: ProductCardProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({delay:revealDelay});
  const [notice,setNotice]=useState('');
  const price=product.variants.length ? Math.min(...product.variants.map(v=>v.price)) : product.basePrice;
  async function share() {
    const url=`${window.location.origin}/product/${encodeURIComponent(product.id)}`;
    try {
      if(navigator.share) await navigator.share({title:product.name,url});
      else {await navigator.clipboard.writeText(url);setNotice('تم نسخ رابط الصنف');}
    } catch(error) { if(!(error instanceof DOMException && error.name==='AbortError'))setNotice('تعذرت المشاركة. افتح تفاصيل الصنف لنسخ الرابط.'); }
  }
  return <article ref={ref} className={`catalog-card reveal-card ${isVisible?'is-visible':''}`}>
    <div className="catalog-card-media">
      <ProductImage src={product.image} name={product.name}/>
      <button className="catalog-image-action" onClick={()=>onOpenDetails(product)} aria-label={`عرض تفاصيل ${product.name}`}/>
      <div className="catalog-card-top"><span>{!product.isAvailable?'غير متوفر حالياً':product.featured?'مختارات كُومُر':product.isSeasonal?'صنف موسمي':'من المنيو'}</span><button onClick={share} aria-label={`مشاركة ${product.name}`}><Share2 size={16}/></button></div>
      <span className="catalog-image-arrow" aria-hidden="true"><ArrowUpLeft size={22}/></span>
    </div>
    <div className="catalog-card-body">
      <span className="catalog-card-category">{product.category==='charcoal'?'على جمر الفحم':product.category==='nutella'?'للشوكولاتة حكاية':'من منيو الفرع'}</span>
      <h3><button onClick={()=>onOpenDetails(product)}>{product.name}</button></h3>
      {product.description && <p>{product.description.replace(/\(.*?شيكل.*?\)/g,'')}</p>}
      <div className="catalog-card-bottom"><div><small>{product.isInitialPrice?'سعر تقديري من':'يبدأ من'}</small><strong>{price}<span>₪</span></strong></div><button disabled={!product.isAvailable} onClick={()=>onOpenDetails(product)} className="catalog-add"><Plus size={18}/><span>{product.isAvailable?'اختار حجمك':'غير متوفر'}</span></button></div>
      {notice && <span role="status" className="catalog-share-status">{notice}</span>}
    </div>
  </article>;
}
