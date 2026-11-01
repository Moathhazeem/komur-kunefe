import { useRef, useState } from 'react';
import { ArrowDownLeft, ArrowLeft, ArrowRight, Flame, MapPin } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { MAIN_MENU_IMAGES } from '../../data/brandImages';
import { ProductImage } from '../ProductImage';
import { PremiumButton } from '../ui/PremiumButton';
import { cinematicEase, RevealLine } from '../motion/Reveal';

const slides = [
  { src: MAIN_MENU_IMAGES.nabulsiKnafeh, title: 'الكنافة النابلسية', note: 'ذهبية. دافية. نابلسية.' },
  { src: MAIN_MENU_IMAGES.pistachioBaklava, title: 'للفستق حكاية', note: 'تفاصيل حلوة، لقمة ورا لقمة.' },
  { src: MAIN_MENU_IMAGES.chocolate, title: 'مزاج الشوكولاتة', note: 'لما اللَمّة تحب التغيير.' },
];
export function BrandHero({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end start'] });
  const drift = useTransform(scrollYProgress, [0, 1], [0, -45]);
  const slide = slides[active];
  return <section ref={section} className="brand-hero">
    <div className="hero-ambient" aria-hidden="true" />
    <div className="hero-layout">
      <div className="hero-copy">
        <motion.p className="hero-kicker" initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }}><span className="ember-dot" /> من قلب نابلس، على جمر الفحم</motion.p>
        <h1><RevealLine delay={.08}>مش بس كنافة<span className="hero-period">.</span></RevealLine><RevealLine delay={.2} className="hero-title-accent">تجربة <em>عالجمر.</em></RevealLine></h1>
        <motion.p className="hero-description" initial={reduced ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6, delay: .3, ease: cinematicEase }}>قرمشة بتسمعها. دفا بتحسّه.<br />وطعم بيخلّي كل لَمّة أحلى.</motion.p>
        <motion.div className="hero-actions" initial={reduced ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6, delay: .4, ease: cinematicEase }}>
          <PremiumButton onClick={() => onNavigate('menu')}>اطلب كنافتك</PremiumButton>
          <PremiumButton variant="ghost" onClick={() => onNavigate('story')} icon={<ArrowDownLeft size={18} />}>اكتشف حكايتنا</PremiumButton>
        </motion.div>
        <motion.div className="hero-origin" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .55 }}><span><MapPin size={15} /> رافدية، نابلس</span><i /><span>استلام طازج من الفرع</span></motion.div>
      </div>
      <motion.div className="hero-art" style={{ y: reduced ? 0 : drift }}
        initial={reduced ? false : { opacity: 0, scale: .95, rotate: 2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: .9, delay: .12, ease: cinematicEase }}>
        <div className="hero-image-frame">
          <div className="hero-image">
            <AnimatePresence initial={false} mode="wait">
              <motion.div key={slide.src} className="hero-slide"
                initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : .5, ease: cinematicEase }}>
                <ProductImage src={slide.src} name={slide.title} eager editorial />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="hero-image-topline"><span><Flame size={14} /> THE ART OF FIRE</span><span>0{active + 1} / 03</span></div>
          <div className="hero-photo-title"><span>من أجواء المنيو</span><h2>{slide.title}</h2></div>
        </div>
        <motion.div className="hero-stamp" aria-hidden="true" initial={reduced ? false : { scale: .6, rotate: -25, opacity: 0 }} animate={{ scale: 1, rotate: -9, opacity: 1 }} transition={{ type: 'spring', stiffness: 130, damping: 16, delay: .5 }}><Flame size={28} /><span>نار وذوق.</span><small>KÖMÜR KÜNEFE</small></motion.div>
        <div className="hero-gallery-controls">
          <div className="hero-gallery-dots" aria-label="صور المنيو">{slides.map((item, index) => <button key={item.src} className={active === index ? 'active' : ''} aria-pressed={active === index} aria-label={`اعرض ${item.title}`} onClick={() => setActive(index)}><span /></button>)}</div>
          <div className="hero-gallery-arrows"><motion.button whileTap={reduced ? undefined : { scale: .9 }} aria-label="الصورة السابقة" onClick={() => setActive((active + slides.length - 1) % slides.length)}><ArrowRight size={17} /></motion.button><motion.button whileTap={reduced ? undefined : { scale: .9 }} aria-label="الصورة التالية" onClick={() => setActive((active + 1) % slides.length)}><ArrowLeft size={17} /></motion.button></div>
        </div>
      </motion.div>
    </div>
    <div className="hero-bottom"><span lang="en" dir="ltr">MADE WITH FIRE. SHARED WITH LOVE.</span><button onClick={() => document.getElementById('signature-selection')?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' })}>كمّل الحكاية <ArrowDownLeft size={16} /></button></div>
  </section>;
}
