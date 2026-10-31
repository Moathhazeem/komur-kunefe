import React, { useMemo, useState } from 'react';
import { Flame, Search, SlidersHorizontal } from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { ProductCard } from '../components/ProductCard';

interface MenuPageProps {
  products: Product[];
  onAddToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
  onOpenDeliverySurvey: () => void;
  onNavigateToProduct: (productId: string) => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({ products, onOpenDeliverySurvey, onNavigateToProduct }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const categories = [
    { id: 'all', label: 'كل الأصناف' },
    { id: 'charcoal', label: 'على الفحم' },
    { id: 'nutella', label: 'الشوكولاتة' },
    { id: 'nawashef', label: 'نواشف' },
    { id: 'other', label: 'أخرى' },
  ];
  const filteredProducts = useMemo(() => products.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    return matchesCategory && (!query || product.name.toLowerCase().includes(query) || product.description.toLowerCase().includes(query));
  }), [products, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#FBF8F2] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <header className="grid gap-8 border-b border-[#35241A]/10 pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-2xl"><span className="inline-flex items-center gap-2 text-xs font-black text-[#C7652D]"><Flame className="h-4 w-4" /> تُخبز طازجة عند الطلب</span><h1 className="mt-3 text-4xl font-black text-[#211814] sm:text-6xl">المنيو</h1><p className="mt-4 text-sm leading-8 text-[#75675C] sm:text-base">اختار صنفك، حدّد الحجم، وخلي الباقي علينا. الأسعار والخيارات المعروضة مأخوذة من منيو الفرع مباشرة.</p></div>
          <div className="rounded-2xl border border-[#DAB775]/35 bg-[#F0E8DC] px-5 py-4 text-sm font-bold text-[#35241A]"><span className="block text-xs text-[#75675C]">ملاحظة من الفرع</span><span className="mt-1 block">إمكانية إضافة بوظة لأي صنف بـ 3 شيكل.</span></div>
        </header>

        <div className="sticky top-[74px] z-20 -mx-4 mt-8 border-y border-[#35241A]/10 bg-[#FBF8F2]/95 px-4 py-4 backdrop-blur-xl sm:mx-0 sm:rounded-2xl sm:border sm:px-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">{categories.map((category) => <button key={category.id} type="button" onClick={() => setSelectedCategory(category.id)} className={`whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-black transition-colors ${selectedCategory === category.id ? 'bg-[#17120F] text-[#DAB775]' : 'border border-[#35241A]/10 bg-white text-[#75675C] hover:border-[#C7652D]/40 hover:text-[#C7652D]'}`}>{category.label}</button>)}</div>
            <div className="relative w-full lg:max-w-xs"><Search className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#75675C]" /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="ابحث عن كنافة..." aria-label="البحث في المنيو" className="w-full rounded-full border border-[#35241A]/10 bg-white py-3 pl-4 pr-10 text-sm text-[#211814] placeholder:text-[#A99B90] focus:border-[#C7652D] focus:outline-none focus:ring-2 focus:ring-[#C7652D]/15" /></div>
          </div>
        </div>

        <div className="mt-9 flex items-center justify-between"><p className="text-xs font-bold text-[#75675C]">{filteredProducts.length} أصناف متاحة للاكتشاف</p><span className="hidden items-center gap-2 text-xs font-bold text-[#75675C] sm:flex"><SlidersHorizontal className="h-4 w-4" /> اختر حسب ذوقك</span></div>
        {filteredProducts.length ? <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filteredProducts.map((product, index) => <ProductCard key={product.id} product={product} revealDelay={Math.min(index * 60, 300)} onOpenDetails={() => onNavigateToProduct(product.id)} />)}</div> : <div className="mt-6 rounded-[28px] border border-dashed border-[#C7652D]/30 bg-white px-6 py-20 text-center"><Flame className="mx-auto h-10 w-10 text-[#C7652D]" /><h2 className="mt-4 text-xl font-black text-[#211814]">ما لقينا هذا الصنف</h2><p className="mt-2 text-sm text-[#75675C]">جرّب كلمة ثانية أو ارجع لكل الأصناف.</p><button type="button" onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }} className="mt-5 rounded-full bg-[#C7652D] px-5 py-3 text-xs font-black text-white">إعادة ضبط البحث</button></div>}

        <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-[24px] bg-[#35241A] p-6 text-[#F7F0E5] sm:flex-row sm:items-center sm:p-8"><div><h2 className="text-lg font-black">تحتاج توصيل؟</h2><p className="mt-1 text-xs leading-6 text-[#D5C7B9]">الطلب الحالي للاستلام من فرع رافدية. سجل اهتمامك بالتوصيل لنخبرك عند توفره في منطقتك.</p></div><button type="button" onClick={onOpenDeliverySurvey} className="shrink-0 rounded-full border border-[#DAB775]/40 px-5 py-3 text-xs font-black text-[#DAB775] hover:bg-[#DAB775]/10">سجل اهتمامك بالتوصيل</button></div>
      </div>
    </div>
  );
};
