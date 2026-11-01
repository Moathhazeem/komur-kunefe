import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { PremiumButton } from '../ui/PremiumButton';
import { useState } from 'react';
import type { Product, CartItem } from '../../types';
import type { Recommendation, SelectionLine } from '../../../server/genius/types';
import { quantityLimit } from '../../../shared/commerce';
import { ProductImage } from '../ProductImage';
import { validateSelection } from '../../services/geniusApi';
export function RecommendationCard({recommendation,budget,catalog,products,onAdd}:{recommendation:Recommendation;budget:number;catalog:SelectionLine[];products:Product[];onAdd:(items:CartItem[])=>void}) {
 const reduced=useReducedMotion();
 const [items,setItems]=useState(recommendation.items);
 const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
 const total=items.reduce((n,i)=>n+Math.round(i.price*100)*i.quantity,0)/100;
 const merged=new Map<string,number>();
 items.forEach(i=>{const key=i.productId+'|'+i.variantId;merged.set(key,(merged.get(key)||0)+i.quantity);});
 const invalid=total>budget || items.some(i=>{
  const p=products.find(p=>p.id===i.productId);const v=p?.variants.find(v=>v.id===i.variantId);
  return !p?.isAvailable || !v || !Number.isInteger(i.quantity) || i.quantity<1 || (merged.get(i.productId+'|'+i.variantId)||0)>quantityLimit(v);
 });
 const changed=JSON.stringify(items)!==JSON.stringify(recommendation.items);
 async function add(){
  setBusy(true);setMessage('');
  try {
   await validateSelection(items);
   const selection=items.map(i=>{const product=products.find(p=>p.id===i.productId)!;const variant=product.variants.find(v=>v.id===i.variantId)!;return {product,variant,quantity:i.quantity};});
   onAdd(selection);setMessage('تمت إضافة التشكيلة إلى السلة');
  }catch(error){setMessage(error instanceof Error?error.message:'تعذر إضافة التشكيلة');}finally{setBusy(false);}
 }
 function update(index:number,line:SelectionLine){setItems(items.map((i,n)=>n===index?line:i));setMessage('');}
 return <motion.article className="signature-panel recommendation-card" initial={reduced ? false : {opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.1}} transition={{duration:reduced?0:.5}}>
 <span className="eyebrow">KÖMÜR / {recommendation.id.replace('selection-','0')}</span><h2>{recommendation.title}</h2>
 <div className="recommendation-photo"><ProductImage src={products.find(p=>p.id===items[0]?.productId)?.image} name={items[0]?.name || 'التشكيلة'}/></div>
 <ul className="selection-lines">{items.map((item,index)=><li key={index}>
 <label>الصنف والحجم<select value={item.productId+'|'+item.variantId} onChange={e=>{const choice=catalog.find(c=>c.productId+'|'+c.variantId===e.target.value);if(choice)update(index,{...choice,quantity:item.quantity});}}>{catalog.map(c=><option key={c.productId+'|'+c.variantId} value={c.productId+'|'+c.variantId}>{c.name} · {c.variantName} · {c.price} ₪</option>)}</select></label>
 <div className="flex items-center justify-between gap-3"><label>الكمية<input type="number" min="1" max="20" value={item.quantity} onChange={e=>update(index,{...item,quantity:e.target.valueAsNumber})}/></label><strong>{Number.isFinite(item.quantity)?(item.price*item.quantity).toFixed(2):'—'} ₪</strong></div>
 </li>)}</ul>
 <p className="text-sm leading-7 text-stone-600">{recommendation.explanation}</p>
 <p className="text-xs mt-3">{changed?'تم تعديل التشكيلة؛ توصيف التغطية الأصلي لم يعد سارياً.':recommendation.servings!==null?'الحصص المعتمدة: '+recommendation.servings:'تغطية عدد الأشخاص غير مضمونة'}</p>
 <div className="selection-total"><span>المجموع<span className="animated-total"><AnimatePresence mode="popLayout" initial={false}><motion.strong key={Number.isFinite(total)?total:0} initial={reduced ? false : {opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:reduced?0:-10}} transition={{duration:reduced?0:.2}}>{Number.isFinite(total)?total.toFixed(2):'—'} ₪</motion.strong></AnimatePresence></span></span><span>المتبقي<strong>{Number.isFinite(total)?(budget-total).toFixed(2):'—'} ₪</strong></span></div>
 {invalid && <p role="alert" className="status-notice">التشكيلة تتجاوز الميزانية أو حد الكمية، أو تغير توفر صنف. عدّل الاختيار قبل الإضافة.</p>}
 <PremiumButton className="w-full" disabled={invalid} busy={busy} onClick={add}>{busy?'نتحقق من المنيو…':'أضف التشكيلة كاملة'}</PremiumButton>
 {message && <p role="status" className="status-notice mt-3">{message}</p>}
 </motion.article>;
}
