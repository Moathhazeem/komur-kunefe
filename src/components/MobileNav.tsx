import React from 'react';
import { Clock3, Home, Phone, ShoppingBag, UtensilsCrossed } from 'lucide-react';

interface MobileNavProps {
  currentTab: string;
  cartCount: number;
  onNavigate: (tab: string) => void;
  onOpenCart: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, cartCount, onNavigate, onOpenCart }) => (
  <nav className="safe-area-pb fixed bottom-0 left-0 right-0 z-50 border-t border-[#DAB775]/15 bg-[#17120F]/95 px-2 pt-2 text-[#F7F0E5] shadow-2xl backdrop-blur-xl md:hidden" aria-label="تنقل سريع">
    <div className="grid grid-cols-5 items-end gap-1">
      <button type="button" onClick={() => onNavigate('home')} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold ${currentTab === 'home' ? 'text-[#DAB775]' : 'text-[#A99B90]'}`}>
        <Home className="h-5 w-5" /><span>الرئيسية</span>
      </button>
      <button type="button" onClick={() => onNavigate('menu')} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold ${currentTab === 'menu' || currentTab === 'product-details' ? 'text-[#DAB775]' : 'text-[#A99B90]'}`}>
        <UtensilsCrossed className="h-5 w-5" /><span>المنيو</span>
      </button>
      <button type="button" onClick={onOpenCart} className="relative -mt-7 flex flex-col items-center gap-1 text-[10px] font-black text-[#DAB775]" aria-label="عرض السلة">
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#17120F] bg-[#C7652D] shadow-xl shadow-[#C7652D]/30">
          <ShoppingBag className="h-6 w-6 text-white" />
          {cartCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#17120F] bg-[#F7F0E5] px-1 text-[10px] text-[#C7652D]">{cartCount}</span>}
        </span>
        <span>اطلب الآن</span>
      </button>
      <button type="button" onClick={() => onNavigate('track')} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold ${currentTab === 'track' ? 'text-[#DAB775]' : 'text-[#A99B90]'}`}>
        <Clock3 className="h-5 w-5" /><span>تتبع طلبي</span>
      </button>
      <a href="https://wa.me/970562606061" target="_blank" rel="noopener noreferrer" className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold text-[#77D6A6]">
        <Phone className="h-5 w-5" /><span>واتساب</span>
      </a>
    </div>
  </nav>
);
