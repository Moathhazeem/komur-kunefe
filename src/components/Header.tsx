import React, { useEffect, useRef, useState } from 'react';
import { Flame, Menu as MenuIcon, Phone, ShoppingBag, Sparkles, X } from 'lucide-react';
import { StoreSettings } from '../types';

interface HeaderProps {
  settings: StoreSettings | null;
  cartCount: number;
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({ settings, cartCount, currentTab, onNavigate, onOpenCart }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const previousCount = useRef(cartCount);
  const [badgeKey, setBadgeKey] = useState(0);

  useEffect(() => {
    if (cartCount > previousCount.current) setBadgeKey((key) => key + 1);
    previousCount.current = cartCount;
  }, [cartCount]);

  const navLinks = [
    { id: 'home', label: 'الرئيسية' },
    { id: 'menu', label: 'المنيو' },
    { id: 'genius', label: 'Genius · لَمّتكم' },
    { id: 'story', label: 'حكاية الجمر' },
    { id: 'offers', label: 'العروض' },
    { id: 'contact', label: 'زورونا' },
  ];

  const isActive = (id: string) => currentTab === id || (id === 'menu' && currentTab === 'product-details');
  const navigate = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#DAB775]/15 bg-[#17120F]/95 text-[#F7F0E5] backdrop-blur-xl">
      {settings?.announcementBanner && (
        <div className="flex min-h-8 items-center justify-center gap-2 bg-[#C7652D] px-4 py-1.5 text-center text-[11px] font-bold text-white sm:text-xs">
          <Sparkles className="h-3.5 w-3.5 text-[#F7F0E5]" />
          <span>{settings.announcementBanner}</span>
        </div>
      )}

      <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button type="button" onClick={() => navigate('home')} className="group flex min-w-0 items-center gap-3 text-right">
          {settings?.logoUrl ? (
            <img src={settings.logoUrl} alt="شعار Kömür Künefe" className="h-11 w-11 shrink-0 rounded-full border border-[#DAB775]/35 object-contain p-1" />
          ) : (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#DAB775]/35 bg-[#35241A] text-[#DAB775]">
              <Flame className="h-5 w-5" />
            </span>
          )}
          <span className="min-w-0">
            <span className="block truncate text-[17px] font-black leading-none text-[#F7F0E5] sm:text-xl">كُومُر كُونافيه</span>
            <span className="mt-1 hidden text-[10px] font-medium tracking-wide text-[#DAB775] sm:block">من الجمر، إلى قلبك</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="التنقل الرئيسي">
          {navLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => navigate(link.id)}
              className={`rounded-full px-3.5 py-2 text-sm font-bold transition-colors ${isActive(link.id) ? 'bg-[#DAB775]/15 text-[#DAB775]' : 'text-[#D5C7B9] hover:bg-white/5 hover:text-white'}`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <a
            href={`tel:${settings?.phone || '+970562606061'}`}
            className="hidden items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs font-bold text-[#D5C7B9] hover:border-[#DAB775]/40 hover:text-[#DAB775] md:flex"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>اتصل بنا</span>
          </a>
          <button type="button" onClick={onOpenCart} className="relative flex items-center gap-2 rounded-full bg-[#C7652D] px-3.5 py-2.5 text-sm font-black text-white shadow-lg shadow-[#C7652D]/20 hover:bg-[#A94E20]" aria-label="عرض السلة">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">السلة</span>
            {cartCount > 0 && <span key={badgeKey} className="animate-cart-badge flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F7F0E5] px-1.5 text-[11px] font-black text-[#C7652D]">{cartCount}</span>}
          </button>
          <button type="button" onClick={() => setMobileMenuOpen((open) => !open)} className="rounded-full border border-white/10 p-2.5 text-[#F7F0E5] lg:hidden" aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-[#17120F] px-4 pb-5 pt-3 lg:hidden">
          <nav className="space-y-1" aria-label="التنقل المحمول">
            {navLinks.map((link) => (
              <button key={link.id} type="button" onClick={() => navigate(link.id)} className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-right text-sm font-bold ${isActive(link.id) ? 'bg-[#DAB775]/15 text-[#DAB775]' : 'text-[#D5C7B9] hover:bg-white/5'}`}>
                <span>{link.label}</span><span className="text-[#DAB775]">←</span>
              </button>
            ))}
          </nav>
          <a href={`https://wa.me/${settings?.whatsapp || '970562606061'}`} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-[#1C8C5E]/15 px-4 py-3 text-sm font-bold text-[#77D6A6]">
            <Phone className="h-4 w-4" /> مراسلة واتساب
          </a>
        </div>
      )}
    </header>
  );
};
