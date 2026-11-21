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
  cartError: string;
  onVariant: (variant: ProductVariant) => void;
  onQuantity: (quantity: number) => void;
  onAdd: () => void;
  onOpenCart: () => void;
}
export function ProductConfigurator({ product, variant, quantity, justAdded, cartError, onVariant, onQuantity, onAdd, onOpenCart }: ProductConfiguratorProps) {
  const reduced = useReducedMotion();
  const canOrder = product.isAvailable && product.variants.length > 0;
  const total = Math.round(variant.price * 100) * quantity / 100;
  return <div className="product-configurator">
    {product.variants.length > 0 && <fieldset className="variant-picker">
      <legend>اختار حجم اللَمّة <span>{product.variants.length} خيارات</span></legend>
      <div className="variant-picker-grid">{product.variants.map(item => {
        const selected = variant.id === item.id;
        return <motion.label key={item.id} className="variant-option" whileTap={reduced ? undefined : { scale: .985 }}>
          <input type="radio" name={`variant-${product.id}`} checked={selected} onChange={() => onVariant(item)} />
          <span className="variant-option-title"><span className="variant-check" aria-hidden="true">{selected && <Check size={12} />}</span><span>{item.name}</span></span>
          <strong><bdi>{item.price}</bdi><small> ₪</small></strong>
          {item.takeawayPrice != null && <span className="variant-tariff-note">سفري <bdi>{item.takeawayPrice} ₪</bdi></span>}
        </motion.label>;
      })}</div>
    </fieldset>}
    <div className="product-order-panel">
      <div className="product-order-top"><div><span className="product-order-label">كم صحن؟</span><div className="quantity-control">
        <motion.button type="button" whileTap={reduced ? undefined : { scale: .9 }} onClick={() => onQuantity(Math.max(1, quantity - 1))} disabled={!canOrder || quantity <= 1} aria-label="إنقاص الكمية"><Minus size={17} /></motion.button>
        <output aria-label="الكمية المختارة"><bdi>{quantity}</bdi></output>
        <motion.button type="button" whileTap={reduced ? undefined : { scale: .9 }} onClick={() => onQuantity(quantity + 1)} disabled={!canOrder || quantity >= quantityLimit(variant)} aria-label="زيادة الكمية"><Plus size={17} /></motion.button>
      </div></div><div className="product-total"><span className="product-order-label">المجموع</span><span className="animated-total" aria-hidden="true"><AnimatePresence mode="popLayout" initial={false}><motion.strong key={total} initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -12 }} transition={{ duration: reduced ? 0 : .2 }}><bdi>{total}</bdi><small> ₪</small></motion.strong></AnimatePresence></span><span className="sr-only">المجموع <bdi>{total} ₪</bdi></span></div></div>
      <PremiumButton className={`w-full ${justAdded ? 'premium-button--success' : ''}`} disabled={!canOrder} onClick={onAdd} icon={justAdded ? <Check size={20} /> : <ShoppingBag size={19} />}>{!canOrder ? 'الطلب غير متاح' : 'أضف للسلة'}</PremiumButton>
      <p className="product-cart-status" role="status" aria-atomic="true">{justAdded ? 'تمت الإضافة إلى السلة' : ''}</p>
      {cartError && <p className="detail-error" role="alert">{cartError}</p>}
      <AnimatePresence initial={false}>{justAdded && <motion.div className="product-cart-followup" initial={reduced ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}><button type="button" onClick={onOpenCart}>عرض السلة وإتمام الطلب <ArrowLeft size={17} /></button></motion.div>}</AnimatePresence>
      <p className="product-order-footnote">السعر المعروض للطلب عبر الموقع · الاستلام من رافدية</p>
    </div>
  </div>;
}
