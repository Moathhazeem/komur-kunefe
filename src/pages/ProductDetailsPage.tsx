import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, Flame, Share2 } from 'lucide-react';
import { quantityLimit } from '../../shared/commerce';
import { ProductCard } from '../components/ProductCard';
import { ProductImage } from '../components/ProductImage';
import { ProductConfigurator } from '../components/product/ProductConfigurator';
import { PremiumButton } from '../components/ui/PremiumButton';
import type { Product, ProductVariant } from '../types';
import { shareProduct } from '../utils/shareProduct';

interface ProductDetailsPageProps {
  productId: string | null;
  products: Product[];
  onNavigate: (tab: string) => void;
  onNavigateToProduct: (productId: string) => void;
  onAddToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
  onOpenCart: () => void;
}

export function ProductDetailsPage({ productId, products, onNavigate, onNavigateToProduct, onAddToCart, onOpenCart }: ProductDetailsPageProps) {
  const product = products.find((item) => item.id === productId);
  const [selectedVariantId, setSelectedVariantId] = useState<string>();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [cartError, setCartError] = useState('');
  const [shareNotice, setShareNotice] = useState('');
  const reduceMotion = useReducedMotion();

  if (!product) {
    return (
      <section className="menu-empty">
        <Flame size={32} aria-hidden="true" />
        <h1>لم يتم العثور على الصنف</h1>
        <PremiumButton variant="dark" onClick={() => onNavigate('menu')}>العودة إلى المنيو</PremiumButton>
      </section>
    );
  }

  const variant = product.variants.find((item) => item.id === selectedVariantId)
    ?? product.variants.find((item) => item.isDefault)
    ?? product.variants[0]
    ?? { id: 'default', name: 'حجم واحد', price: product.basePrice };
  const limit = quantityLimit(variant);
  const currentQuantity = Math.min(quantity, limit);
  const related = products.filter((item) => item.id !== product.id && (item.category === product.category || item.featured)).slice(0, 3);
  const inStock = product.isAvailable && product.variants.length > 0;

  function selectVariant(item: ProductVariant) {
    setSelectedVariantId(item.id);
    setQuantity((value) => Math.min(value, quantityLimit(item)));
    setAdded(false);
    setCartError('');
  }

  function updateQuantity(nextQuantity: number) {
    setQuantity(Math.max(1, Math.min(limit, nextQuantity)));
    setAdded(false);
    setCartError('');
  }

  function addToCart() {
    if (!product || !inStock) return;
    try {
      onAddToCart(product, variant, currentQuantity);
      setCartError('');
      setAdded(true);
    } catch (error) {
      setAdded(false);
      setCartError(error instanceof Error ? error.message : 'تعذر الإضافة');
    }
  }

  return (
    <div className="product-detail-page">
      <div className="brand-container">
        <div className="detail-toolbar">
          <button type="button" className="brand-text-link ink" onClick={() => onNavigate('menu')}>
            <ArrowRight size={16} aria-hidden="true" /> العودة للمنيو
          </button>
          <button type="button" className="detail-share" onClick={async () => {
            setShareNotice('');
            setShareNotice(await shareProduct(product.name, product.id));
          }}><Share2 size={16} aria-hidden="true" /> مشاركة</button>
        </div>
        <p role="status" className="catalog-share-status">{shareNotice}</p>
        <div className="detail-layout">
          <div className="detail-intro">
            <p className="detail-availability" data-available={inStock}>
              {!product.isAvailable ? 'غير متوفر مؤقتاً' : inStock ? 'متوفر الآن' : 'لا توجد خيارات متاحة'}
            </p>
            <h1>{product.name}</h1>
            {product.description && <p className="detail-description">{product.description}</p>}
          </div>
          <motion.div className="detail-photo" initial={reduceMotion ? false : { opacity: 0.85 }}
            animate={{ opacity: 1 }} transition={{ duration: reduceMotion ? 0 : 0.26 }}>
            <ProductImage src={product.image} name={product.name} eager sizes="(max-width: 800px) calc(100vw - 40px), 44vw" />
            {product.featured && <span className="detail-selection">اختيارنا</span>}
          </motion.div>
          <div className="detail-purchase">
            <ProductConfigurator product={product} variant={variant} quantity={currentQuantity}
              justAdded={added} cartError={cartError} onVariant={selectVariant} onQuantity={updateQuantity}
              onAdd={addToCart} onOpenCart={onOpenCart} />
            <section className="detail-reviews">
              <h2>تجارب من الفرع</h2>
              <p>اقرأ التقييمات المعتمدة أو شارك تجربتك ليتم مراجعتها.</p>
              <button type="button" className="brand-text-link ink" onClick={() => onNavigate('reviews')}>
                التقييمات ومشاركة تجربة <ArrowLeft size={16} aria-hidden="true" />
              </button>
            </section>
          </div>
        </div>
        {related.length > 0 && (
          <section className="detail-related">
            <header className="editorial-heading">
              <h2>نكهات من نفس النار</h2>
              <button type="button" className="brand-text-link ink" onClick={() => onNavigate('menu')}>كل المنيو <ArrowLeft size={16} aria-hidden="true" /></button>
            </header>
            <div className="signature-products">
              {related.map((item) => <ProductCard key={item.id} product={item} onOpenDetails={onNavigateToProduct} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
