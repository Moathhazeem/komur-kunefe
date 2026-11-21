import { LayoutGroup, motion, useReducedMotion } from 'motion/react';
import React, { useMemo } from 'react';
import { Flame, Search, SlidersHorizontal } from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { ProductCard } from '../components/ProductCard';

function searchText(text: string) {
  return text.toLowerCase().replace(/[\u064B-\u065F\u0670ـ]/g, '').replace(/[أإآٱ]/g, 'ا');
}

interface MenuPageProps {
  filters: { category: string; query: string };
  onFilterChange: (filters: { category: string; query: string }) => void;
  products: Product[];
  onAddToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
  onOpenDeliverySurvey: () => void;
  onNavigateToProduct: (productId: string) => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({ products, filters, onFilterChange, onOpenDeliverySurvey, onNavigateToProduct }) => {
  const { category: selectedCategory, query: searchQuery } = filters;
  const catalog = useMemo(() => products.map(product => ({
    product, text: searchText(product.name + ' ' + (product.description ?? '')),
  })), [products]);
  const reduceMotion = useReducedMotion();
  const counts = useMemo(() => {
    const totals = new Map<string, number>();
    for (const product of products) totals.set(product.category, (totals.get(product.category) ?? 0) + 1);
    return totals;
  }, [products]);
  const categories = [
    { id: 'all', label: 'كل الأصناف' },
    { id: 'charcoal', label: 'على الفحم' },
    { id: 'nutella', label: 'الشوكولاتة' },
    { id: 'nawashef', label: 'نواشف' },
    { id: 'oriental', label: 'حلويات شرقية' },
    { id: 'beverages', label: 'مشروبات' },
    { id: 'other', label: 'أخرى' },
  ];
  const query = searchText(searchQuery.trim());
  const filteredProducts = useMemo(() => catalog.filter(({ product, text }) =>
    (selectedCategory === 'all' || product.category === selectedCategory) && text.includes(query)
  ).map(({ product }) => product), [catalog, query, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#FBF8F2] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <header className="grid gap-8 border-b border-[#35241A]/10 pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-2xl"><span className="inline-flex items-center gap-2 text-xs font-black text-[#C7652D]"><Flame className="h-4 w-4" /> تُخبز طازجة عند الطلب</span><h1 className="mt-3 text-4xl font-black text-[#211814] sm:text-6xl">المنيو</h1><p className="mt-4 text-sm leading-8 text-[#75675C] sm:text-base">اختار صنفك، حدّد الحجم، وخلي الباقي علينا. الأسعار والخيارات المعروضة مأخوذة من منيو الفرع مباشرة.</p></div>
          <div className="rounded-2xl border border-[#DAB775]/35 bg-[#F0E8DC] px-5 py-4 text-sm font-bold text-[#35241A]"><span className="block text-xs text-[#75675C]">ملاحظة من الفرع</span><span className="mt-1 block">يمكن استبدال القطر العادي بقطر صحي بأحجام متعددة تبدأ من 2 شيكل.</span></div>
        </header>

        <div className="sticky top-[74px] z-20 -mx-4 mt-8 border-y border-[#35241A]/10 bg-[#FBF8F2]/95 px-4 py-3 backdrop-blur-xl sm:mx-0 sm:rounded-2xl sm:border sm:px-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <LayoutGroup>
              <nav aria-label="تصنيفات المنيو" className="scrollbar-none flex gap-2 overflow-x-auto pb-1 touch-pan-x">
                {categories.map(category => {
                  const active = selectedCategory === category.id;
                  return (
                    <button key={category.id} type="button" aria-pressed={active}
                      onClick={() => onFilterChange({ ...filters, category: category.id })}
                      className="relative isolate inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border border-[#35241A]/10 bg-white px-4 text-xs font-black text-[#75675C] aria-pressed:text-[#DAB775]">
                      {active && <motion.span aria-hidden="true" layoutId={reduceMotion ? undefined : 'menu-active'}
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        className="absolute inset-0 -z-10 rounded-full bg-[#17120F]" />}
                      {category.label}
                      <bdi>{category.id === 'all' ? products.length : counts.get(category.id) ?? 0}</bdi>
                    </button>
                  );
                })}
              </nav>
            </LayoutGroup>
            <div className="relative w-full lg:max-w-xs"><Search className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#75675C]" /><input type="search" value={searchQuery} onChange={(event) => onFilterChange({ ...filters, query: event.target.value })} placeholder="ابحث عن كنافة..." aria-label="البحث في المنيو" className="w-full min-h-[44px] rounded-full border border-[#35241A]/10 bg-white py-2.5 pl-4 pr-10 text-sm text-[#211814] placeholder:text-[#A99B90] focus:border-[#C7652D] focus:outline-none focus:ring-2 focus:ring-[#C7652D]/15" /></div>
          </div>
        </div>

        <div className="mt-9 flex items-center justify-between"><p role="status" className="text-xs font-bold text-[#75675C]">{filteredProducts.length} أصناف متاحة للاكتشاف</p><span className="hidden items-center gap-2 text-xs font-bold text-[#75675C] sm:flex"><SlidersHorizontal className="h-4 w-4" /> اختر حسب ذوقك</span></div>
        {filteredProducts.length ? <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filteredProducts.map((product, index) => <ProductCard key={product.id} product={product} revealDelay={Math.min(index * 60, 300)} onOpenDetails={() => onNavigateToProduct(product.id)} />)}</div> : <div className="mt-6 rounded-[28px] border border-dashed border-[#C7652D]/30 bg-white px-6 py-20 text-center"><Flame className="mx-auto h-10 w-10 text-[#C7652D]" /><h2 className="mt-4 text-xl font-black text-[#211814]">ما لقينا هذا الصنف</h2><p className="mt-2 text-sm text-[#75675C]">جرّب كلمة ثانية أو ارجع لكل الأصناف.</p><button type="button" onClick={() => { onFilterChange({ category: 'all', query: '' }); }} className="mt-5 inline-flex min-h-[44px] items-center rounded-full bg-[#C7652D] px-5 py-3 text-xs font-black text-white active:scale-95">إعادة ضبط البحث</button></div>}

        <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-[24px] bg-[#35241A] p-6 text-[#F7F0E5] sm:flex-row sm:items-center sm:p-8"><div><h2 className="text-lg font-black">تحتاج توصيل؟</h2><p className="mt-1 text-xs leading-6 text-[#D5C7B9]">الطلب الحالي للاستلام من فرع رافدية. سجل اهتمامك بالتوصيل لنخبرك عند توفره في منطقتك.</p></div><button type="button" onClick={onOpenDeliverySurvey} className="inline-flex min-h-[44px] items-center shrink-0 rounded-full border border-[#DAB775]/40 px-5 py-3 text-xs font-black text-[#DAB775] hover:bg-[#DAB775]/10 active:scale-95">سجل اهتمامك بالتوصيل</button></div>
      </div>
    </div>
  );
};
