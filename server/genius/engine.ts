import type { Product } from '../db';
import { PRICING_CONTEXT } from '../../shared/commerce';
import { normalize } from './normalization';
import { evaluate, type Candidate } from './scoring';
import type { GeniusInput, GeniusResponse, Preference } from './types';
const BEAM = 400;
export function validateInput(raw: unknown): GeniusInput {
 const r=raw as Partial<GeniusInput> | null;
 if(!r || !Number.isInteger(r.people) || r.people! < 1 || r.people! > 50 || typeof r.budget !== 'number' || !Number.isFinite(r.budget) || r.budget <= 0 || r.budget > 5000 || !['balanced','crispy','creamy'].includes(r.preference || '')) throw new Error('أدخل عدد أشخاص من 1 إلى 50 وميزانية حتى 5000 شيكل وذوقاً صحيحاً');
 return {people:r.people!,budget:Math.round(r.budget*100)/100,preference:r.preference as Preference};
}
export function recommend(products:Product[], input:GeniusInput): GeniusResponse {
 const budget=Math.round(input.budget*100);
 const options=normalize(products).filter(o=>o.cents<=budget);
 // If trusted coverage exists, only use trusted options; never infer servings from XS/S/M labels.
 const coverage=options.some(o=>o.servings !== null);
 const search=coverage ? options.filter(o=>o.servings!==null) : options;
 let beam:Candidate[]=[evaluate([],[],input.people,budget,input.preference)];
 for(let i=0;i<search.length;i++){
   const next:Candidate[]=[];
   for(const c of beam){
     const max=Math.min(search[i].limit, Math.floor((budget-c.cents)/search[i].cents), Math.max(0, Math.min(20,input.people+2)-c.units));
     for(let q=0;q<=max;q++) next.push(evaluate([...c.counts,q],search,input.people,budget,input.preference));
   }
   // Keep several costs and coverage levels so pruning does not keep only expensive packages.
   const buckets=new Map<string,Candidate>();
   next.sort((a,b)=>b.score-a.score || a.cents-b.cents || a.counts.join(',').localeCompare(b.counts.join(',')));
   for(const c of next){const key=[c.cents,Math.min(c.servings,input.people),c.units,c.flavors.join(',')].join('|');if(!buckets.has(key))buckets.set(key,c);}
   beam=[...buckets.values()].slice(0,BEAM);
 }
 const feasible=beam.filter(c=>c.units>0 && (!coverage || c.servings>=input.people));
 const chosen:Candidate[]=[];
 for(const sort of [
   (a:Candidate,b:Candidate)=>b.score-a.score || a.cents-b.cents,
   (a:Candidate,b:Candidate)=>a.cents-b.cents || b.score-a.score,
   (a:Candidate,b:Candidate)=>b.flavors.length-a.flavors.length || b.score-a.score]){
   const candidate=[...feasible].sort(sort).find(c=>chosen.every(x=>{
      const a=new Set(c.counts.flatMap((q,i)=>q?[search[i].productId]:[]));
      const b=new Set(x.counts.flatMap((q,i)=>q?[search[i].productId]:[]));
      return [...a].some(id=>!b.has(id)) || [...b].some(id=>!a.has(id));
   }));
   if(candidate)chosen.push(candidate);
 }
 return {
 recommendations:chosen.map((c,index)=>({id:'selection-'+index,title:index===0?'الاختيار الأقرب':index===1?'بديل بميزانية أخف':'تشكيلة مختلفة',
 items:c.counts.flatMap((q,i)=>q?[{productId:search[i].productId,variantId:search[i].variantId,name:search[i].name,variantName:search[i].variantName,price:search[i].price,quantity:q}]:[]),
 total:c.cents/100,remainingBudget:(budget-c.cents)/100,servings:coverage?c.servings:null,flavorTags:c.flavors,
 explanation:c.flavors.length ? 'نكهات معتمدة: '+c.flavors.join('، ') : 'اختيار بحسب تنوع الأصناف والسعر. بيانات النكهة والحصص المعتمدة غير متوفرة؛ لا نضمن عدد الحصص أو ملاءمة القوام.'})),
 constraints:{...input,pricingContext:PRICING_CONTEXT,coverageGuaranteed:coverage},
 metadata:{warning:coverage?'التغطية محسوبة من حصص معتمدة فقط؛ البحث محدود وقد لا يجد كل التركيبات.':'الحصص غير معتمدة بعد: عدد الأشخاص يضبط حد الكمية فقط ولا يضمن كفاية التشكيلة.',searchLimit:BEAM,catalog:options.map(({productId,variantId,name,variantName,price})=>({productId,variantId,name,variantName,price,quantity:1}))}
 };
}
