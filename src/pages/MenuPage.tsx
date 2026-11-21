import { useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, Flame, Search, X } from 'lucide-react';
import type { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ProductImage } from '../components/ProductImage';
import { PremiumButton } from '../components/ui/PremiumButton';
import { MAIN_MENU_IMAGES } from '../data/brandImages';

export interface MenuFilters {
  category: string;
  query: string;
}

interface MenuPageProps {
  products: Product[];
  catalogNotice: ReactNode;
  savedFilters: MenuFilters;
  onFiltersChange: (filters: MenuFilters) => void;
  onNavigate: (tab: string) => void;
  onOpenDeliverySurvey: () => void;
  onNavigateToProduct: (productId: string) => void;
}

const categoryNames: Record<string, string> = {
  charcoal: 'على الفحم',
  nutella: 'الشوكولاتة',
  nawashef: 'النواشف',
  other: 'أصناف أخرى',
  offers: 'عروض',
  oriental: 'حلويات شرقية',
  beverages: 'مشروبات',
};

function searchText(text: string) {
  return text.toLowerCase().replace(/[\u064B-\u065F\u0670ـ]/g, '').replace(/[أإآٱ]/g, 'ا');
}

export function MenuPage({ products, catalogNotice, savedFilters, onFiltersChange, onNavigate, onOpenDeliverySurvey, onNavigateToProduct }: MenuPageProps) {
  const [filters, setFilters] = useState(savedFilters);
  const searchInput = useRef<HTMLInputElement>(null);
  const resultsHeading = useRef<HTMLHeadingElement>(null);
  const reduceMotion = useReducedMotion();
  const layoutId = useId();
  const catalog = useMemo(() => {
    const counts = new Map<string, number>();
    const entries = products.map((product) => {
      counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
      return { product, text: searchText(product.name + ' ' + (product.description ?? '')) };
    });
    return { entries, counts };
  }, [products]);
  const activeCategory = catalog.counts.has(filters.category) ? filters.category : 'all';
  const query = searchText(filters.query.trim());
  const results = useMemo(() => catalog.entries.filter(({ product, text }) =>
    (activeCategory === 'all' || product.category === activeCategory) && text.includes(query)
  ), [activeCategory, catalog, query]);

  function updateFilters(next: MenuFilters) {
    setFilters(next);
    onFiltersChange(next);
  }

  function clearSearch() {
    updateFilters({ ...filters, query: '' });
    searchInput.current?.focus();
  }

  return (
    <div className="menu-editorial">
      <header className="menu-cover">
        <div className="menu-cover-copy">
          <h1>كل مزاج،<br /><em>إله لقمة.</em></h1>
          <p>من الكنافة النابلسية للإسطنبولية.<br />اختار اللي بتحبه، حدّد حجمه، واستلمه من الفرع.</p>
          <span className="menu-cover-note"><Flame size={15} aria-hidden="true" /> من قلب نابلس، على جمر الفحم.</span>
        </div>
        <div className="menu-cover-photo">
          <ProductImage src={MAIN_MENU_IMAGES.pistachioBaklava} name="مختارات من حلويات الفستق" editorial eager sizes="(max-width: 700px) 100vw, 50vw" />
        </div>
      </header>
      <div className="brand-container">
        <div className="menu-tools">
          <LayoutGroup id={layoutId}>
          <motion.nav layoutScroll className="menu-categories" aria-label="تصنيفات المنيو">
            {['all', ...catalog.counts.keys()].map((id) => (
              <motion.button key={id} type="button" aria-pressed={activeCategory === id}
                whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                onClick={() => updateFilters({ ...filters, category: id })}>
                {activeCategory === id && (
                  <motion.span aria-hidden="true" className="menu-category-active"
                    layoutId={reduceMotion ? undefined : 'active-category'}
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
                )}
                <span>{id === 'all' ? 'كل المنيو' : categoryNames[id] || id}</span>
                <span className="menu-category-count">{id === 'all' ? products.length : catalog.counts.get(id)}</span>
              </motion.button>
            ))}
          </motion.nav>
          </LayoutGroup>
          <div className="menu-search" role="search" aria-label="المنيو">
            <Search size={17} aria-hidden="true" />
            <input ref={searchInput} type="search" aria-label="ابحث في المنيو" value={filters.query}
              onChange={(event) => updateFilters({ ...filters, query: event.target.value })}
              placeholder="شو مشتهي اليوم؟" />
            {filters.query && (
              <button type="button" aria-label="مسح البحث" onClick={clearSearch}><X size={16} aria-hidden="true" /></button>
            )}
          </div>
        </div>
        <div className="menu-results-heading">
          <div>
            <h2 ref={resultsHeading} tabIndex={-1}>{activeCategory === 'all' ? 'كل المنيو' : categoryNames[activeCategory] || activeCategory}</h2>
            <p role="status" aria-atomic="true">عدد الأصناف المعروضة <bdi>{results.length}</bdi></p>
          </div>
          <button type="button" onClick={() => onNavigate('genius')}>محتار للَمّة؟ خليها على <bdi lang="en">Genius</bdi> <ArrowLeft size={16} aria-hidden="true" /></button>
        </div>
        {catalogNotice}
        <div className="menu-products">
          <AnimatePresence initial={false} mode="popLayout">
            {results.map(({ product }) => (
              <motion.div key={product.id} className="menu-product" layout={reduceMotion ? false : 'position'}
                initial={{ opacity: 0.65 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={reduceMotion ? { duration: 0 } : { opacity: { duration: 0.16 }, layout: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}>
                <ProductCard product={product} onOpenDetails={onNavigateToProduct} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {!results.length && !catalogNotice && (
          <div className="menu-empty">
            <Search size={32} strokeWidth={1} aria-hidden="true" />
            <h2>لسه في طعم بستناك.</h2>
            <p>ما لقينا صنف مطابق. جرّب كلمة ثانية أو اكتشف كل المنيو.</p>
            <PremiumButton variant="dark" onClick={() => {
              updateFilters({ category: 'all', query: '' });
              resultsHeading.current?.focus();
            }}>اعرض كل الأصناف</PremiumButton>
          </div>
        )}
        <aside className="menu-pickup">
          <div><h2>اطلبها. وتعال خدها دافية.</h2><p>الطلبات حالياً للاستلام من رافدية. حاب يصلك الطلب لمنطقتك؟ سجل اهتمامك.</p></div>
          <button type="button" className="brand-text-link ink" onClick={onOpenDeliverySurvey}>سجل اهتمامك بالتوصيل <ArrowLeft size={18} aria-hidden="true" /></button>
        </aside>
      </div>
    </div>
  );
}
