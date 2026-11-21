import { motion, useReducedMotion } from 'motion/react';
import { GeniusPage } from './pages/GeniusPage';
import { quantityLimit, priceInCents } from '../shared/commerce';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Product, ProductVariant, CartItem, Offer, Review, StoreSettings } from './types';
import { OFFICIAL_PRODUCTS } from './data/menuData';
import { api } from './services/api';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MobileNav } from './components/MobileNav';
import { DeliverySurveyModal } from './components/DeliverySurveyModal';

import { HomePage } from './pages/HomePage';
import { MenuPage, type MenuFilters } from './pages/MenuPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { OffersPage } from './pages/OffersPage';
import { StoryPage } from './pages/StoryPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';

type Route = { tab: string; productId: string | null };

const simpleRoutes = ['genius', 'menu', 'checkout', 'admin', 'track', 'offers', 'story', 'reviews', 'contact'];

function readRoute(): Route {
  const { pathname, hash, search } = window.location;
  const id = pathname.match(/^\/product\/([^\/?#]+)/i)?.[1]
    ?? hash.match(/^#?\/?product\/([^\/?#]+)/i)?.[1]
    ?? hash.match(/[?&]product=([^&#]+)/i)?.[1]
    ?? search.match(/[?&]product=([^&#]+)/i)?.[1];
  if (id) {
    try {
      return { tab: 'product-details', productId: decodeURIComponent(id) };
    } catch {
      return { tab: 'product-details', productId: id };
    }
  }

  const path = pathname.slice(1).toLowerCase();
  const fragment = hash.slice(1).toLowerCase();
  const tab = simpleRoutes.find((route) =>
    route === path || route === fragment || (route === 'checkout' && [path, fragment].includes('order'))
  );
  return { tab: tab ?? 'home', productId: null };
}

export default function App() {
  const reduced = useReducedMotion();
  const [{ tab: currentTab, productId: currentProductId }, setRoute] = useState(readRoute);
  const menuFilters = useRef<MenuFilters>({ category: 'all', query: '' });
  const main = useRef<HTMLElement>(null);
  const focusOnNavigate = useRef(false);

  useEffect(() => {
    if (!focusOnNavigate.current) return;
    focusOnNavigate.current = false;
    main.current?.focus({ preventScroll: true });
  }, [currentTab, currentProductId]);

  // Application data state
  const [products, setProducts] = useState<Product[]>(OFFICIAL_PRODUCTS);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [dataState, setDataState] = useState<'loading'|'ready'|'error'>('loading');
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  // Cart state persisted in localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('komur_cart');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.filter(i=>i?.product?.id && i?.variant?.id && Number.isInteger(i.quantity) && i.quantity>0 && Number.isFinite(i.variant.price)) : [];
    } catch {
      return [];
    }
  });

  // Modals
  const [isDeliverySurveyOpen, setIsDeliverySurveyOpen] = useState(false);

  useEffect(() => {
    const updateRoute = () => setRoute(readRoute());
    window.addEventListener('hashchange', updateRoute);
    window.addEventListener('popstate', updateRoute);
    return () => {
      window.removeEventListener('hashchange', updateRoute);
      window.removeEventListener('popstate', updateRoute);
    };
  }, []);

  // Save cart changes
  useEffect(() => {
    try {
      localStorage.setItem('komur_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  // Load backend data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [fetchedProducts, fetchedOffers, fetchedReviews, fetchedSettings] = await Promise.all([
        api.getProducts(),
        api.getOffers(),
        api.getReviews(false), // only approved for public
        api.getSettings(),
      ]);
      setProducts(fetchedProducts);
      setOffers(fetchedOffers);
      setReviews(fetchedReviews);
      setSettings(fetchedSettings);
      setDataState('ready');
    } catch (err) {
      setDataState('error');
      setProducts([]);
      console.error('Failed to load initial data:', err);
    }
  };

  // Cart operations
  const handleAddSelection = (selection: CartItem[]) => {
    const next = cart.map(item=>({...item}));
    for(const item of selection) {
      const product=products.find(p=>p.id===item.product.id && p.isAvailable);
      const variant=product?.variants.find(v=>v.id===item.variant.id);
      if(!product || !variant || !Number.isInteger(item.quantity) || item.quantity<1) throw new Error('تغير توفر الصنف');
      const existing=next.find(i=>i.product.id===product.id && i.variant.id===variant.id);
      const quantity=(existing?.quantity || 0)+item.quantity;
      if(quantity>quantityLimit(variant)) throw new Error('تجاوزت حد الكمية لهذا الصنف في السلة');
      const canonical={...variant,price:priceInCents(variant)/100};
      if(existing){existing.quantity=quantity;existing.variant=canonical;existing.product=product;}
      else next.push({product,variant:canonical,quantity});
    }
    setCart(next);
  };
  const handleAddToCart = (product:Product, variant:ProductVariant, quantity:number) => handleAddSelection([{product,variant,quantity}]);

  const handleUpdateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(index);
      return;
    }
    setCart((prevCart) => {
      const updated = [...prevCart];
      if(!updated[index] || !Number.isInteger(quantity) || quantity>quantityLimit(updated[index].variant)) return prevCart;
      updated[index] = {...updated[index], quantity};
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCart((prevCart) => prevCart.filter((_, i) => i !== index));
  };

  const refreshCart = async () => {
    const latest = await api.getProducts();
    setProducts(latest);
    setCart(previous => previous.flatMap(item => {
      const product=latest.find(p=>p.id===item.product.id && p.isAvailable);
      const variant=product?.variants.find(v=>v.id===item.variant.id);
      return product && variant ? [{product,variant:{...variant,price:priceInCents(variant)/100},quantity:Math.min(item.quantity,quantityLimit(variant))}] : [];
    }));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleNavigateToProduct = useCallback((productId: string) => {
    focusOnNavigate.current = true;
    setRoute({ tab: 'product-details', productId });
    window.history.pushState(null, '', '/product/' + encodeURIComponent(productId));
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleNavigate = (tab: string, search = '') => {
    focusOnNavigate.current = tab !== currentTab;
    setRoute({ tab, productId: null });
    const destination = tab === 'home' ? '/' : `/${tab}${search}#${tab}`;
    window.history.pushState(null, '', destination);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const showCatalog = currentTab === 'home' || currentTab === 'menu';
  const catalogNotice = dataState === 'ready' ? null : (
    <div className="catalog-notice">
      <p role="status">{dataState === 'loading' ? 'نحمّي الجمر… جارٍ تحميل المنيو' : 'تعذر تحميل بيانات الفرع. تحقق من الاتصال.'}</p>
      {dataState === 'error' && <button type="button" className="brand-text-link ink" onClick={loadAllData}>حاول مجدداً</button>}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FBF8F2] text-[#211814] flex flex-col font-sans selection:bg-[#C7652D] selection:text-white">

      {/* Header */}
      <Header
        settings={settings}
        cartCount={totalCartCount}
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenCart={() => handleNavigate('checkout')}
      />

      <a href="#content" className="skip-link" onClick={(event) => {
        event.preventDefault();
        main.current?.focus({ preventScroll: true });
        main.current?.scrollIntoView();
      }}>انتقل إلى المحتوى</a>
      <motion.main id="content" ref={main} tabIndex={-1} key={currentTab === 'product-details' ? `prod-${currentProductId}` : currentTab} className="flex-1"
        initial={reduced || showCatalog || currentTab === 'admin' || currentTab === 'product-details' ? false : { opacity: 0.85 }}
        animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : 0.22 }}>
        {!showCatalog && currentTab !== 'admin' && catalogNotice && <div className="brand-container">{catalogNotice}</div>}
        {currentTab === 'genius' && <GeniusPage products={products} onAdd={handleAddSelection} onOpenCart={()=>handleNavigate('checkout')} />}

        {currentTab === 'home' && (
          <HomePage
            products={products}
            offers={offers}
            reviews={reviews}
            settings={settings}
            catalogNotice={catalogNotice}
            onNavigate={handleNavigate}
            onNavigateToProduct={handleNavigateToProduct}
          />
        )}

        {currentTab === 'menu' && (
          <MenuPage
            products={products}
            catalogNotice={catalogNotice}
            savedFilters={menuFilters.current}
            onFiltersChange={(filters) => { menuFilters.current = filters; }}
            onNavigate={handleNavigate}
            onNavigateToProduct={handleNavigateToProduct}
            onOpenDeliverySurvey={() => setIsDeliverySurveyOpen(true)}
          />
        )}

        {currentTab === 'product-details' && (
          <ProductDetailsPage
            productId={currentProductId}
            products={products}
            onNavigate={handleNavigate}
            onNavigateToProduct={handleNavigateToProduct}
            onAddToCart={handleAddToCart}
            onOpenCart={() => handleNavigate('checkout')}
          />
        )}

        {currentTab === 'checkout' && (
          <CheckoutPage
            onRefreshCart={refreshCart}
            cart={cart}
            settings={settings}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'track' && (
          <OrderTrackingPage
            settings={settings}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'offers' && (
          <OffersPage
            offers={offers}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'story' && (
          <StoryPage
            settings={settings}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'reviews' && (
          <ReviewsPage
            reviews={reviews}
            onRefreshReviews={() => loadAllData()}
          />
        )}

        {currentTab === 'contact' && (
          <ContactPage
            settings={settings}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'admin' && (
          <AdminPage
            settings={settings}
            onRefreshGlobalSettings={() => loadAllData()}
            onNavigateHome={() => handleNavigate('home')}
          />
        )}
      </motion.main>

      {/* Delivery Survey Popup Modal */}
      <DeliverySurveyModal
        isOpen={isDeliverySurveyOpen}
        onClose={() => setIsDeliverySurveyOpen(false)}
      />

      {/* Footer */}
      <Footer settings={settings} onNavigate={handleNavigate} />

      {/* Mobile Fixed Bottom Navigation Bar */}
      <MobileNav
        currentTab={currentTab}
        cartCount={totalCartCount}
        onNavigate={handleNavigate}
        onOpenCart={() => handleNavigate('checkout')}
      />

    </div>
  );
}
