import React, { useState } from 'react';
import { Flame, ShoppingBag, Phone, Menu as MenuIcon, X, Shield, Sparkles } from 'lucide-react';
import { StoreSettings } from '../types';

interface HeaderProps {
  settings: StoreSettings | null;
  cartCount: number;
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  cartCount,
  currentTab,
  onNavigate,
  onOpenCart,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'الرئيسية' },
    { id: 'menu', label: 'المنيو' },
    { id: 'offers', label: 'العروض والمناسبات' },
    { id: 'story', label: 'قصتنا' },
    { id: 'reviews', label: 'آراء الزبائن' },
    { id: 'contact', label: 'تواصل معنا' },
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-100 shadow-xs">
      {/* Announcement Bar */}
      {settings?.announcementBanner && (
        <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white text-xs md:text-sm font-bold py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>{settings.announcementBanner}</span>
          <span className="hidden md:inline bg-white/20 text-white text-[11px] px-2 py-0.5 rounded-full mr-2">
            استلام من رافدية
          </span>
        </div>
      )}

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo & Brand */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 text-right group transition-transform focus:outline-none"
          >
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="Kömür Künefe Logo"
                className="w-12 h-12 object-contain rounded-2xl border border-orange-200 bg-orange-50 p-1"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform border border-orange-400">
                <Flame className="w-7 h-7 text-white animate-pulse" />
              </div>
            )}

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-orange-600 font-heading">
                  Kömür Künefe
                </span>
                <span className="text-[10px] sm:text-xs bg-orange-100 text-orange-700 font-bold px-1.5 py-0.5 rounded-md border border-orange-200">
                  ع الفحم
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                كنافة نابلسية ع جمر الفحم | رافدية
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const active = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`px-3 py-2 text-sm font-bold rounded-xl transition-all ${active
                      ? 'text-orange-600 bg-orange-50 border border-orange-200 shadow-xs'
                      : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50/60'
                    }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick WhatsApp / Call */}
            <a
              href="https://wa.me/970562606061?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D9%88%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D9%83%D9%86%D8%A7%D9%81%D8%A9%20%D8%B9%20%D8%A7%D9%84%D9%81%D8%AD%D9%85"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 px-3 py-2 rounded-xl text-xs font-bold transition-all"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>واتساب رافدية</span>
            </a>

            {/* Cart Trigger */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md hover:shadow-orange-200 hover:scale-[1.02]"
              aria-label="عرض السلة"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">السلة</span>
              {cartCount > 0 && (
                <span className="bg-white text-orange-600 text-xs font-black px-2 py-0.5 rounded-full shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Admin Portal Shortcut */}
            <button
              onClick={() => handleLinkClick('admin')}
              className={`p-2.5 rounded-xl border transition-all ${currentTab === 'admin'
                  ? 'bg-orange-100 text-orange-600 border-orange-300'
                  : 'bg-white text-slate-500 border-slate-200 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50'
                }`}
              title="لوحة تحكم صاحب المحل"
              aria-label="لوحة تحكم الإدارة"
            >
              <Shield className="w-4 h-4" />
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-white text-slate-700 border border-slate-200 hover:border-orange-300 transition-colors"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-orange-100 px-4 pt-3 pb-6 space-y-2 animate-fadeIn shadow-lg">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link.id)}
              className={`w-full text-right px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between transition-colors ${currentTab === link.id
                  ? 'bg-orange-50 text-orange-600 border border-orange-200'
                  : 'text-slate-700 hover:bg-orange-50/50'
                }`}
            >
              <span>{link.label}</span>
              <span className="text-xs text-orange-400">←</span>
            </button>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <a
              href="https://wa.me/970562606061"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-sm border border-emerald-200 hover:bg-emerald-100"
            >
              مراسلة واتساب: +970 562 606 061
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
