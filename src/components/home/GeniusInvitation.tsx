import { Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { PremiumButton } from '../ui/PremiumButton';
import { Reveal } from '../motion/Reveal';

export function GeniusInvitation({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const reduced = useReducedMotion();
  return <section className="genius-invitation">
    <Reveal className="genius-invite-copy">
      <span className="section-kicker">03 / اختيار على ذوقكم</span>
      <h2>إنت عليك اللَمّة.<br /><em>إحنا علينا الحسبة.</em></h2>
      <p>كم شخص معك؟ قديش الميزانية؟ خلّي Genius يقترح تشكيلات من المنيو، وإنت اختار اللي بناسبكم.</p>
      <PremiumButton variant="dark" onClick={() => onNavigate('genius')}>اكتشف تشكيلتك</PremiumButton>
    </Reveal>
    <div className="genius-invite-art">
      <motion.div className="genius-paper"
        initial={reduced ? false : { opacity: 0, y: 35, rotate: -12 }}
        whileInView={{ opacity: 1, y: 0, rotate: reduced ? 0 : -4 }}
        whileHover={reduced ? undefined : { y: -6, rotate: 0 }}
        viewport={{ once: true, amount: .2 }}
        transition={{ type: 'spring', stiffness: 90, damping: 18 }}>
        <div className="genius-paper-top"><Sparkles size={22} /><span lang="en">KÖMÜR GENIUS</span></div>
        <h3>كل لَمّة إلها ذوق.</h3>
        {['عدد الأشخاص', 'ميزانيتكم', 'الطعم المفضل'].map((label, index) => <motion.div key={label} className="genius-paper-row"
          initial={reduced ? false : { opacity: 0, x: 12 }}
          whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          transition={{ duration: reduced ? 0 : .45, delay: reduced ? 0 : .12 * index }}>
          <span>0{index + 1}</span><strong>{label}</strong>
        </motion.div>)}
        <p>اختيارات محسوبة. متعة على ذوقك.</p>
        <span className="receipt-bars" aria-hidden="true" />
      </motion.div>
      <span className="genius-invite-note">لَمّة حلوة، من أول اختيار.</span>
    </div>
  </section>;
}
