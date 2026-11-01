import { useEffect, useRef, useState } from 'react';
import type { CartItem, Product } from '../types';
import type { GeniusInput, GeniusResponse } from '../../server/genius/types';
import { getRecommendations } from '../services/geniusApi';
import { GeniusForm } from '../components/genius/GeniusForm';
import { RecommendationCard } from '../components/genius/RecommendationCard';
export function GeniusPage({products,onAdd,onOpenCart}:{products:Product[];onAdd:(items:CartItem[])=>void;onOpenCart:()=>void}) {
 const [response,setResponse]=useState<GeniusResponse|null>(null);
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 const request=useRef<AbortController|null>(null);
 useEffect(()=>()=>request.current?.abort(),[]);
 async function calculate(input:GeniusInput){
  request.current?.abort();const controller=new AbortController();request.current=controller;
  setBusy(true);setError('');setResponse(null);
  try{const result=await getRecommendations(input,controller.signal);if(!controller.signal.aborted)setResponse(result);}
  catch(error){if(!controller.signal.aborted)setError(error instanceof Error?error.message:'تعذر جلب الاختيارات');}
  finally{if(!controller.signal.aborted)setBusy(false);}
 }
 return <div className="signature-page">
 <header className="genius-hero"><div><span className="eyebrow" lang="en">KÖMÜR GENIUS</span><h1>إحكيلنا عن لَمّتكم…<br/><em>وخلّي الكنافة علينا.</em></h1><p>أصناف من المنيو، اختيارات على ميزانيتك. نحسب التشكيلات المتاحة ونخليك تقارن وتعدّل.</p></div><div className="genius-seal" aria-hidden="true">K<span>GENIUS</span></div></header>
 <GeniusForm busy={busy} onSubmit={calculate}/>
 {error && <p role="alert" className="status-notice mt-6">{error}</p>}
 {busy && <p role="status" className="status-notice mt-6">جارٍ حساب التركيبات المتاحة من المنيو…</p>}
 {response && <section className="mt-12" aria-label="نتائج التوصيات"><div className="flex flex-wrap justify-between gap-4 mb-6"><div><span className="eyebrow">اختيارات حسب ميزانيتك</span><h2 className="text-3xl font-black mt-2">لَمّتكم تستاهل.</h2></div><button className="signature-button secondary" onClick={onOpenCart}>اعرض السلة</button></div><p className="status-notice mb-6">{response.metadata.warning} السعر هو سعر الطلب عبر الموقع للاستلام من الفرع.</p>
 {response.recommendations.length?<div className="signature-grid">{response.recommendations.map(rec=><RecommendationCard key={rec.id} recommendation={rec} budget={response.constraints.budget} catalog={response.metadata.catalog} products={products} onAdd={onAdd}/>)}</div>:<div className="signature-panel"><h3 className="text-xl font-black">ما لقينا تشكيلة ضمن الشروط الحالية</h3><p className="mt-3">جرّب رفع الميزانية أو تقليل عدد الأشخاص، أو راجع المنيو مباشرة. البحث محدود ولا يضمن فحص كل الاحتمالات.</p></div>}</section>}
 </div>;
}
