import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, Check, Minus, Plus, ShoppingBag } from 'lucide-react';
import type { Product, ProductVariant } from '../../types';
import { PremiumButton } from '../ui/PremiumButton';
import { quantityLimit } from '../../../shared/commerce';

interface ProductConfiguratorProps {
  product: Product;
  variant: ProductVariant;
  quantity: number;
  justAdded: boolean;
  onVariant: (variant: ProductVariant) => void;
  onQuantity: (quantity: number) => void;
  onAdd: () => void;
  onOpenCart: () => void;
}
export function ProductConfigurator({ product, variant, quantity, justAdded, onVariant, onQuantity, onAdd, onOpenCart }: ProductConfiguratorProps) {
  const reduced = useReducedMotion();
  const total = variant.price * quantity;
  return <div className="product-configurator">
    <fieldset className="variant-picker">
      <legend>اختار حجم اللَمّة <span>{product.variants.length} خيارات</span></legend>
      <div className="variant-picker-grid">{product.variants.map(item => {
        const selected = variant.id === item.id;
        return <motion.label key={item.id} className="variant-option" whileTap={reduced ? undefined : { scale: .985 }}>
          <input type="radio" name={`variant-${product.id}`} checked={selected} onChange={() => { onVariant(item); onQuantity(Math.min(quantity, quantityLimit(item))); }} />
          <span className="variant-option-title"><span className="variant-check" aria-hidden="true">{selected && <Check size={12} />}</span><span>{item.name}</span></span>
          <strong>{item.price}<small> ₪</small></strong>
          {item.takeawayPrice && <span className="variant-tariff-note">سفري: {item.takeawayPrice} ₪</span>}
        </motion.label>;
      })}</div>
    </fieldset>
    <div className="product-order-panel">
      <div className="product-order-top"><div><span className="product-order-label">كم صحن؟</span><div className="quantity-control">
        <motion.button type="button" whileTap={reduced ? undefined : { scale: .9 }} onClick={() => onQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} aria-label="إنقاص الكمية"><Minus size={17} /></motion.button>
        <span aria-live="polite">{quantity}</span>
        <motion.button type="button" whileTap={reduced ? undefined : { scale: .9 }} onClick={() => onQuantity(quantity + 1)} disabled={quantity >= quantityLimit(variant)} aria-label="زيادة الكمية"><Plus size={17} /></motion.button>
      </div></div><div className="product-total"><span className="product-order-label">المجموع</span><span className="animated-total"><AnimatePresence mode="popLayout" initial={false}><motion.strong key={total} initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -12 }} transition={{ duration: reduced ? 0 : .2 }}>{total}<small> ₪</small></motion.strong></AnimatePresence></span></div></div>
      <PremiumButton className={`w-full ${justAdded ? 'premium-button--success' : ''}`} disabled={!product.isAvailable} onClick={onAdd} icon={justAdded ? <Check size={20} /> : <ShoppingBag size={19} />}>{!product.isAvailable ? 'غير متوفر حالياً' : justAdded ? 'صارت بالسلة!' : 'أضف للسلة'}</PremiumButton>
      <AnimatePresence initial={false}>{justAdded && <motion.div className="product-cart-followup" initial={reduced ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}><button type="button" onClick={onOpenCart}>عرض السلة وإتمام الطلب <ArrowLeft size={17} /></button></motion.div>}</AnimatePresence>
      <p className="product-order-footnote">السعر المعروض للطلب عبر الموقع · الاستلام من رافدية</p>
    </div>
  </div>;
}
