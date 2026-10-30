import React from 'react';
import { Home, UtensilsCrossed, ShoppingBag, Phone, Clock } from 'lucide-react';

interface MobileNavProps {
  currentTab: string;
  cartCount: number;
  onNavigate: (tab: string) => void;
  onOpenCart: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentTab,
  cartCount,
  onNavigate,
  onOpenCart,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-[#DD6B20]/15 px-2 py-2 safe-area-pb shadow-md">
      <div className="grid grid-cols-5 items-center justify-around gap-1">
        
        {/* الرئيسية */}
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            currentTab === 'home' ? 'text-[#DD6B20]' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-bold">الرئيسية</span>
        </button>

        {/* المنيو */}
        <button
          onClick={() => onNavigate('menu')}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            currentTab === 'menu' || currentTab === 'product-details' ? 'text-[#DD6B20]' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <UtensilsCrossed className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-bold">المنيو</span>
        </button>

        {/* السلة (Highlighted) */}
        <button
          onClick={onOpenCart}
          className="relative flex flex-col items-center justify-center -top-3 cursor-pointer"
          aria-label="عرض سلة الطلبات"
        >
          <div className="w-13 h-13 rounded-full bg-[#DD6B20] hover:bg-[#C05621] flex items-center justify-center text-white shadow-sm ember-glow border-2 border-white transition-all">
            <ShoppingBag className="w-6 h-6 text-white" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-[#DD6B20] text-xs font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#DD6B20] shadow-xs">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-black text-[#DD6B20] mt-0.5">اطلب الآن</span>
        </button>

        {/* تتبع الطلب */}
        <button
          onClick={() => onNavigate('track')}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            currentTab === 'track' ? 'text-[#DD6B20]' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-bold">تتبع طلبي</span>
        </button>

        {/* واتساب رافدية */}
        <a
          href="https://wa.me/970562606061?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D9%88%D8%AF%20%D8%A7%D9%84%D8%B7%D9%84%D8%A8%20%D9%85%D9%86%20%D9%85%D8%AD%D9%84%20%D9%83%D9%86%D8%A7%D9%81%D8%A9%20%D8%B9%20%D8%A7%D9%84%D9%81%D8%AD%D9%85%20%D9%81%D9%8A%20%D8%B1%D8%A7%D9%81%D8%AF%D9%8A%D8%A9"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-1 text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          <Phone className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-bold">واتساب</span>
        </a>

      </div>
    </nav>
  );
};
