import { Flame } from 'lucide-react';
import type { StoreSettings } from '../types';
import { SectionHeading } from '../components/ui/SectionHeading';
export function StoryPage({ settings, onNavigate }: { settings: StoreSettings | null; onNavigate: (tab:string)=>void }) {
 return <div className="signature-page"><SectionHeading kicker="THE ART OF FIRE · فنّ النار" title="من نابلس. بروح الجمر.">حكاية كُومُر كُونافيه</SectionHeading>
 <div className="signature-story"><div><Flame size={64} strokeWidth={1} className="text-terracotta mb-6"/><p>{settings && !settings.isStoryDraft ? settings.ourStory : 'كنافة نابلسية على جمر الفحم في رافدية. اكتشف أصناف المنيو واختر ما يناسب ذوقك.'}</p></div><div className="signature-panel"><span className="eyebrow">لحظة تستحق الانتظار</span><h2 className="text-3xl font-black my-4">اختار. اطلب. واستلمها ساخنة.</h2><p>{settings?.branch || 'رافدية، نابلس'}</p><button className="signature-button mt-6" onClick={()=>onNavigate('menu')}>اكتشف المنيو</button></div></div></div>;
}
