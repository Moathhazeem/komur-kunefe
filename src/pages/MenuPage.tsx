import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'motion/react';
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

export function normalizeMenuSearch(text: string) {
  return text.normalize('NFKC').toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[\u0623\u0625\u0622\u0671]/g, '\u0627')
    .trim();
}

/** Keeps each actual product image; a deliberately circular crop avoids rectangular photos on the stage. */
function MenuPhoto({ product, priority = false }: { product: Product; priority?: boolean }) {
  const [failed, setFailed] = useState<string | null>(null);
  const available = Boolean(product.image) && failed !== product.image;

  if (!available) {
    return <span className="km2-menu__image-fallback" role="img" aria-label={product.name}>{product.name}</span>;
  }

  return (
    <img
      src={product.image}
      srcSet={productImageSources(product.image)}
      sizes={priority ? '(min-width: 1050px) 440px, (min-width: 780px) 350px, 78vw' : '105px'}
      alt={priority ? product.name : ''}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(product.image)}
    />
  );
}

const productVariants = {
  enter: (direction: number) => ({
    opacity: 0, x: direction * 115, y: 14, scale: 0.74,
    rotateY: direction * -38, rotateZ: direction * -8, filter: 'blur(10px)',
  }),
  center: {
    opacity: 1, x: 0, y: 0, scale: 1,
    rotateY: 0, rotateZ: 0, filter: 'blur(0px)',
  },
  exit: (direction: number) => ({
    opacity: 0, x: direction * -100, y: -8, scale: 0.78,
    rotateY: direction * 32, rotateZ: direction * 7, filter: 'blur(9px)',
  }),
};

export function MenuPage({
  products,
  filters,
  onFilterChange,
  onOpenDeliverySurvey,
  onNavigateToProduct,
}: MenuPageProps) {
  const reducedMotion = useReducedMotion();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);
  const railRef = useRef<HTMLDivElement>(null);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const springX = useSpring(tiltX, { stiffness: 110, damping: 24, mass: 0.8 });
  const springY = useSpring(tiltY, { stiffness: 110, damping: 24, mass: 0.8 });

  const categories = useMemo(() => [...new Set(products.map(item => item.category))], [products]);
  const category = filters.category === 'all' || categories.includes(filters.category as Product['category'])
    ? filters.category : 'all';
  const catalog = useMemo(() => products.map(product => ({
    product,
    search: normalizeMenuSearch(product.name + ' ' + (product.description || '')),
  })), [products]);
  const normalizedQuery = normalizeMenuSearch(filters.query);
  const results = useMemo(() => catalog.filter(({ product, search }) =>
    (category === 'all' || product.category === category) && search.includes(normalizedQuery)
  ).map(({ product }) => product), [catalog, category, normalizedQuery]);

  const foundIndex = results.findIndex(product => product.id === selectedId);
  const activeIndex = foundIndex >= 0 ? foundIndex : 0;
  const selected = results[activeIndex];
  const previous = results.length > 1 ? results[(activeIndex + results.length - 1) % results.length] : null;
  const next = results.length > 1 ? results[(activeIndex + 1) % results.length] : null;
  const prices = selected?.variants.map(variant => variant.price).filter(Number.isFinite) ?? [];
  const startingPrice = selected ? (prices.length ? Math.min(...prices) : selected.basePrice) : 0;

  function selectProduct(index: number) {
    if (!results.length) return;
    const target = (index + results.length) % results.length;
    if (target === activeIndex) return;
    setDirection(index < activeIndex ? -1 : 1);
    setSelectedId(results[target].id);
  }

  function move(step: number) {
    if (results.length < 2) return;
    setDirection(step > 0 ? 1 : -1);
    setSelectedId(results[(activeIndex + step + results.length) % results.length].id);
  }

  function handleThumbKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let target: number;
    if (event.key === 'ArrowLeft') target = (index + 1) % results.length;
    else if (event.key === 'ArrowRight') target = (index + results.length - 1) % results.length;
    else if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = results.length - 1;
    else return;
    event.preventDefault();
    selectProduct(target);
    railRef.current?.querySelectorAll<HTMLButtonElement>('.km2-menu__thumb')[target]?.focus({ preventScroll: true });
  }

  useEffect(() => {
    tiltX.set(0);
    tiltY.set(0);
    // Only scroll the selection rail after deliberate selection, not on first page load.
    if (!selectedId) return;
    railRef.current?.querySelector<HTMLElement>('[aria-pressed="true"]')?.scrollIntoView({
      block: 'nearest', inline: 'center', behavior: reducedMotion ? 'instant' : 'smooth',
    });
  }, [selectedId, selected?.id, reducedMotion, tiltX, tiltY]);

  const positionLabel = selected ? String(activeIndex + 1).padStart(2, '0') : '00';
  const totalLabel = String(results.length).padStart(2, '0');

  return (
    <section className="km2-menu" dir="rtl" data-category={selected?.category} aria-labelledby="km2-menu-title">
      <div className="km2-menu__container">
        <header className="km2-menu__masthead">
          <div>
            <span className="km2-menu__eyebrow" lang="en" dir="ltr">KÖMÜR / THE SIGNATURE MENU</span>
            <h1 id="km2-menu-title">اختار لقمتك.</h1>
            <p className="km2-menu__intro">استكشف الأصناف واختار الحجم اللي بناسبك.</p>
          </div>
          <div className="km2-menu__search">
            <Search size={18} aria-hidden="true" />
            <input
              type="search" value={filters.query}
              aria-label="ابحث عن صنف في المنيو" placeholder="شو عبالك اليوم؟"
              onChange={event => onFilterChange({ ...filters, query: event.target.value })}
            />
            {filters.query && <button type="button" aria-label="مسح البحث" onClick={() => onFilterChange({ ...filters, query: '' })}><X size={17} /></button>}
          </div>
        </header>

        <nav className="km2-menu__categories" aria-label="تصنيفات المنيو">
          {['all', ...categories].map(id => (
            <button
              key={id} type="button" className="km2-menu__category"
              aria-pressed={category === id}
              onClick={() => { setSelectedId(null); onFilterChange({ ...filters, category: id }); }}
            >
              {id === 'all' ? 'كل الأصناف' : categoryNames[id] || id}
            </button>
          ))}
        </nav>

        <div className="km2-menu__scene">
          {selected ? (
            <>
              <div className="km2-menu__grid">
                <div className="km2-menu__story" aria-live="polite" aria-atomic="true">
                  <span className="km2-menu__index">{categoryNames[selected.category] || 'من المنيو'} <bdi dir="ltr">/ {positionLabel}</bdi></span>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div key={selected.id}
                      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }} exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -17 }}
                      transition={{ duration: reducedMotion ? 0 : 0.34, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <h2>{selected.name}</h2>
                      {selected.description?.trim() ? <p>{selected.description}</p> : null}
                      <div className="km2-menu__pricing">
                        <span className="km2-menu__pricing-label">يبدأ من</span>
                        <strong className="km2-menu__pricing-number"><bdi>{startingPrice}</bdi><small>₪</small></strong>
                      </div>
                      <div className="km2-menu__cta-row">
                        <button type="button" className="km2-menu__cta"
                          disabled={!selected.isAvailable} onClick={() => onNavigateToProduct(selected.id)}>
                          <span>{selected.isAvailable ? 'اختيار الحجم والطلب' : 'غير متوفر حاليًا'}</span>
                          <ArrowLeft size={19} aria-hidden="true" />
                        </button>
                        {!selected.isAvailable && <span className="km2-menu__unavailable">يمكنك اختيار صنف آخر</span>}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="km2-menu__visual" onPointerMove={event => {
                  if (reducedMotion || event.pointerType !== 'mouse') return;
                  const rect = event.currentTarget.getBoundingClientRect();
                  tiltY.set(((event.clientX - rect.left) / rect.width - 0.5) * 7);
                  tiltX.set(-((event.clientY - rect.top) / rect.height - 0.5) * 5);
                }} onPointerLeave={() => { tiltX.set(0); tiltY.set(0); }}>
                  <div className="km2-menu__arch" aria-hidden="true" />
                  <div className="km2-menu__light" aria-hidden="true" />
                  <div className="km2-menu__orbit" aria-hidden="true" />
                  <div className="km2-menu__floor-shadow" aria-hidden="true" />
                  <span className="km2-menu__count-mark" aria-hidden="true" dir="ltr">{positionLabel}</span>
                  <motion.div className="km2-menu__motion-plane" style={{
                    rotateX: reducedMotion ? 0 : springX,
                    rotateY: reducedMotion ? 0 : springY,
                  }}>
                    <AnimatePresence initial={false} custom={direction}>
                      <motion.figure
                        key={selected.id} className="km2-menu__dish"
                        custom={direction} variants={productVariants}
                        initial={reducedMotion ? { opacity: 0 } : 'enter'}
                        animate="center"
                        exit={reducedMotion ? { opacity: 0 } : 'exit'}
                        transition={{ duration: reducedMotion ? 0 : .68, ease: [.2, .85, .22, 1] }}
                      >
                        <div className="km2-menu__photo"><MenuPhoto product={selected} priority /></div>
                      </motion.figure>
                    </AnimatePresence>
                  </motion.div>
                  {selected.imageCredit && (
                    <div className="km2-menu__image-credit">
                      {selected.imageCreditUrl ? (
                        <a href={selected.imageCreditUrl} target="_blank" rel="noopener noreferrer">{selected.imageCredit}</a>
                      ) : selected.imageCredit}
                    </div>
                  )}
                </div>
              </div>

              <div className="km2-menu__rail-area">
                <div className="km2-menu__rail-heading">
                  <div>
                    <strong>اكتشف الأصناف</strong>
                    <small aria-live="polite"> <bdi dir="ltr">{positionLabel} / {totalLabel}</bdi></small>
                  </div>
                  <div className="km2-menu__rail-controls">
                    <button type="button" aria-label="الصنف السابق" onClick={() => move(-1)} disabled={!previous}><ChevronRight size={19}/></button>
                    <button type="button" aria-label="الصنف التالي" onClick={() => move(1)} disabled={!next}><ChevronLeft size={19}/></button>
                  </div>
                </div>
                <div className="km2-menu__rail" ref={railRef} role="group" aria-label="اختر صنفًا من المنيو">
                  {results.map((product, index) => (
                    <button
                      className="km2-menu__thumb" key={product.id}
                      type="button" aria-pressed={selected.id === product.id}
                      aria-label={'عرض ' + product.name}
                      onClick={() => selectProduct(index)}
                      onKeyDown={event => handleThumbKey(event, index)}
                    >
                      <span className="km2-menu__thumb-image"><MenuPhoto product={product}/></span>
                      <span className="km2-menu__thumb-name">{product.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="km2-menu__empty" role="status">
              <h2>ما لقينا الصنف</h2>
              <p>جرّب كلمة ثانية أو اعرض كل الأصناف.</p>
              <button type="button" className="km2-menu__cta" onClick={() => { setSelectedId(null); onFilterChange({ category: 'all', query: '' }); }}>عرض كل الأصناف <ArrowLeft size={18}/></button>
            </div>
          )}
        </div>

        <div className="km2-menu__service">
          <span>الاستلام من فرع رافيديا — اطلب من الموقع واستلم من الفرع.</span>
          <button type="button" onClick={onOpenDeliverySurvey}>سجّل اهتمامك بالتوصيل <ArrowLeft size={16} aria-hidden="true"/></button>
        </div>
      </div>
    </section>
  );
}
