import { ArrowLeft, Sparkles } from 'lucide-react';
export function GeniusInvitation({ onNavigate }: { onNavigate: (tab:string)=>void }) {
  return <section className="genius-invitation">
    <div className="genius-invite-copy"><span className="section-kicker">03 / اختيار على ذوقكم</span><h2>إنت عليك اللَمّة.<br/><em>إحنا علينا الحسبة.</em></h2><p>كم شخص معك؟ قديش الميزانية؟ خلّي Genius يقترح تشكيلات من المنيو، وإنت اختار اللي بناسبكم.</p><button className="brand-button dark" onClick={()=>onNavigate('genius')}>اكتشف تشكيلتك <ArrowLeft size={19}/></button></div>
    <div className="genius-invite-art">
      <div className="genius-paper"><div className="genius-paper-top"><Sparkles size={22}/><span lang="en">KÖMÜR GENIUS</span></div><h3>كل لَمّة إلها ذوق.</h3><div className="genius-paper-row"><span>01</span><strong>عدد الأشخاص</strong></div><div className="genius-paper-row"><span>02</span><strong>ميزانيتكم</strong></div><div className="genius-paper-row"><span>03</span><strong>الطعم المفضل</strong></div><p>اختيارات محسوبة. متعة على ذوقك.</p><span className="receipt-bars" aria-hidden="true"/></div>
      <span className="genius-invite-note">لَمّة حلوة، من أول اختيار.</span>
    </div>
  </section>;
}
