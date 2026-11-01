import { useState } from 'react';
import { ArrowLeft, ArrowRight, Coffee, Flame, Layers } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { GeniusInput } from '../../../server/genius/types';
import { PremiumButton } from '../ui/PremiumButton';
import { cinematicEase } from '../motion/Reveal';

const steps = ['كم شخص معك؟', 'قديش ميزانيتك؟', 'شو بتحبوا أكثر؟'];
const tastes = [
  { value: 'balanced', label: 'متوازن', description: 'تنوع بين الأصناف', icon: Layers },
  { value: 'crispy', label: 'مقرمش', description: 'قوام مقرمش', icon: Flame },
  { value: 'creamy', label: 'كريمي', description: 'قوام غني وناعم', icon: Coffee },
] as const;

export function GeniusForm({ busy, onSubmit }: { busy: boolean; onSubmit: (input: GeniusInput) => void }) {
  const [step, setStep] = useState(0);
  const [input, setInput] = useState<GeniusInput>({ people: 4, budget: 80, preference: 'balanced' });
  const reduced = useReducedMotion();
  const valid = Number.isInteger(input.people) && input.people >= 1 && input.people <= 50 && Number.isFinite(input.budget) && input.budget > 0 && input.budget <= 5000;
  return <form className="signature-panel genius-form" onSubmit={e => { e.preventDefault(); if (!valid || busy) return; if (step < 2) setStep(step + 1); else onSubmit(input); }}>
    <nav aria-label="خطوات التفضيلات" className="genius-steps">
      {steps.map((label, i) => <motion.button key={label} type="button" aria-current={step === i ? 'step' : undefined} onClick={() => setStep(i)} whileTap={reduced ? undefined : { scale: .97 }}>
        <motion.span animate={{ scale: reduced ? 1 : step === i ? 1.1 : 1 }}>{i + 1}</motion.span>{label}
      </motion.button>)}
    </nav>
    <AnimatePresence initial={false} mode="wait">
      <motion.div key={step} className="genius-step"
        initial={reduced ? false : { opacity: 0, x: -18 }}
        animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: reduced ? 0 : 18 }}
        transition={{ duration: reduced ? 0 : .25, ease: cinematicEase }}>
        <span className="eyebrow">خطوة {step + 1} من 3</span><h2>{steps[step]}</h2>
        {step === 0 && <label>عدد الأشخاص<input type="number" min="1" max="50" step="1" value={Number.isNaN(input.people) ? '' : input.people} onChange={e => setInput({ ...input, people: e.target.valueAsNumber })} /><small>لَمّة صغيرة أو كبيرة؟ من 1 إلى 50 شخصاً.</small></label>}
        {step === 1 && <label>ميزانية التشكيلة بالشيكل<input type="number" min=".01" max="5000" step=".01" value={Number.isNaN(input.budget) ? '' : input.budget} onChange={e => setInput({ ...input, budget: e.target.valueAsNumber })} /><small>الميزانية للتشكيلة الجديدة فقط؛ لا تشمل السلة الحالية.</small></label>}
        {step === 2 && <fieldset>
          <legend className="mb-4">اختار القوام المفضل</legend>
          <div className="taste-options">{tastes.map(({ value, label, description, icon: Icon }) => <motion.label key={value} whileTap={reduced ? undefined : { scale: .98 }}>
            <input type="radio" name="taste" checked={input.preference === value} onChange={() => setInput({ ...input, preference: value })} />
            <Icon size={25} strokeWidth={1.4} aria-hidden="true" />
            <strong>{label}</strong><small>{description}</small>
          </motion.label>)}</div>
          <p className="mt-4 text-sm text-stone-600">تفضيل القوام يؤثر بالترتيب فقط عند توفر توصيف معتمد من المطعم.</p>
        </fieldset>}
      </motion.div>
    </AnimatePresence>
    {!valid && <p role="alert" className="status-notice">عدد صحيح من 1 إلى 50، وميزانية أكبر من صفر وحتى 5000 شيكل.</p>}
    <div className="flex flex-wrap gap-3 mt-6">
      {step > 0 && <PremiumButton variant="light" onClick={() => setStep(step - 1)} icon={<ArrowRight size={18} />}>السابق</PremiumButton>}
      {step < 2 ? <PremiumButton disabled={!valid} onClick={() => setStep(step + 1)} icon={<ArrowLeft size={18} />}>التالي</PremiumButton> : <PremiumButton type="submit" disabled={!valid} busy={busy}>{busy ? 'نحسب الاختيارات…' : 'اكتشف تشكيلتك'}</PremiumButton>}
    </div>
  </form>;
}
