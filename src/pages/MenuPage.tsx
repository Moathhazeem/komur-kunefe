import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { ArrowLeft, Search, X } from 'lucide-react';
import type { Product, ProductVariant } from '../types';
import { ShowcaseMedia } from '../components/ShowcaseMedia';
import './menu-showcase.css';

interface MenuPageProps {
  products: Product[];
  filters: { category: string; query: string };
  onFilterChange: (filters: { category: string; query: string }) => void;
  onAddToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
  onOpenDeliverySurvey: () => void;
  onNavigateToProduct: (productId: string) => void;
}

const categoryNames: Record<string, string> = {
  charcoal: 'على الفحم', nutella: 'الشوكولاتة', nawashef: 'نواشف', oriental: 'حلويات شرقية',
  beverages: 'مشروبات', other: 'أخرى', offers: 'عروض',
};

export function normalizeMenuSearch(text: string) {
  return text.normalize('NFKC').toLowerCase().replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[\u0623\u0625\u0622\u0671]/g, '\u0627').trim();
}

export function MenuPage({ products, filters, onFilterChange, onOpenDeliverySurvey, onNavigateToProduct }: MenuPageProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selector = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(tiltX, { stiffness: 140, damping: 25 });
  const rotateY = useSpring(tiltY, { stiffness: 140, damping: 25 });
  const categories = useMemo(() => [...new Set(products.map(product => product.category))], [products]);
  const activeCategory = categories.includes(filters.category as Product['category']) ? filters.category : 'all';
  const catalog = useMemo(() => products.map(product => ({
    product, search: normalizeMenuSearch(product.name + ' ' + (product.description ?? '')),
  })), [products]);
  const query = normalizeMenuSearch(filters.query);
  const results = useMemo(() => catalog.filter(({ product, search }) =>
    (activeCategory === 'all' || product.category === activeCategory) && search.includes(query)
  ).map(({ product }) => product), [catalog, query, activeCategory]);
  const selected = results.find(product => product.id === selectedId) ?? results[0];
  const price = selected && (selected.variants.length
    ? Math.min(...selected.variants.map(variant => variant.price)) : selected.basePrice);

  useEffect(() => {
    tiltX.set(0);
    tiltY.set(0);
    selector.current?.querySelector<HTMLElement>('[aria-pressed="true"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduceMotion ? 'instant' : 'smooth' });
  }, [selected?.id, reduceMotion, tiltX, tiltY]);

  function selectWithKeyboard(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const offsets: Record<string, number> = { ArrowLeft: 1, ArrowRight: -1 };
    if (!(event.key in offsets) && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? results.length - 1
      : (index + offsets[event.key] + results.length) % results.length;
    setSelectedId(results[next].id);
    selector.current?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus({ preventScroll: true });
  }

  return (
    <section className="menu-showcase" dir="rtl" aria-labelledby="menu-showcase-title" data-category={selected?.category}>
      <header className="showcase-header">
        <h1 id="menu-showcase-title">المنيو</h1>
        <div className="showcase-search">
          <Search size={18} aria-hidden="true" />
          <input type="search" aria-label="البحث في المنيو" placeholder="شو عبالك اليوم؟" value={filters.query}
            onChange={event => onFilterChange({ ...filters, query: event.target.value })} />
          {filters.query && <button type="button" aria-label="مسح البحث" onClick={() => onFilterChange({ ...filters, query: '' })}><X size={17} /></button>}
        </div>
      </header>
      <nav className="showcase-categories" aria-label="تصنيفات المنيو">
        {['all', ...categories].map(category => <button type="button" key={category}
          aria-pressed={activeCategory === category} onClick={() => onFilterChange({ ...filters, category })}>
          {category === 'all' ? 'كل الأصناف' : categoryNames[category] ?? category}
        </button>)}
      </nav>
      {selected ? <>
        <div className="showcase-main">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={selected.id} className="showcase-copy"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }} transition={{ duration: reduceMotion ? 0 : .18 }}>
              <span className="showcase-category">{categoryNames[selected.category]}</span>
              <h2>{selected.name}</h2>
              {selected.description?.trim() && <p>{selected.description}</p>}
              <div className="showcase-price"><span>يبدأ من</span><strong><bdi>{price}</bdi><small> ₪</small></strong></div>
              <button type="button" className="showcase-order" disabled={!selected.isAvailable}
                onClick={() => onNavigateToProduct(selected.id)}>{selected.isAvailable ? 'اختيار الحجم' : 'غير متاح حاليًا'}<ArrowLeft size={19} aria-hidden="true" /></button>
              {!selected.isAvailable && <button type="button" className="showcase-details" onClick={() => onNavigateToProduct(selected.id)}>تفاصيل الصنف</button>}
            </motion.div>
          </AnimatePresence>
          <div className="showcase-stage" onPointerMove={event => {
            if (reduceMotion || event.pointerType !== 'mouse') return;
            const bounds = event.currentTarget.getBoundingClientRect();
            tiltY.set(((event.clientX - bounds.left) / bounds.width - .5) * 7);
            tiltX.set(-((event.clientY - bounds.top) / bounds.height - .5) * 5);
          }} onPointerLeave={() => { tiltX.set(0); tiltY.set(0); }}>
            <div className="showcase-pedestal" aria-hidden="true" />
            <motion.div className="showcase-depth" style={{ rotateX: reduceMotion ? 0 : rotateX, rotateY: reduceMotion ? 0 : rotateY }}>
              <AnimatePresence initial={false}>
                <motion.div key={selected.id} className="showcase-image-layer"
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -28, y: 12, scale: .95, rotate: -2 }}
                  animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 28, scale: .97, rotate: 2 }}
                  transition={{ duration: reduceMotion ? 0 : .42, ease: [.22, 1, .36, 1] }}>
                  <ShowcaseMedia product={selected} hero />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
        <div className="showcase-selector-heading"><span>اختار صنفك</span><span role="status">{results.length} أصناف</span></div>
        <div ref={selector} className="showcase-selector" role="group" aria-label="اختيار الصنف">
          {results.map((product, index) => <button type="button" key={product.id} aria-pressed={selected.id === product.id}
            onClick={() => setSelectedId(product.id)} onKeyDown={event => selectWithKeyboard(event, index)}>
            <span className="showcase-thumb"><ShowcaseMedia product={product} /></span><span>{product.name}</span>
          </button>)}
        </div>
      </> : <div className="showcase-empty" role="status"><h2>ما لقينا هذا الصنف</h2><p>جرّب كلمة ثانية أو تصفّح كل الأصناف.</p>
        <button type="button" className="showcase-order" onClick={() => onFilterChange({ category: 'all', query: '' })}>كل الأصناف</button></div>}
      <footer className="showcase-footer"><p>الاستلام من فرع رافيديا</p><button type="button" onClick={onOpenDeliverySurvey}>سجّل اهتمامك بالتوصيل <ArrowLeft size={16} aria-hidden="true" /></button></footer>
    </section>
  );
}
