import React, { useState, useEffect } from 'react';
import { Product, ProductVariant, CartItem, Offer, Review, StoreSettings } from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MobileNav } from './components/MobileNav';
import { DeliverySurveyModal } from './components/DeliverySurveyModal';

import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { OffersPage } from './pages/OffersPage';
import { StoryPage } from './pages/StoryPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<string>('home');

  // Application data state
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  // Cart state persisted in localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('komur_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals
  const [isDeliverySurveyOpen, setIsDeliverySurveyOpen] = useState(false);

  // Handle URL hash / path on load (e.g. /#menu or ?utm_source=instagram)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      const path = window.location.pathname.toLowerCase();

      if (hash === 'menu' || path === '/menu') {
        setCurrentTab('menu');
      } else if (hash === 'order' || hash === 'checkout' || path === '/order') {
        setCurrentTab('checkout');
      } else if (hash === 'admin' || path === '/admin') {
        setCurrentTab('admin');
      } else if (hash === 'track') {
        setCurrentTab('track');
      } else if (hash === 'offers') {
        setCurrentTab('offers');
      } else if (hash === 'story') {
        setCurrentTab('story');
      } else if (hash === 'reviews') {
        setCurrentTab('reviews');
      } else if (hash === 'contact') {
        setCurrentTab('contact');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
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
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  // Cart operations
  const handleAddToCart = (product: Product, variant: ProductVariant, quantity: number) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.product.id === product.id && item.variant.id === variant.id
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

  const handleClearCart = () => {
    setCart([]);
  };

  const handleNavigate = (tab: string) => {
    setCurrentTab(tab);
    window.location.hash = tab === 'home' ? '' : tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-neutral-50/50 text-slate-800 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      
      {/* Header */}
      <Header
        settings={settings}
        cartCount={totalCartCount}
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenCart={() => handleNavigate('checkout')}
      />

      {/* Main Content Pages */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            products={products}
            offers={offers}
            reviews={reviews}
            settings={settings}
            onNavigate={handleNavigate}
            onAddToCart={handleAddToCart}
            onOpenDeliverySurvey={() => setIsDeliverySurveyOpen(true)}
          />
        )}

        {currentTab === 'menu' && (
          <MenuPage
            products={products}
            onAddToCart={handleAddToCart}
            onOpenDeliverySurvey={() => setIsDeliverySurveyOpen(true)}
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

    </div>
  );
}
