import { ArrowLeft, Flame } from 'lucide-react';
import { ProductImage } from '../ProductImage';
import { MAIN_MENU_IMAGES } from '../../data/brandImages';
export function CraftSection({ story, onNavigate }: { story?: string; onNavigate: (tab: string) => void }) {
  return <section className="craft-section">
    <div className="craft-layout">
      <div className="craft-photo"><ProductImage src={MAIN_MENU_IMAGES.pistachioBaklava} name="تفاصيل الفستق والحلويات" editorial /><span className="craft-photo-label" lang="en">A LITTLE HEAT.<br/>A LOT OF HEART.</span></div>
      <div className="craft-copy">
        <span className="section-kicker light">02 / حكاية الجمر</span>
        <Flame className="craft-flame" size={36} strokeWidth={1} />
        <h2>الطعم إله أصل.<br/><em>والجمر إله حكاية.</em></h2>
        <p>{story || 'الكنافة النابلسية على جمر الفحم. نكهة دافية، وتفاصيل بتخلّي كل لَمّة أحلى. اكتشف حكايتنا في رافدية.'}</p>
        <button className="brand-text-link" onClick={() => onNavigate('story')}>حكاية كُومُر <ArrowLeft size={18}/></button>
      </div>
      <div className="craft-margin" aria-hidden="true" lang="en">FIRE IS OUR SIGNATURE.</div>
    </div>
  </section>;
}
