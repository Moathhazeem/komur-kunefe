import type { GeniusInput, GeniusResponse, SelectionLine } from '../../server/genius/types';
export async function getRecommendations(input:GeniusInput, signal?:AbortSignal):Promise<GeniusResponse> {
 const res=await fetch('/api/genius/recommend',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input),signal});
 const data=await res.json();if(!res.ok)throw new Error(data.error || 'تعذر جلب التوصيات');return data;
}
export async function validateSelection(items:SelectionLine[]) {
 const res=await fetch('/api/cart/quote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items})});
 const data=await res.json();if(!res.ok)throw new Error(data.error || 'تغيرت بيانات التشكيلة');
 if(data.items.some((line:SelectionLine)=>items.find(i=>i.productId===line.productId && i.variantId===line.variantId)?.price!==line.price))throw new Error('تغير سعر صنف. أعد الحساب');
 return data as {items:SelectionLine[];total:number};
}
