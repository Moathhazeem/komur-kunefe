import React, { useState, useMemo } from 'react';
import { Flame, Search, Filter, Info, Bike } from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { ProductCard } from '../components/ProductCard';

interface MenuPageProps {
  products: Product[];
  onAddToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
  onOpenDeliverySurvey: () => void;
  onNavigateToProduct: (productId: string) => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({
  products,
  onAddToCart,
  onOpenDeliverySurvey,
  onNavigateToProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'كامل المنيو (8 أصناف)' },
    { id: 'charcoal', label: 'كنافة وإسطنبولية على الفحم' },
    { id: 'nutella', label: 'إسطنبولية بالشوكولاتة ومودرن' },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesQuery =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-soft-fade">

      {/* Page Title & Philosophy */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 bg-white text-[#DD6B20] border border-[#DD6B20]/25 px-3.5 py-1 rounded-full text-xs font-bold shadow-xs">
          <Flame className="w-4 h-4 text-[#DD6B20]" />
          <span>طازجة وتُخبز فور الطلب على جمر الفحم</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 font-heading">
          منيو Kömür Künefe
        </h1>
        <p className="text-sm sm:text-base text-slate-500">
          اختر صنفك المفضل واضغط لعرض صفحة الصنف الكاملة وتحديد الحجم والكمية. جميع الطلبات تُسلَّم ساخنة ومجهزة من فرع رافدية.
        </p>

        {/* General Note Banner */}
        <div className="bg-linear-to-r from-amber-500/10 via-[#DD6B20]/15 to-amber-500/10 border border-[#DD6B20]/30 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-800 flex items-center justify-center gap-2.5 text-center shadow-xs">
          <span className="text-base">🍨</span>
          <span className="font-bold text-[#DD6B20]">ملاحظة عامة للمنيو:</span>
          <span className="font-semibold text-slate-700">إمكانية إضافة بوظة لأي صنف بـ 3 شيكل فقط.</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border cursor-pointer ${active
                  ? 'bg-[#DD6B20] text-white border-[#DD6B20] shadow-md shadow-[#DD6B20]/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#DD6B20]/40 hover:text-[#DD6B20]'
                  }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="ابحث عن صنف (إسطنبولية، قشطة، برجر...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 focus:border-[#DD6B20] focus:ring-2 focus:ring-[#DD6B20]/20 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-[#DD6B20]/20 rounded-3xl p-12 text-center space-y-3 shadow-xs">
          <Filter className="w-10 h-10 text-[#DD6B20] mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 font-heading">
            لم نجد أصنافاً مطابقة لبحثك
          </h3>
          <p className="text-xs text-slate-500">
            جرب البحث بكلمات أخرى أو اختر تصنيف "كامل المنيو".
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="mt-2 px-5 py-2 rounded-xl bg-[#DD6B20]/10 text-[#DD6B20] text-xs font-bold border border-[#DD6B20]/25 hover:bg-[#DD6B20]/15 transition-colors cursor-pointer"
          >
            إعادة تعيين الفلتر
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              revealDelay={Math.min(index * 60, 300)}
              onOpenDetails={(p) => onNavigateToProduct(p.id)}
            />
          ))}

        </div>
      )}

      {/* Delivery callout banner in menu */}
      <div className="bg-white border border-[#DD6B20]/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 shadow-xs">
        <div className="flex items-center gap-3 text-right">
          <div className="w-10 h-10 rounded-xl bg-[#DD6B20]/10 text-[#DD6B20] flex items-center justify-center shrink-0">
            <Bike className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">تريد استلام طلبك أو توصيله لبيتك؟</span>
            <span className="text-[11px] text-slate-500">
              الاستلام فوري من رافدية. وإذا كنت خارج رافدية سجل منطقتك لنجهز خطة التوصيل!
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenDeliverySurvey}
          className="text-xs font-bold text-[#DD6B20] hover:text-[#C2410C] hover:underline shrink-0 cursor-pointer"
        >
          قياس الطلب على التوصيل في منطقتك ←
        </button>
      </div>

    </div>
  );
};
