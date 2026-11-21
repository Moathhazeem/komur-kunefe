import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type TouchEvent } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { ArrowLeft, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import type { Product, ProductVariant } from '../types';
import { productImageSources } from '../utils/productImage';
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
  charcoal: 'على الفحم',
  nutella: 'الشوكولاتة',
  nawashef: 'نواشف',
  oriental: 'حلويات شرقية',
  beverages: 'مشروبات',
  other: 'أصناف أخرى',
  offers: 'عروض',
};

const SIGNATURE_ART = '/media/kunafa-pistachio-hero.webp';

export function normalizeMenuSearch(value: string) {
  return value.normalize('NFKC').toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[\u0623\u0625\u0622\u0671]/g, '\u0627')
    .trim();
}

function isSignatureProduct(product: Product) {
  const name = normalizeMenuSearch(product.name);
  return product.category === 'charcoal' &&
    name.includes('اسطنبول') && name.includes('بالفستق الناعم');
}

/** This is a themed illustration for the matching kunafa only, never reused for other products. */
function ProductVisual({ product, mode }: { product: Product; mode: 'hero' | 'thumbnail' }) {
  const [failed, setFailed] = useState('');
  const signature = isSignatureProduct(product) && mode === 'hero';
  const src = signature ? SIGNATURE_ART : product.image;
  const usable = !!src && failed !== src;

  return usable ? (
    <img
      src={src}
      srcSet={signature ? undefined : productImageSources(src)}
      sizes={mode === 'hero' ? '(min-width: 900px) 700px, 88vw' : '100px'}
      alt={mode === 'hero' ? product.name : ''}
      loading={mode === 'hero' ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(src)}
    />
  ) : <span className="km3-product-fallback" role="img" aria-label={product.name}>{product.name}</span>;
}

const sceneMotion = {
  enter: (dir: number) => ({
    opacity: 0, x: dir * 145, y: 44, scale: .86,
    rotateY: dir * -19, filter: 'blur(8px)',
  }),
  center: { opacity: 1, x: 0, y: 0, scale: 1, rotateY: 0, filter: 'blur(0px)' },
  exit: (dir: number) => ({
    opacity: 0, x: dir * -125, y: -20, scale: .88,
    rotateY: dir * 18, filter: 'blur(7px)',
  }),
};

export function MenuPage({ products, filters, onFilterChange, onNavigateToProduct, onOpenDeliverySurvey }: MenuPageProps) {
  const reduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);
  const [searchOpen, setSearchOpen] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const touchStart = useRef<number | null>(null);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const springX = useSpring(tiltX, { stiffness: 110, damping: 28 });
  const springY = useSpring(tiltY, { stiffness: 110, damping: 28 });

  const categories = useMemo(() => [...new Set(products.map(product => product.category))], [products]);
  const category = filters.category === 'all' || categories.includes(filters.category as Product['category'])
    ? filters.category : 'all';
  const catalog = useMemo(() => products.map(product => ({
    product,
    search: normalizeMenuSearch(`${product.name} ${product.description ?? ''}`),
  })), [products]);
  const searchTerm = normalizeMenuSearch(filters.query);
  const results = useMemo(() => catalog.filter(({ product, search }) =>
    (category === 'all' || product.category === category) && search.includes(searchTerm)
  ).map(({ product }) => product), [catalog, category, searchTerm]);

  const selectedIndex = results.findIndex(product => product.id === activeId);
  const activeIndex = selectedIndex < 0 ? 0 : selectedIndex;
  const selected = results[activeIndex];
  const position = String(activeIndex + 1).padStart(2, '0');
  const total = String(results.length).padStart(2, '0');
  const variantPrices = selected?.variants.map(v => v.price).filter(Number.isFinite) ?? [];
  const startingPrice = selected ? (variantPrices.length ? Math.min(...variantPrices) : selected.basePrice) : 0;

  function choose(index: number) {
    if (!results.length) return;
    const next = (index + results.length) % results.length;
    if (next === activeIndex) return;
    setDirection(index < activeIndex ? -1 : 1);
    setActiveId(results[next].id);
  }

  function move(step: number) {
    if (results.length <= 1) return;
    setDirection(step);
    setActiveId(results[(activeIndex + step + results.length) % results.length].id);
  }

  function handleRailKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    if (event.key === 'ArrowLeft') next = (index + 1) % results.length;
    else if (event.key === 'ArrowRight') next = (index - 1 + results.length) % results.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = results.length - 1;
    else return;
    event.preventDefault();
    choose(next);
    railRef.current?.querySelectorAll<HTMLButtonElement>('.km3-rail__item')[next]?.focus({ preventScroll: true });
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStart.current;
    touchStart.current = null;
    if (start === null) return;
    const delta = event.changedTouches[0]?.clientX - start;
    if (Math.abs(delta) >= 65) move(delta > 0 ? 1 : -1);
  }

  useEffect(() => {
    tiltX.set(0);
    tiltY.set(0);
    if (!activeId) return;
    railRef.current?.querySelector<HTMLElement>('[aria-pressed="true"]')?.scrollIntoView({
      block: 'nearest', inline: 'center', behavior: reduceMotion ? 'instant' : 'smooth',
    });
  }, [activeId, selected?.id, reduceMotion, tiltX, tiltY]);

  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);

  return (
    <section className="km3-menu" dir="rtl" aria-labelledby="km3-title" data-category={selected?.category}>
      <div className="km3-cinema">
        <div className="km3-cinema__texture" aria-hidden="true" />
        <div className="km3-top">
          <div className="km3-top__identity">
            <span className="km3-top__line" />
            <span className="km3-top__wordmark" lang="tr" dir="ltr">KÖMÜR KÜNEFE</span>
            <span className="km3-top__subtitle" lang="en" dir="ltr">THE SIGNATURE ATELIER</span>
          </div>
          <button type="button" className="km3-top__search-trigger" onClick={() => setSearchOpen(value => !value)}
            aria-label={searchOpen ? 'إغلاق البحث' : 'البحث عن صنف'} aria-expanded={searchOpen}>
            {searchOpen ? <X size={22} /> : <Search size={22} />}
          </button>
        </div>

        <div className="km3-menu__layout">
          <div className="km3-menu__copy">
            <p className="km3-menu__eyebrow" lang="en" dir="ltr">KÖMÜR / THE SIGNATURE MENU</p>
            <AnimatePresence mode="wait" initial={false}>
              {selected ? <motion.div key={selected.id} className="km3-menu__product-details"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
                transition={{ duration: reduceMotion ? 0 : .42, ease: [.22, 1, .36, 1] }}>
                <span className="km3-menu__category"><span aria-hidden="true">✦</span>{categoryNames[selected.category] || 'من المنيو'}</span>
                <h1 id="km3-title">{selected.name}</h1>
                <div className="km3-menu__flourish" aria-hidden="true"><i /><span>◇</span><i /></div>
                {selected.description?.trim() && <p className="km3-menu__description">{selected.description}</p>}
                <div className="km3-menu__purchase">
                  <button className="km3-menu__cta" type="button" disabled={!selected.isAvailable}
                    onClick={() => onNavigateToProduct(selected.id)}>
                    <span>{selected.isAvailable ? 'اختيار الحجم والطلب' : 'غير متوفر حاليًا'}</span>
                    <ArrowLeft size={21} aria-hidden="true" />
                  </button>
                  <span className="km3-menu__price"><small>يبدأ من</small><strong><bdi>{startingPrice}</bdi> <em>₪</em></strong></span>
                </div>
              </motion.div> : <div className="km3-menu__not-found"><h1 id="km3-title">ما لقينا الصنف</h1><p>جرّب كلمة ثانية أو تصفّح كل الأصناف.</p>
                <button type="button" className="km3-menu__cta" onClick={() => onFilterChange({ category: 'all', query: '' })}>عرض كل الأصناف</button>
              </div>}
            </AnimatePresence>
          </div>

          <div className="km3-menu__visual" onTouchStart={event => { touchStart.current = event.touches[0]?.clientX ?? null; }}
            onTouchEnd={handleTouchEnd}
            onPointerMove={event => {
              if (reduceMotion || event.pointerType !== 'mouse') return;
              const rect = event.currentTarget.getBoundingClientRect();
              tiltX.set(-((event.clientY - rect.top) / rect.height - .5) * 3.5);
              tiltY.set(((event.clientX - rect.left) / rect.width - .5) * 5);
            }} onPointerLeave={() => { tiltX.set(0); tiltY.set(0); }}>
            {selected && <motion.div className="km3-menu__perspective" style={{ rotateX: reduceMotion ? 0 : springX, rotateY: reduceMotion ? 0 : springY }}>
              <AnimatePresence initial={false} custom={direction}>
                <motion.figure key={selected.id} className="km3-menu__hero-figure" custom={direction}
                  variants={sceneMotion} initial={reduceMotion ? { opacity: 0 } : 'enter'} animate="center"
                  exit={reduceMotion ? { opacity: 0 } : 'exit'}
                  transition={{ duration: reduceMotion ? 0 : .76, ease: [.18, .84, .18, 1] }}>
                  <div className={isSignatureProduct(selected) ? 'km3-menu__hero-media km3-menu__hero-media--cutout' : 'km3-menu__hero-media km3-menu__hero-media--framed'}>
                    <ProductVisual product={selected} mode="hero" />
                  </div>
                </motion.figure>
              </AnimatePresence>
            </motion.div>}
            <div className="km3-menu__visual-caption" aria-hidden="true"><span>✦</span> CRAFTED WITH FIRE <span>✦</span></div>
          </div>
        </div>

        <div className="km3-menu__bottom">
          {searchOpen && <div className="km3-menu__search">
            <Search size={18} aria-hidden="true" />
            <input ref={searchRef} type="search" value={filters.query} placeholder="ابحث عن صنفك المفضل..."
              aria-label="البحث في المنيو" onChange={event => onFilterChange({ ...filters, query: event.target.value })} />
            {filters.query && <button type="button" aria-label="مسح البحث" onClick={() => onFilterChange({ ...filters, query: '' })}><X size={18} /></button>}
          </div>}
          <nav className="km3-categories" aria-label="تصنيفات المنيو">
            {['all', ...categories].map(item => <button type="button" key={item}
              aria-pressed={category === item}
              onClick={() => { setActiveId(null); onFilterChange({ ...filters, category: item }); }}>
              {item === 'all' ? 'كل الأصناف' : categoryNames[item] || item}
            </button>)}
          </nav>
          {selected && <>
            <div className="km3-rail__meta">
              <span>اكتشف الأصناف <small dir="ltr">{position} / {total}</small></span>
              <div className="km3-rail__arrows">
                <button type="button" aria-label="الصنف السابق" disabled={results.length <= 1} onClick={() => move(-1)}><ChevronRight size={20} /></button>
                <button type="button" aria-label="الصنف التالي" disabled={results.length <= 1} onClick={() => move(1)}><ChevronLeft size={20} /></button>
              </div>
            </div>
            <div className="km3-rail" role="group" aria-label="اختيار الصنف" ref={railRef}>
              {results.map((product, index) => <button type="button" key={product.id}
                className="km3-rail__item" aria-pressed={selected.id === product.id}
                aria-label={'عرض ' + product.name}
                onClick={() => choose(index)} onKeyDown={event => handleRailKey(event, index)}>
                <span className="km3-rail__image"><ProductVisual product={product} mode="thumbnail" /></span>
                <span className="km3-rail__name">{product.name}</span>
              </button>)}
            </div>
          </>}
          <div className="km3-menu__footnote">
            <span>الاستلام من فرع رافيديا</span>
            <button type="button" onClick={onOpenDeliverySurvey}>سجّل اهتمامك بالتوصيل <ArrowLeft size={16} /></button>
          </div>
        </div>
      </div>
    </section>
  );
}
