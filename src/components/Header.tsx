import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, Flame, Gift, House, LayoutGrid, MapPin, Tag, LayoutDashboard, LogIn, LogOut, Menu as MenuIcon, Phone, ShoppingBag, User, X } from 'lucide-react';
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
  const [dismissedAnnouncement, setDismissedAnnouncement] = useState<string>();
  const announcement = settings?.announcementBanner;
  const isHome = currentTab === 'home';
  const previousCount = useRef(cartCount);
  const [badgeKey, setBadgeKey] = useState(0);

  useEffect(() => {
    if (cartCount > previousCount.current) setBadgeKey((key) => key + 1);
    previousCount.current = cartCount;
  }, [cartCount]);

  const navLinks = [
    { id: 'home', label: 'الرئيسية', Icon: House },
    { id: 'menu', label: 'المنيو', Icon: LayoutGrid },
    { id: 'story', label: 'حكاية الجمر', Icon: BookOpen },
    { id: 'offers', label: 'العروض', Icon: Tag },
    { id: 'contact', label: 'زورونا', Icon: MapPin },
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
    <header className={`home-header text-[#F7F0E5]${!isHome ? ' is-sticky' : ''}`} dir="rtl">
      {announcement && announcement !== dismissedAnnouncement && (
        <div className="home-announcement">
          <Gift size={17} aria-hidden="true" />
          <span>{announcement}</span>
          <button type="button" onClick={() => setDismissedAnnouncement(announcement)} aria-label="إغلاق الإعلان">
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="header-bar mx-auto flex min-h-[64px] w-fit max-w-[96vw] items-center justify-between gap-2 px-3 sm:gap-3 sm:px-4">
        {/* Brand Logo & Name */}
        <button
          type="button"
          onClick={() => navigate('home')}
          className="header-brand group flex w-max shrink-0 items-center gap-2 text-right cursor-pointer"
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
            <span className="block whitespace-nowrap text-[15px] font-black leading-none text-[#F7F0E5] sm:text-[17px]">كُومُر كُونافيه</span>
            <span className="header-wordmark mt-0.5 hidden text-[10px] font-medium tracking-wide text-[#ff7b00] sm:block"><bdi lang="tr">KÖMÜR KÜNEFE</bdi></span>
          </span>
        </button>

        <nav className="header-desktop hidden min-w-0 shrink flex-nowrap items-center gap-0.5 whitespace-nowrap xl:flex" aria-label="التنقل الرئيسي">
          {navLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => navigate(link.id)}
              aria-current={isActive(link.id) ? 'page' : undefined}
              className={`header-link shrink-0 whitespace-nowrap rounded-full px-2.5 py-1.5 text-[13px] font-bold transition-all duration-200 cursor-pointer ${
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
                ms-1 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-black transition-all duration-200 cursor-pointer
                ${isActive('admin')
                  ? 'bg-[#ff7b00] text-white shadow-lg shadow-[#ff7b00]/40 ring-2 ring-[#ff7b00]/50'
                  : 'bg-[#ff7b00]/15 text-[#ff7b00] border border-[#ff7b00]/50 hover:bg-[#ff7b00] hover:text-white shadow-md shadow-[#ff7b00]/15'
                }
              `}
              aria-label="لوحة التحكم"
            >
              <LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />
              <span>لوحة التحكم</span>
            </button>
          )}
        </nav>

        {/* Right Action Cluster */}
        <div className="flex shrink-0 items-center gap-1.5">
          {/* Quick Contact Button — icon-only on medium, text on large */}
          <a
            href={`tel:${settings?.phone || '+970562606061'}`}
            className="header-call hidden min-h-[40px] items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1.5 text-xs font-bold text-[#D5C7B9] hover:border-[#ff7b00]/40 hover:text-[#ff7b00] xl:flex"
          >
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden 2xl:inline">اتصل بنا</span>
          </a>

          {/* Notifications */}
          <div className="header-notifications"><NotificationCenter onNavigate={navigate} /></div>

          {/* Cart Button */}
          <button
            type="button"
            onClick={onOpenCart}
            className="header-cart relative flex min-h-[40px] items-center gap-1.5 rounded-full bg-[#ea580c] px-3 py-1.5 text-sm font-black text-white shadow-lg shadow-[#ea580c]/25 hover:bg-[#ff7b00] transition-colors cursor-pointer"
            aria-label="عرض السلة"
          >
            <ShoppingBag className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">السلة</span>
            {cartCount > 0 && (
              <span
                key={badgeKey}
                className="header-cart-count animate-cart-badge flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F7F0E5] px-1.5 text-[11px] font-black text-[#ea580c]"
              >
                {cartCount}
              </span>
            )}
          </button>

          {/* Auth State Control (Desktop) */}
          {isAuthenticated ? (
            <div className="hidden items-center gap-1.5 md:flex">
              {/* User Account / Profile */}
              <button
                type="button"
                onClick={() => navigate('account')}
                title={user?.email}
                className="flex min-h-[40px] items-center gap-1.5 rounded-full border border-[rgba(255,123,0,0.25)] bg-[#221d19] px-2.5 py-1.5 text-xs font-bold text-[#F7F0E5] hover:border-[#ff7b00] hover:text-[#ff7b00] transition-colors cursor-pointer"
              >
                <User className="h-3.5 w-3.5 shrink-0 text-[#ff7b00]" />
                <span className="max-w-[80px] truncate">{user?.name || 'حسابي'}</span>
                {isAdmin && (
                  <span className="rounded-full bg-[#ff7b00] px-1.5 py-0.5 text-[9px] font-black text-white">
                    مسؤول
                  </span>
                )}
              </button>

              {/* Logout Button — icon only */}
              <button
                type="button"
                onClick={handleLogout}
                aria-label="تسجيل الخروج"
                title="تسجيل الخروج"
                className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full border border-white/10 text-[#9a8278] hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="header-login hidden min-h-[40px] items-center gap-1.5 rounded-full border border-[#ff7b00]/40 bg-[#ff7b00]/10 px-2.5 py-1.5 text-xs font-black text-[#ff7b00] hover:bg-[#ff7b00] hover:text-white transition-all shadow-sm md:flex cursor-pointer"
            >
              <LogIn className="h-3.5 w-3.5 shrink-0" />
              <span>دخول</span>
            </button>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-expanded={mobileMenuOpen}
            aria-controls={mobileMenuOpen ? 'store-header-menu' : undefined}
            className="header-toggle flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full border border-white/10 text-[#F7F0E5] hover:border-[#ff7b00]/50 xl:hidden cursor-pointer"
            aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {mobileMenuOpen && (
        <div id="store-header-menu" className="header-drawer border-t border-white/10 bg-[#17120F] px-4 pb-6 pt-3 lg:hidden">
          <nav className="space-y-1" aria-label="التنقل المحمول">
            {navLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => navigate(link.id)}
                className={`flex min-h-[44px] w-full items-center justify-between rounded-2xl px-4 py-3 text-right text-sm font-bold cursor-pointer ${
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
                className={`flex min-h-[44px] w-full items-center justify-between rounded-2xl px-4 py-3.5 text-right text-sm font-black cursor-pointer shadow-md ${
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
                <button type="button" onClick={() => navigate('account')} className="flex min-h-[44px] w-full items-center justify-between rounded-2xl border border-[rgba(255,123,0,0.2)] bg-[#221d19] px-4 py-3 text-right transition hover:border-[#ff7b00]/50">
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
                  className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border border-red-500/25 bg-red-500/5 px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 cursor-pointer"
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
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border border-[#ff7b00] bg-[#ff7b00] px-4 py-3 text-sm font-black text-white shadow-lg shadow-[#ff7b00]/20 hover:bg-[#ea580c] cursor-pointer"
              >
                <LogIn className="h-4 w-4" />
                <span>تسجيل الدخول / إنشاء حساب</span>
              </button>
            )}

            <a
              href={`https://wa.me/${settings?.whatsapp || '970562606061'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-[#1C8C5E]/15 border border-[#1C8C5E]/30 px-4 py-3 text-sm font-bold text-[#77D6A6] mt-2"
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
