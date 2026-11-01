import { useState } from 'react';
import type { GeniusInput, Preference } from '../../../server/genius/types';
const steps=['كم شخص معك؟','قديش ميزانيتك؟','شو بتحبوا أكثر؟'];
export function GeniusForm({busy,onSubmit}:{busy:boolean;onSubmit:(input:GeniusInput)=>void}) {
 const [step,setStep]=useState(0);
 const [input,setInput]=useState<GeniusInput>({people:4,budget:80,preference:'balanced'});
 const valid=Number.isInteger(input.people) && input.people>=1 && input.people<=50 && Number.isFinite(input.budget) && input.budget>0 && input.budget<=5000;
 return <form className="signature-panel genius-form" onSubmit={e=>{e.preventDefault();if(valid)onSubmit(input);}}>
 <nav aria-label="خطوات التفضيلات" className="genius-steps">{steps.map((label,i)=><button key={label} type="button" aria-current={step===i?'step':undefined} onClick={()=>setStep(i)}><span>{i+1}</span>{label}</button>)}</nav>
 <div key={step} className="genius-step animate-soft-fade">
 <span className="eyebrow">خطوة {step+1} من 3</span><h2>{steps[step]}</h2>
 {step===0 && <label>عدد الأشخاص<input type="number" min="1" max="50" step="1" value={input.people} onChange={e=>setInput({...input,people:e.target.valueAsNumber})}/><small>لَمّة صغيرة أو كبيرة؟ من 1 إلى 50 شخصاً.</small></label>}
 {step===1 && <label>ميزانية التشكيلة بالشيكل<input type="number" min=".01" max="5000" step=".01" value={input.budget} onChange={e=>setInput({...input,budget:e.target.valueAsNumber})}/><small>الميزانية للتشكيلة الجديدة فقط؛ لا تشمل السلة الحالية.</small></label>}
 {step===2 && <fieldset><legend className="mb-4">اختار القوام المفضل</legend><div className="taste-options">{([['balanced','متوازن','تنوع بين الأصناف'],['crispy','مقرمش','قوام مقرمش'],['creamy','كريمي','قوام غني وناعم']] as const).map(([value,label,description])=><label key={value}><input type="radio" name="taste" checked={input.preference===value} onChange={()=>setInput({...input,preference:value as Preference})}/><strong>{label}</strong><small>{description}</small></label>)}</div><p className="mt-4 text-sm text-stone-600">تفضيل القوام يؤثر بالترتيب فقط عند توفر توصيف معتمد من المطعم.</p></fieldset>}
 </div>
 {!valid && <p role="alert" className="status-notice">عدد صحيح من 1 إلى 50، وميزانية أكبر من صفر وحتى 5000 شيكل.</p>}
 <div className="flex flex-wrap gap-3 mt-6">{step>0 && <button type="button" className="signature-button secondary" onClick={()=>setStep(step-1)}>السابق</button>}{step<2?<button type="button" disabled={!valid} className="signature-button" onClick={()=>setStep(step+1)}>التالي</button>:<button disabled={busy || !valid} className="signature-button">{busy?'نحسب الاختيارات…':'اكتشف تشكيلتك'}</button>}</div>
 </form>;
}
