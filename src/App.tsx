import { motion, useReducedMotion } from 'motion/react';
import { GeniusPage } from './pages/GeniusPage';
import { quantityLimit, priceInCents } from '../shared/commerce';
import React, { useState, useEffect } from 'react';
import { Product, ProductVariant, CartItem, Offer, Review, StoreSettings } from './types';
import { OFFICIAL_PRODUCTS } from './data/menuData';
import { api } from './services/api';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MobileNav } from './components/MobileNav';
import { DeliverySurveyModal } from './components/DeliverySurveyModal';

import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { OffersPage } from './pages/OffersPage';
import { StoryPage } from './pages/StoryPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  const reduced = useReducedMotion();
  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);

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

  // Handle URL path / hash routing (e.g., /product/:id, /menu, /#menu, /checkout)
  useEffect(() => {
    const handleRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.replace('#', '').toLowerCase();

      // Check for /product/:id in path or hash (supports /product/prod-1 or #product/prod-1)
      const pathMatch = window.location.pathname.match(/^\/product\/([^\/?#]+)/i);
      const hashMatch = window.location.hash.match(/^#?\/?product\/([^\/?#]+)/i) ||
                        window.location.hash.match(/[?&]product=([^&#]+)/i);
      const searchMatch = window.location.search.match(/[?&]product=([^&#]+)/i);

      const matchedId = (pathMatch && pathMatch[1]) || (hashMatch && hashMatch[1]) || (searchMatch && searchMatch[1]);
      if (matchedId) {
        setCurrentProductId(decodeURIComponent(matchedId));
        setCurrentTab('product-details');
        return;
      }

      if (hash === 'genius' || path === '/genius') { setCurrentTab('genius'); setCurrentProductId(null); return; }
      if (hash === 'menu' || path === '/menu') {
        setCurrentTab('menu');
        setCurrentProductId(null);
      } else if (hash === 'order' || hash === 'checkout' || path === '/order' || path === '/checkout') {
        setCurrentTab('checkout');
        setCurrentProductId(null);
      } else if (hash === 'admin' || path === '/admin') {
        setCurrentTab('admin');
        setCurrentProductId(null);
      } else if (hash === 'track' || path === '/track') {
        setCurrentTab('track');
        setCurrentProductId(null);
      } else if (hash === 'offers' || path === '/offers') {
        setCurrentTab('offers');
        setCurrentProductId(null);
      } else if (hash === 'story' || path === '/story') {
        setCurrentTab('story');
        setCurrentProductId(null);
      } else if (hash === 'reviews' || path === '/reviews') {
        setCurrentTab('reviews');
        setCurrentProductId(null);
      } else if (hash === 'contact' || path === '/contact') {
        setCurrentTab('contact');
        setCurrentProductId(null);
      } else {
        setCurrentTab('home');
        setCurrentProductId(null);
      }
    };

    handleRoute();
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('popstate', handleRoute);
    return () => {
      window.removeEventListener('hashchange', handleRoute);
      window.removeEventListener('popstate', handleRoute);
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

  const handleNavigateToProduct = (productId: string) => {
    setCurrentProductId(productId);
    setCurrentTab('product-details');
    window.history.pushState(null, '', `/product/${productId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (tab: string) => {
    setCurrentProductId(null);
    setCurrentTab(tab);
    if (tab === 'home') {
      window.history.pushState(null, '', '/');
      window.location.hash = '';
    } else {
      window.history.pushState(null, '', `/${tab}`);
      window.location.hash = tab;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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

      {/* Main Content Pages with smooth fade & slide-up */}
      <a href="#content" className="skip-link">انتقل إلى المحتوى</a>
      <motion.main id="content" key={currentTab === 'product-details' ? `prod-${currentProductId}` : currentTab} className="flex-1" initial={reduced || currentTab === 'admin' ? false : {opacity:0}} animate={{opacity:1}} transition={{duration:reduced?0:.22}}>
        {dataState !== 'ready' && currentTab !== 'admin' && <div className="signature-page"><p className="status-notice" role="status">{dataState === 'loading' ? 'نحمّي الجمر… جارٍ تحميل المنيو' : 'تعذر تحميل بيانات الفرع. تحقق من الاتصال.'}</p>{dataState === 'error' && <button className="signature-button mt-3" onClick={loadAllData}>حاول مجدداً</button>}</div>}
        {currentTab === 'genius' && <GeniusPage products={products} onAdd={handleAddSelection} onOpenCart={()=>handleNavigate('checkout')} />}

        {currentTab === 'home' && (
          <HomePage
            products={products}
            offers={offers}
            reviews={reviews}
            settings={settings}
            onNavigate={handleNavigate}
            onNavigateToProduct={handleNavigateToProduct}
            onAddToCart={handleAddToCart}
            onOpenDeliverySurvey={() => setIsDeliverySurveyOpen(true)}
          />
        )}

        {currentTab === 'menu' && (
          <MenuPage
            products={products}
            onNavigate={handleNavigate}
            onAddToCart={handleAddToCart}
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
