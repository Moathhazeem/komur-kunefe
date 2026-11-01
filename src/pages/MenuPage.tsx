import { useId, useMemo, useState } from 'react';
import { ArrowLeft, Flame, Search, X } from 'lucide-react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react';
import type { Product, ProductVariant } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ProductImage } from '../components/ProductImage';
import { PremiumButton } from '../components/ui/PremiumButton';
import { cinematicEase } from '../components/motion/Reveal';
import { MAIN_MENU_IMAGES } from '../data/brandImages';

interface MenuPageProps {
  products: Product[];
  onNavigate: (tab: string) => void;
  onAddToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
  onOpenDeliverySurvey: () => void;
  onNavigateToProduct: (productId: string) => void;
}
const categoryNames: Record<string, string> = { charcoal: 'على الفحم', nutella: 'الشوكولاتة', nawashef: 'النواشف', other: 'أصناف أخرى', offers: 'عروض', oriental: 'حلويات شرقية', beverages: 'مشروبات' };

export function MenuPage({ products, onNavigate, onOpenDeliverySurvey, onNavigateToProduct }: MenuPageProps) {
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const reduced = useReducedMotion();
  const layoutId = useId();
  const categories = useMemo(() => ['all', ...new Set(products.map(p => p.category))], [products]);
  const results = useMemo(() => products.filter(p => (category === 'all' || p.category === category) &&
    (!query.trim() || (p.name + ' ' + p.description).toLowerCase().includes(query.trim().toLowerCase()))), [products, category, query]);
  return <div className="menu-editorial">
    <header className="menu-cover">
      <motion.div className="menu-cover-copy" initial={reduced ? false : { opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .65, ease: cinematicEase }}>
        <span className="section-kicker light">KÖMÜR / المنيو</span>
        <h1>كل مزاج،<br /><em>إله لقمة.</em></h1>
        <p>من الكنافة النابلسية للإسطنبولية.<br />اختار اللي بتحبه، حدّد حجمه، واستلمه من الفرع.</p>
        <span className="menu-cover-note"><Flame size={15} /> من قلب نابلس، على جمر الفحم.</span>
      </motion.div>
      <motion.div className="menu-cover-photo" initial={reduced ? false : { opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: reduced ? 0 : .85, ease: cinematicEase }}>
        <ProductImage src={MAIN_MENU_IMAGES.pistachioBaklava} name="مختارات من حلويات الفستق" editorial eager />
      </motion.div>
    </header>
    <div className="brand-container">
      <div className="menu-tools">
        <LayoutGroup id={layoutId}>
          <nav className="menu-categories" aria-label="تصنيفات المنيو">
            {categories.map(id => <motion.button key={id} type="button" aria-pressed={category === id} onClick={() => setCategory(id)} whileTap={reduced ? undefined : { scale: .96 }}>
              {category === id && <motion.span className="menu-category-active" layoutId="active-category" transition={{ type: 'spring', stiffness: reduced ? 1000 : 400, damping: reduced ? 100 : 32, duration: reduced ? 0 : undefined }} />}
              <span>{id === 'all' ? 'كل المنيو' : categoryNames[id] || id}</span>
              <span className="menu-category-count">{id === 'all' ? products.length : products.filter(p => p.category === id).length}</span>
            </motion.button>)}
          </nav>
        </LayoutGroup>
        <div className="menu-search">
          <Search size={17} />
          <input aria-label="ابحث في المنيو" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="شو مشتهي اليوم؟" />
          {query && <button type="button" aria-label="مسح البحث" onClick={() => setQuery('')}><X size={16} /></button>}
        </div>
      </div>
      <div className="menu-results-heading"><span role="status">{results.length} أصناف للاكتشاف</span><button type="button" onClick={() => onNavigate('genius')}>محتار للَمّة؟ خليها على Genius <ArrowLeft size={16} /></button></div>
      <motion.div layout className="menu-products" transition={{ duration: reduced ? 0 : .35 }}>
        <AnimatePresence mode="popLayout" initial={false}>
          {results.map((product, index) => <motion.div layout="position" key={product.id} className="menu-product-slot"
            initial={reduced ? false : { opacity: 0, scale: .97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: reduced ? 1 : .96 }}
            transition={{ duration: reduced ? 0 : .3, ease: cinematicEase }}>
            <ProductCard product={product} revealDelay={Math.min(index * 55, 180)} onOpenDetails={p => onNavigateToProduct(p.id)} />
          </motion.div>)}
        </AnimatePresence>
      </motion.div>
      {!results.length && <motion.div className="menu-empty" initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Search size={32} strokeWidth={1} /><h2>لسه في طعم بستناك.</h2>
        <p>ما لقينا صنف مطابق. جرّب كلمة ثانية أو اكتشف كل المنيو.</p>
        <PremiumButton variant="dark" onClick={() => { setCategory('all'); setQuery(''); }}>اعرض كل الأصناف</PremiumButton>
      </motion.div>}
      <aside className="menu-pickup"><div><span className="section-kicker">من الفرع، ليدك.</span><h2>اطلبها. وتعال خدها دافية.</h2><p>الطلبات حالياً للاستلام من رافدية. حاب يصلك الطلب لمنطقتك؟ سجل اهتمامك.</p></div><button className="brand-text-link ink" type="button" onClick={onOpenDeliverySurvey}>سجل اهتمامك بالتوصيل <ArrowLeft size={18} /></button></aside>
    </div>
  </div>;
}
