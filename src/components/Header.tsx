import React, { useEffect, useRef, useState } from 'react';
import { Flame, LayoutDashboard, LogIn, LogOut, Menu as MenuIcon, Phone, ShoppingBag, Sparkles, User, X } from 'lucide-react';
import { StoreSettings } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { NotificationCenter } from './NotificationCenter';

interface HeaderProps {
  settings: StoreSettings | null;
  cartCount: number;
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenCart: () => void;
  /** Triggered when user clicks login button */
  onOpenAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  cartCount,
  currentTab,
  onNavigate,
  onOpenCart,
  onOpenAuth,
}) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
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
    { id: 'story', label: 'حكاية الجمر' },
    { id: 'offers', label: 'العروض' },
    { id: 'contact', label: 'زورونا' },
  ];

  const isActive = (id: string) => currentTab === id || (id === 'menu' && currentTab === 'product-details');
  const navigate = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('home');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#DAB775]/20 bg-[#14110f]/95 text-[#F7F0E5] backdrop-blur-xl" dir="rtl">
      {settings?.announcementBanner && (
        <div className="flex min-h-8 items-center justify-center gap-2 bg-[#ea580c] px-4 py-1.5 text-center text-[11px] font-bold text-white sm:text-xs">
          <Sparkles className="h-3.5 w-3.5 text-[#F7F0E5]" />
          <span>{settings.announcementBanner}</span>
        </div>
      )}

      <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <button
          type="button"
          onClick={() => navigate('home')}
          className="group flex w-max shrink-0 items-center gap-3 text-right cursor-pointer"
        >
          {settings?.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt="شعار كُومُر كُونافيه"
              className="h-11 w-11 shrink-0 rounded-full border border-[#DAB775]/40 object-contain p-1"
            />
          ) : (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#ff7b00]/40 bg-[#26201b] text-[#ff7b00] shadow-md shadow-[#ff7b00]/20">
              <Flame className="h-5 w-5 animate-pulse" />
            </span>
          )}
          <span className="shrink-0 whitespace-nowrap">
            <span className="block whitespace-nowrap text-[17px] font-black leading-none text-[#F7F0E5] sm:text-xl">كُومُر كُونافيه</span>
            <span className="mt-1 hidden text-[10px] font-medium tracking-wide text-[#ff7b00] sm:block">من الجمر، إلى قلبك</span>
          </span>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden min-w-max shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap lg:flex" aria-label="التنقل الرئيسي">
          {navLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => navigate(link.id)}
              className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-bold transition-all duration-200 cursor-pointer ${
                isActive(link.id)
                  ? 'bg-[#ff7b00]/15 text-[#ff7b00] font-black'
                  : 'text-[#D5C7B9] hover:bg-white/5 hover:text-white'
              }`}
            >
              {link.label}
            </button>
          ))}

          {/* ── Admin-Only Prominent Highlight: لوحة التحكم ── */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => navigate('admin')}
              className={`
                mr-2 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black transition-all duration-200 cursor-pointer
                ${isActive('admin')
                  ? 'bg-[#ff7b00] text-white shadow-lg shadow-[#ff7b00]/40 ring-2 ring-[#ff7b00]/50'
                  : 'bg-[#ff7b00]/15 text-[#ff7b00] border border-[#ff7b00]/50 hover:bg-[#ff7b00] hover:text-white shadow-md shadow-[#ff7b00]/15'
                }
              `}
              aria-label="لوحة التحكم"
            >
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
              <span>لوحة التحكم</span>
            </button>
          )}
        </nav>

        {/* Right Action Cluster */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Quick Contact Button */}
          <a
            href={`tel:${settings?.phone || '+970562606061'}`}
            className="hidden items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs font-bold text-[#D5C7B9] hover:border-[#ff7b00]/40 hover:text-[#ff7b00] md:flex"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>اتصل بنا</span>
          </a>

          {/* Notifications */}
          <NotificationCenter onNavigate={navigate} />

          {/* Cart Button */}
          <button
            type="button"
            onClick={onOpenCart}
            className="relative flex items-center gap-2 rounded-full bg-[#ea580c] px-3.5 py-2.5 text-sm font-black text-white shadow-lg shadow-[#ea580c]/25 hover:bg-[#ff7b00] transition-colors cursor-pointer"
            aria-label="عرض السلة"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">السلة</span>
            {cartCount > 0 && (
              <span
                key={badgeKey}
                className="animate-cart-badge flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F7F0E5] px-1.5 text-[11px] font-black text-[#ea580c]"
              >
                {cartCount}
              </span>
            )}
          </button>

          {/* Auth State Control (Desktop) */}
          {isAuthenticated ? (
            <div className="hidden items-center gap-2 md:flex">
              {/* User Account / Profile ("حسابي") */}
              <button
                type="button"
                onClick={() => navigate('account')}
                title={user?.email}
                className="flex items-center gap-2 rounded-full border border-[rgba(255,123,0,0.25)] bg-[#221d19] px-3.5 py-2 text-xs font-bold text-[#F7F0E5] hover:border-[#ff7b00] hover:text-[#ff7b00] transition-colors cursor-pointer"
              >
                <User className="h-3.5 w-3.5 text-[#ff7b00]" />
                <span className="max-w-[110px] truncate">{user?.name || 'حسابي'}</span>
                {isAdmin ? (
                  <span className="rounded-full bg-[#ff7b00] px-1.5 py-0.5 text-[9px] font-black text-white">
                    مسؤول
                  </span>
                ) : (
                  <span className="text-[10px] text-[#9a8278]">
                    (حسابي)
                  </span>
                )}
              </button>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                aria-label="تسجيل الخروج"
                title="تسجيل الخروج"
                className="rounded-full border border-white/10 p-2.5 text-[#9a8278] hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="hidden items-center gap-2 rounded-full border border-[#ff7b00]/40 bg-[#ff7b00]/10 px-3.5 py-2 text-xs font-black text-[#ff7b00] hover:bg-[#ff7b00] hover:text-white transition-all shadow-sm md:flex cursor-pointer"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>تسجيل الدخول</span>
            </button>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="rounded-full border border-white/10 p-2.5 text-[#F7F0E5] hover:border-[#ff7b00]/50 lg:hidden cursor-pointer"
            aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-[#17120F] px-4 pb-6 pt-3 lg:hidden">
          <nav className="space-y-1" aria-label="التنقل المحمول">
            {navLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => navigate(link.id)}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-right text-sm font-bold cursor-pointer ${
                  isActive(link.id) ? 'bg-[#ff7b00]/15 text-[#ff7b00]' : 'text-[#D5C7B9] hover:bg-white/5'
                }`}
              >
                <span>{link.label}</span>
                <span className="text-[#ff7b00]">←</span>
              </button>
            ))}

            {/* Admin prominent button in mobile menu */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => navigate('admin')}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-right text-sm font-black cursor-pointer shadow-md ${
                  isActive('admin')
                    ? 'bg-[#ff7b00] text-white shadow-[#ff7b00]/30'
                    : 'bg-[#ff7b00]/20 border border-[#ff7b00] text-[#ff7b00]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                  <span>لوحة التحكم</span>
                </span>
              </button>
            )}
          </nav>

          {/* Mobile Auth Management */}
          <div className="mt-4 space-y-2 pt-2 border-t border-white/10">
            {isAuthenticated ? (
              <>
                <button type="button" onClick={() => navigate('account')} className="flex w-full items-center justify-between rounded-2xl border border-[rgba(255,123,0,0.2)] bg-[#221d19] px-4 py-3 text-right transition hover:border-[#ff7b00]/50">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-[#ff7b00]" />
                    <span className="text-sm font-bold text-[#F7F0E5]">{user?.name}</span>
                    {isAdmin && (
                      <span className="rounded-full bg-[#ff7b00] px-2 py-0.5 text-[10px] font-black text-white">مسؤول</span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#9a8278]">{user?.email}</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/25 bg-red-500/5 px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onOpenAuth?.();
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#ff7b00] bg-[#ff7b00] px-4 py-3 text-sm font-black text-white shadow-lg shadow-[#ff7b00]/20 hover:bg-[#ea580c] cursor-pointer"
              >
                <LogIn className="h-4 w-4" />
                <span>تسجيل الدخول / إنشاء حساب</span>
              </button>
            )}

            <a
              href={`https://wa.me/${settings?.whatsapp || '970562606061'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#1C8C5E]/15 border border-[#1C8C5E]/30 px-4 py-3 text-sm font-bold text-[#77D6A6] mt-2"
            >
              <Phone className="h-4 w-4" />
              <span>مراسلة واتساب المباشرة</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
