import React, { useState, useEffect } from 'react';
import { Product, ProductVariant, CartItem, Offer, Review, StoreSettings } from './types';
import { OFFICIAL_PRODUCTS } from './data/menuData';
import { api } from './services/api';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MobileNav } from './components/MobileNav';
import { DeliverySurveyModal } from './components/DeliverySurveyModal';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';

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
import { AccountSettingsPage } from './pages/AccountSettingsPage';
import ChatbotWidget from './components/ChatbotWidget';

// ─── Inner Application Component ─────────────────────────────────────────────

function AppInner() {
  const { user, isAuthenticated, isAdmin } = useAuth();

  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);

  // Auth screen state
  const [showAuth, setShowAuth] = useState(false);

  // Application data state
  const [products, setProducts] = useState<Product[]>(OFFICIAL_PRODUCTS);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  // Cart state persisted in localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('komur_cart');
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.map((item: CartItem) => {
        const name = String(item.variant?.name || '');
        const hadDeliveryFee = name.includes('توصيل');
        return {
          ...item,
          variant: {
            ...item.variant,
            name: name.replace(/\s*·\s*(توصيل|استلام من الفرع)/g, '').trim(),
            price: Math.max(0, (Number(item.variant?.price) || 0) - (hadDeliveryFee ? 15 : 0)),
          },
        };
      }) : [];
    } catch {
      return [];
    }
  });

  // Modals
  const [isDeliverySurveyOpen, setIsDeliverySurveyOpen] = useState(false);

  // Handle URL path / hash routing
  useEffect(() => {
    const handleRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.replace('#', '').toLowerCase();

      // Check for auth routes
      if (hash === 'auth' || hash === 'login' || path === '/auth' || path === '/login') {
        setShowAuth(true);
        return;
      }

      // Check for /product/:id in path or hash
      const pathMatch = window.location.pathname.match(/^\/product\/([^\/?#]+)/i);
      const hashMatch =
        window.location.hash.match(/^#?\/?product\/([^\/?#]+)/i) ||
        window.location.hash.match(/[?&]product=([^&#]+)/i);
      const searchMatch = window.location.search.match(/[?&]product=([^&#]+)/i);

      const matchedId =
        (pathMatch && pathMatch[1]) ||
        (hashMatch && hashMatch[1]) ||
        (searchMatch && searchMatch[1]);

      if (matchedId) {
        setCurrentProductId(decodeURIComponent(matchedId));
        setCurrentTab('product-details');
        setShowAuth(false);
        return;
      }

      if (hash === 'menu' || path === '/menu') {
        setCurrentTab('menu'); setCurrentProductId(null); setShowAuth(false);
      } else if (hash === 'order' || hash === 'checkout' || path === '/order' || path === '/checkout') {
        setCurrentTab('checkout'); setCurrentProductId(null); setShowAuth(false);
      } else if (hash === 'admin' || path === '/admin') {
        setCurrentTab('admin'); setCurrentProductId(null); setShowAuth(false);
      } else if (hash === 'account' || path === '/account') {
        setCurrentTab('account'); setCurrentProductId(null); setShowAuth(!isAuthenticated);
      } else if (hash === 'track' || path === '/track') {
        setCurrentTab('track'); setCurrentProductId(null); setShowAuth(false);
      } else if (hash === 'offers' || path === '/offers') {
        setCurrentTab('offers'); setCurrentProductId(null); setShowAuth(false);
      } else if (hash === 'story' || path === '/story') {
        setCurrentTab('story'); setCurrentProductId(null); setShowAuth(false);
      } else if (hash === 'reviews' || path === '/reviews') {
        setCurrentTab('reviews'); setCurrentProductId(null); setShowAuth(false);
      } else if (hash === 'contact' || path === '/contact') {
        setCurrentTab('contact'); setCurrentProductId(null); setShowAuth(false);
      } else {
        setCurrentTab('home'); setCurrentProductId(null); setShowAuth(false);
      }
    };

    handleRoute();
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('popstate', handleRoute);
    return () => {
      window.removeEventListener('hashchange', handleRoute);
      window.removeEventListener('popstate', handleRoute);
    };
  }, [isAuthenticated]);

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
        api.getReviews(false),
        api.getSettings(),
      ]);
      setProducts(fetchedProducts && fetchedProducts.length > 0 ? fetchedProducts : OFFICIAL_PRODUCTS);
      setOffers(fetchedOffers);
      setReviews(fetchedReviews);
      setSettings(fetchedSettings);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  // Cart operations
  const handleAddToCart = (product: Product, variant: ProductVariant, quantity: number) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.product.id === product.id && item.variant.id === variant.id && item.variant.name === variant.name && item.variant.price === variant.price
      );
      if (existingIndex >= 0) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prevCart, { product, variant, quantity }];
      }
    });
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(index);
      return;
    }
    setCart((prevCart) => {
      const updated = [...prevCart];
      updated[index].quantity = quantity;
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCart((prevCart) => prevCart.filter((_, i) => i !== index));
  };

  const handleClearCart = () => setCart([]);

  const handleSaveStoreSettings = async (updatedSettings: Partial<StoreSettings>) => {
    const savedSettings = await api.updateSettings(updatedSettings);
    setSettings(savedSettings);
  };

  const handleNavigateToProduct = (productId: string) => {
    setCurrentProductId(productId);
    setCurrentTab('product-details');
    setShowAuth(false);
    window.history.pushState(null, '', `/product/${productId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (tab: string) => {
    setCurrentProductId(null);
    setCurrentTab(tab);
    setShowAuth(false);

    if (tab === 'home') {
      window.history.pushState(null, '', '/');
      window.location.hash = '';
    } else {
      window.history.pushState(null, '', `/${tab}`);
      window.location.hash = tab;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Automatic smooth redirection to home after login or signup
  const handleAuthSuccess = () => {
    setShowAuth(false);
    handleNavigate('home');
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Full-Screen Authentication View
  if (showAuth) {
    return (
      <AuthPage
        onSuccess={handleAuthSuccess}
        onClose={() => {
          setShowAuth(false);
          handleNavigate('home');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF8F2] text-[#211814] flex flex-col font-sans selection:bg-[#ff7b00] selection:text-white">
      {/* Header */}
      <Header
        settings={settings}
        cartCount={totalCartCount}
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenCart={() => handleNavigate('checkout')}
        onOpenAuth={() => setShowAuth(true)}
      />

      {/* Main Content Pages with smooth fade & slide-up */}
      <main
        key={currentTab === 'product-details' ? `prod-${currentProductId}` : currentTab}
        className="flex-1 animate-soft-slide-up"
      >
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

        {currentTab === 'account' && user && (
          <AccountSettingsPage
            user={user}
            isAdmin={isAdmin}
            settings={settings}
            products={products}
            onNavigate={handleNavigate}
            onSaveSettings={handleSaveStoreSettings}
          />
        )}

        {currentTab === 'admin' && (
          <AdminPage
            settings={settings}
            onRefreshGlobalSettings={() => loadAllData()}
            onNavigateHome={() => handleNavigate('home')}
          />
        )}
      </main>

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

      {/* Floating Chatbot Widget */}
      <ChatbotWidget />
    </div>
  );
}

// ─── Root Application Component ──────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
