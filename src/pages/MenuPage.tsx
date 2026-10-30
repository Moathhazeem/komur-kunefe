import React, { useState, useMemo } from 'react';
import { Flame, Search, Filter, Info, Bike } from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { ProductCard } from '../components/ProductCard';

interface MenuPageProps {
  products: Product[];
  onAddToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
  onOpenDeliverySurvey: () => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({ products, onAddToCart, onOpenDeliverySurvey }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'كامل المنيو' },
    { id: 'charcoal', label: 'كنافة على الفحم' },
    { id: 'nutella', label: 'كنافة نوتيلا ومودرن' },
    { id: 'nawashef', label: 'نواشف العيد (موسمي)' },
    { id: 'other', label: 'مشروبات وأصناف أخرى' },
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Page Title & Philosophy */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 bg-white text-orange-700 border border-orange-200 px-3.5 py-1 rounded-full text-xs font-bold shadow-xs">
          <Flame className="w-4 h-4 text-orange-500" />
          <span>طازجة وتُخبز فور الطلب على جمر الفحم</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 font-heading">
          منيو Kömür Künefe
        </h1>
        <p className="text-sm sm:text-base text-slate-500">
          اختر صنفك المفضل وحدد الحجم المناسب لك. جميع الطلبات تُسلَّم ساخنة ومجهزة من فرع رافدية - الشارع الرئيسي.
        </p>

        {/* Pricing notice */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 text-xs text-slate-600 flex items-center justify-center gap-2 text-right">
          <Info className="w-4 h-4 text-orange-500 shrink-0" />
          <span>
            الأسعار المعروضة بالشيكل (₪) وهي أسعار السوق التقديرية الحالية. يمكنك طلب أحجام متعددة (فردي، سدر عائلي، علب مناسبات).
          </span>
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
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
                  active
                    ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:text-orange-600'
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
            placeholder="ابحث عن صنف (خشنة، نوتيلا، معمول...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-orange-100 rounded-3xl p-12 text-center space-y-3 shadow-xs">
          <Filter className="w-10 h-10 text-orange-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 font-heading">
            لم نجد أصنافاً مطابقة لبحثك
          </h3>
          <p className="text-xs text-slate-500">
            جرب البحث بكلمات أخرى أو اختر تصنيف "كامل المنيو".
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="mt-2 px-5 py-2 rounded-xl bg-orange-50 text-orange-700 text-xs font-bold border border-orange-200 hover:bg-orange-100 transition-colors"
          >
            إعادة تعيين الفلتر
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      )}

      {/* Delivery callout banner in menu */}
      <div className="bg-white border border-orange-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 shadow-xs">
        <div className="flex items-center gap-3 text-right">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
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
          onClick={onOpenDeliverySurvey}
          className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline shrink-0"
        >
          قياس الطلب على التوصيل في منطقتك ←
        </button>
      </div>

    </div>
  );
};
