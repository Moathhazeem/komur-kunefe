import { memo, useState, type MouseEvent, type PointerEvent } from 'react';
import { ArrowUpLeft, Check, Flame, Share2, ShoppingBag } from 'lucide-react';
import { motion, useIsPresent, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import type { Product } from '../types';
import { shareProduct } from '../utils/shareProduct';
import { ProductImage } from './ProductImage';
import { PremiumButton } from './ui/PremiumButton';
import { cinematicEase } from './motion/Reveal';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (productId: string) => void;
  revealDelay?: number;
}
export const ProductCard = memo(function ProductCard({ product, onOpenDetails, revealDelay = 0 }: ProductCardProps) {
  const reduced = useReducedMotion();
  const present = useIsPresent();
  const [notice, setNotice] = useState('');
  const productPath = '/product/' + encodeURIComponent(product.id);
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
    setNotice('');
    setNotice(await shareProduct(product.name, product.id));
  }
  function openDetails(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onOpenDetails(product.id);
  }

  return <motion.article className="catalog-card" inert={!present}
    initial={reduced ? false : { opacity: 0.85, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: .12 }}
    transition={{ duration: reduced ? 0 : .55, delay: reduced ? 0 : Math.min(revealDelay / 1000, .2), ease: cinematicEase }}
    onPointerMove={tilt} onPointerLeave={resetTilt} onPointerCancel={resetTilt}>
    <motion.div className="catalog-card-shell" style={reduced ? undefined : { rotateX, rotateY, transformPerspective: 1100 }}
      whileHover={reduced ? undefined : { y: -7 }} transition={{ type: 'spring', stiffness: 240, damping: 24 }}>
      <div className="catalog-card-media">
        <ProductImage src={product.image} name={product.name}
          sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 900px) 46vw, (max-width: 1440px) 31vw, 420px" />
        <a className="catalog-image-action" href={productPath} onClick={openDetails} aria-label={`عرض تفاصيل ${product.name}`} />
        <div className="catalog-card-top">
          <span className={!product.isAvailable ? 'unavailable' : ''}><Flame size={12} />{!product.isAvailable ? 'غير متوفر حالياً' : product.featured ? 'مختارات كُومُر' : product.isSeasonal ? 'صنف موسمي' : 'من المنيو'}</span>
          <motion.button whileTap={reduced ? undefined : { scale: .9 }} type="button" onClick={share} aria-label={`مشاركة ${product.name}`}>{notice === 'تم نسخ رابط الصنف' ? <Check size={17} aria-hidden="true" /> : <Share2 size={16} aria-hidden="true" />}</motion.button>
        </div>
        <span className="catalog-image-arrow" aria-hidden="true"><ArrowUpLeft size={22} /></span>
      </div>
      <div className="catalog-card-body">
        <div className="catalog-card-meta"><span>{product.category === 'charcoal' ? 'على جمر الفحم' : product.category === 'nutella' ? 'للشوكولاتة حكاية' : 'من منيو الفرع'}</span><span>{product.variants.length} أحجام</span></div>
        <h3>{product.name}</h3>
        {product.description && <p>{product.description.replace(/\(.*?شيكل.*?\)/g, '')}</p>}
        <div className="catalog-card-bottom">
          <div className="catalog-price"><small>{product.isInitialPrice ? 'سعر تقديري من' : 'يبدأ من'}</small><strong><bdi>{price}</bdi><span>₪</span></strong></div>
          <PremiumButton disabled={!product.isAvailable} onClick={() => onOpenDetails(product.id)} icon={<ShoppingBag size={17} />} className="catalog-order">{product.isAvailable ? 'اختار حجمك' : 'غير متوفر'}</PremiumButton>
        </div>
        <span role="status" className="catalog-share-status">{notice}</span>
      </div>
    </motion.div>
  </motion.article>;
});
