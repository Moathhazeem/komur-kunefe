import { useState, type PointerEvent } from 'react';
import { ArrowUpLeft, Check, Flame, Share2, ShoppingBag } from 'lucide-react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import type { Product } from '../types';
import { ProductImage } from './ProductImage';
import { PremiumButton } from './ui/PremiumButton';
import { cinematicEase } from './motion/Reveal';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
  revealDelay?: number;
}
export function ProductCard({ product, onOpenDetails, revealDelay = 0 }: ProductCardProps) {
  const reduced = useReducedMotion();
  const [notice, setNotice] = useState('');
  const [copied, setCopied] = useState(false);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateX = useSpring(rawX, { stiffness: 160, damping: 24 });
  const rotateY = useSpring(rawY, { stiffness: 160, damping: 24 });
  const price = product.variants.length ? Math.min(...product.variants.map(v => v.price)) : product.basePrice;

  function tilt(event: PointerEvent<HTMLElement>) {
    if (reduced || event.pointerType !== 'mouse' || !window.matchMedia('(hover: hover)').matches) return;
    const box = event.currentTarget.getBoundingClientRect();
    rawX.set(((event.clientY - box.top) / box.height - .5) * -5);
    rawY.set(((event.clientX - box.left) / box.width - .5) * 5);
  }
  function resetTilt() { rawX.set(0); rawY.set(0); }
  async function share() {
    const url = `${window.location.origin}/product/${encodeURIComponent(product.id)}`;
    try {
      if (navigator.share) await navigator.share({ title: product.name, url });
      else { await navigator.clipboard.writeText(url); setCopied(true); setNotice('تم نسخ رابط الصنف'); }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) setNotice('تعذرت المشاركة. جرّب من صفحة الصنف.');
    }
  }

  return <motion.article layout="position" className="catalog-card"
    initial={reduced ? false : { opacity: 0, y: 32 }}
    whileInView={{ opacity: 1, y: 0 }}
    exit={reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: .98 }}
    viewport={{ once: true, amount: .12 }}
    transition={{ duration: reduced ? 0 : .55, delay: reduced ? 0 : Math.min(revealDelay / 1000, .2), ease: cinematicEase, layout: { duration: reduced ? 0 : .35 } }}
    onPointerMove={tilt} onPointerLeave={resetTilt} onPointerCancel={resetTilt}>
    <motion.div className="catalog-card-shell" style={reduced ? undefined : { rotateX, rotateY, transformPerspective: 1100 }}
      whileHover={reduced ? undefined : { y: -7 }} transition={{ type: 'spring', stiffness: 240, damping: 24 }}>
      <div className="catalog-card-media">
        <ProductImage src={product.image} name={product.name} />
        <button className="catalog-image-action" onClick={() => onOpenDetails(product)} aria-label={`عرض تفاصيل ${product.name}`} />
        <div className="catalog-card-top">
          <span className={!product.isAvailable ? 'unavailable' : ''}><Flame size={12} />{!product.isAvailable ? 'غير متوفر حالياً' : product.featured ? 'مختارات كُومُر' : product.isSeasonal ? 'صنف موسمي' : 'من المنيو'}</span>
          <motion.button whileTap={reduced ? undefined : { scale: .9 }} onClick={share} aria-label={`مشاركة ${product.name}`}>{copied ? <Check size={17} /> : <Share2 size={16} />}</motion.button>
        </div>
        <span className="catalog-image-arrow" aria-hidden="true"><ArrowUpLeft size={22} /></span>
      </div>
      <div className="catalog-card-body">
        <div className="catalog-card-meta"><span>{product.category === 'charcoal' ? 'على جمر الفحم' : product.category === 'nutella' ? 'للشوكولاتة حكاية' : 'من منيو الفرع'}</span><span>{product.variants.length} أحجام</span></div>
        <h3><button onClick={() => onOpenDetails(product)}>{product.name}</button></h3>
        {product.description && <p>{product.description.replace(/\(.*?شيكل.*?\)/g, '')}</p>}
        <div className="catalog-card-bottom">
          <div className="catalog-price"><small>{product.isInitialPrice ? 'سعر تقديري من' : 'يبدأ من'}</small><strong>{price}<span>₪</span></strong></div>
          <PremiumButton disabled={!product.isAvailable} onClick={() => onOpenDetails(product)} icon={<ShoppingBag size={17} />} className="catalog-order">{product.isAvailable ? 'اختار حجمك' : 'غير متوفر'}</PremiumButton>
        </div>
        {notice && <span role="status" className="catalog-share-status">{notice}</span>}
      </div>
    </motion.div>
  </motion.article>;
}
