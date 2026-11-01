import { ArrowDownLeft, ArrowLeft, Flame, MapPin } from 'lucide-react';
import { MAIN_MENU_IMAGES } from '../../data/brandImages';
import { ProductImage } from '../ProductImage';
export function BrandHero({ onNavigate }: { onNavigate: (tab: string) => void }) {
  return <section className="brand-hero">
    <div className="hero-layout">
      <div className="hero-copy">
        <p className="hero-kicker"><span className="ember-dot" /> نابلسية الأصل. عالجمر.</p>
        <h1>مش بس<br />كنافة<span className="hero-period">.</span><em>تجربة عالجمر.</em></h1>
        <p className="hero-description">من أول قرمشة لآخر لقمة.<br />دفا الفحم، حلاوة اللَمّة، وطعم من قلب نابلس.</p>
        <div className="hero-actions">
          <button className="brand-button" onClick={() => onNavigate('menu')}>اطلب كنافتك <ArrowLeft size={19} /></button>
          <button className="brand-text-link" onClick={() => onNavigate('story')}>اكتشف الحكاية <ArrowDownLeft size={17} /></button>
        </div>
        <span className="hero-origin"><MapPin size={14} /> رافدية، نابلس <span> / </span> استلام من الفرع</span>
      </div>
      <div className="hero-art">
        <div className="hero-image">
          <ProductImage src={MAIN_MENU_IMAGES.nabulsiKnafeh} name="الكنافة النابلسية" eager editorial />
        </div>
        <span className="hero-image-side" aria-hidden="true" lang="en">CRAFTED WITH FIRE. SHARED WITH LOVE.</span>
        <div className="hero-stamp" aria-hidden="true"><Flame size={28} strokeWidth={1.2} /><span>فنّ النار</span><small>THE ART OF FIRE</small></div>
        <div className="hero-image-foot"><span>ذهبية. دافية. نابلسية.</span><span lang="en" dir="ltr">KÖMÜR / KÜNEFE</span></div>
      </div>
    </div>
    <div className="hero-bottom"><span lang="en" dir="ltr">THE ART OF FIRE — THE JOY OF SHARING</span><button onClick={() => document.getElementById('signature-selection')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}>اكتشف المختارات <ArrowDownLeft size={16}/></button></div>
  </section>;
}
