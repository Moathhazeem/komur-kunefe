import { ArrowLeft, Flame } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { ProductImage } from '../ProductImage';
import { PremiumButton } from '../ui/PremiumButton';
import { cinematicEase, Reveal } from '../motion/Reveal';
import { MAIN_MENU_IMAGES } from '../../data/brandImages';

export function CraftSection({ story, onNavigate }: { story?: string; onNavigate: (tab: string) => void }) {
  const reduced = useReducedMotion();
  return <section className="craft-section">
    <div className="craft-layout">
      <motion.div className="craft-photo"
        initial={reduced ? false : { opacity: 0, clipPath: 'inset(8% 8% 8% 8% round 28px)' }}
        whileInView={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0% round 28px)' }}
        viewport={{ once: true, amount: .15 }}
        transition={{ duration: reduced ? 0 : .9, ease: cinematicEase }}>
        <ProductImage src={MAIN_MENU_IMAGES.pistachioBaklava} name="تفاصيل الفستق والحلويات" editorial />
        <span className="craft-photo-label" lang="en">A LITTLE HEAT.<br />A LOT OF HEART.</span>
      </motion.div>
      <Reveal className="craft-copy" delay={.12}>
        <span className="section-kicker light">02 / حكاية الجمر</span>
        <Flame className="craft-flame" size={36} strokeWidth={1} />
        <h2>الطعم إله أصل.<br /><em>والجمر إله حكاية.</em></h2>
        <p>{story || 'الكنافة النابلسية على جمر الفحم. نكهة دافية، وتفاصيل بتخلّي كل لَمّة أحلى. اكتشف حكايتنا في رافدية.'}</p>
        <PremiumButton variant="ghost" onClick={() => onNavigate('story')} icon={<ArrowLeft size={18} />}>حكاية كُومُر</PremiumButton>
      </Reveal>
    </div>
  </section>;
}
