import { useMemo, useState } from 'react';
import { ArrowLeft, Flame, Search, X } from 'lucide-react';
import type { Product, ProductVariant } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ProductImage } from '../components/ProductImage';
import { MAIN_MENU_IMAGES } from '../data/brandImages';
interface MenuPageProps {
  products: Product[];
  onNavigate: (tab:string)=>void;
  onAddToCart: (product:Product,variant:ProductVariant,quantity:number)=>void;
  onOpenDeliverySurvey:()=>void;
  onNavigateToProduct:(productId:string)=>void;
}
const categoryNames: Record<string,string> = {charcoal:'على الفحم',nutella:'الشوكولاتة',nawashef:'النواشف',other:'أصناف أخرى',offers:'عروض',oriental:'حلويات شرقية',beverages:'مشروبات'};
export function MenuPage({products,onNavigate,onOpenDeliverySurvey,onNavigateToProduct}:MenuPageProps) {
  const [category,setCategory]=useState('all');
  const [query,setQuery]=useState('');
  const categories=useMemo(()=>['all',...new Set(products.map(p=>p.category))], [products]);
  const results=useMemo(()=>products.filter(p=>(category==='all'||p.category===category) &&
    (!query.trim() || (p.name+' '+p.description).toLowerCase().includes(query.trim().toLowerCase()))),[products,category,query]);
  return <div className="menu-editorial">
    <header className="menu-cover">
      <div className="menu-cover-copy"><span className="section-kicker light">KÖMÜR / المنيو</span><h1>كل مزاج،<br/><em>إله لقمة.</em></h1><p>من الكنافة النابلسية للإسطنبولية.<br/>اختار اللي بتحبه، حدّد حجمه، واستلمه من الفرع.</p><span className="menu-cover-note"><Flame size={15}/> من قلب نابلس، على جمر الفحم.</span></div>
      <div className="menu-cover-photo"><ProductImage src={MAIN_MENU_IMAGES.pistachioBaklava} name="مختارات من حلويات الفستق" editorial eager/></div>
    </header>
    <div className="brand-container">
      <div className="menu-tools">
        <nav className="menu-categories" aria-label="تصنيفات المنيو">{categories.map(id=><button key={id} aria-pressed={category===id} onClick={()=>setCategory(id)}>{id==='all'?'كل المنيو':categoryNames[id] || id}<span>{id==='all'?products.length:products.filter(p=>p.category===id).length}</span></button>)}</nav>
        <label className="menu-search"><Search size={17}/><span className="sr-only">ابحث في المنيو</span><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="شو مشتهي اليوم؟"/>{query && <button aria-label="مسح البحث" onClick={()=>setQuery('')}><X size={16}/></button>}</label>
      </div>
      <div className="menu-results-heading"><span>{results.length} أصناف للاكتشاف</span><button onClick={()=>onNavigate('genius')}>محتار للَمّة؟ خليها على Genius <ArrowLeft size={16}/></button></div>
      {results.length ? <div className="menu-products">{results.map((product,index)=><ProductCard key={product.id} product={product} revealDelay={Math.min(index*50,200)} onOpenDetails={p=>onNavigateToProduct(p.id)}/>)}</div>:
        <div className="menu-empty"><Search size={32} strokeWidth={1}/><h2>لسه في طعم بستناك.</h2><p>ما لقينا صنف مطابق. جرّب كلمة ثانية أو اكتشف كل المنيو.</p><button className="brand-button dark" onClick={()=>{setCategory('all');setQuery('');}}>اعرض كل الأصناف</button></div>}
      <aside className="menu-pickup"><div><span className="section-kicker">من الفرع، ليدك.</span><h2>اطلبها. وتعال خدها دافية.</h2><p>الطلبات حالياً للاستلام من رافدية. حاب يصلك الطلب لمنطقتك؟ سجل اهتمامك.</p></div><button className="brand-text-link ink" onClick={onOpenDeliverySurvey}>سجل اهتمامك بالتوصيل <ArrowLeft size={18}/></button></aside>
    </div>
  </div>;
}
