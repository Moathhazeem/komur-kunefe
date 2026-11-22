import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft, ArrowRight, Check, CircleHelp, Copy, Flame,
  Gift, Minus, Plus, RotateCcw, Send, ShoppingBag, Sparkles, Users, WandSparkles,
} from 'lucide-react';
import type { Product, ProductVariant, StoreSettings } from '../types';
import { studioArtwork } from '../utils/studioArtwork';
import './studio.css';

type SyrupStrength = 'normal' | 'light' | 'extra' | 'side' | 'none';
type StudioKind = 'single' | 'duo';

interface StudioPageProps {
  products: Product[];
  settings: StoreSettings | null;
  onAddToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
  onNavigate: (tab: string) => void;
}

const syrupOptions: Array<{ id: SyrupStrength; name: string; description: string }> = [
  { id: 'normal', name: 'قطر عادي', description: 'بالطريقة المعتادة' },
  { id: 'light', name: 'قطر خفيف', description: 'حلاوة أخف' },
  { id: 'extra', name: 'قطر زيادة', description: 'حلاوة أكثر' },
  { id: 'side', name: 'القطر على جنب', description: 'تحكّم بالكمية' },
  { id: 'none', name: 'بدون قطر', description: 'حسب الرغبة' },
];

const specialFinishes = [
  { id: 'extra-pistachio', label: 'فستق زيادة' },
  { id: 'extra-ashta', label: 'قشطة إضافية' },
  { id: 'gift-wrap', label: 'تغليف للمناسبة' },
  { id: 'precut', label: 'تقطيع للتقديم' },
];

const prettyPrice = (price: number) => Number.isFinite(price) ? new Intl.NumberFormat('ar-PS', { maximumFractionDigits: 2 }).format(price) : '—';
const limit = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const formattedPhone = (value?: string) => (value || '970562606061').replace(/\D/g, '') || '970562606061';

function optionPrice(value?: number) { return typeof value === 'number' && Number.isFinite(value) ? value : 0; }

/** A menu-backed studio: no synthetic product IDs or imaginary custom prices. */
export function StudioPage({ products, settings, onAddToCart, onNavigate }: StudioPageProps) {
  const reduceMotion = useReducedMotion();
  const eligible = useMemo(() => products.filter(p =>
    p.isAvailable && p.variants?.length && (p.category === 'charcoal' || p.category === 'nutella')
  ), [products]);
  const [people, setPeople] = useState(1);
  const [trays, setTrays] = useState(1);
  const [kind, setKind] = useState<StudioKind>('single');
  const [primaryId, setPrimaryId] = useState('');
  const [secondaryId, setSecondaryId] = useState('');
  const [variantId, setVariantId] = useState('');
  const [syrup, setSyrup] = useState<SyrupStrength>('normal');
  const [healthySyrup, setHealthySyrup] = useState(false);
  const [healthySize, setHealthySize] = useState('');
  const [addOns, setAddOns] = useState<string[]>([]);
  const [groupPicks, setGroupPicks] = useState<Record<string, string>>({});
  const [finishes, setFinishes] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [occasion, setOccasion] = useState('');
  const [added, setAdded] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  const primary = eligible.find(p => p.id === primaryId) ?? eligible[0];
  const secondary = eligible.find(p => p.id === secondaryId && p.id !== primary?.id) ?? eligible.find(p => p.id !== primary?.id);
  const variant = primary?.variants.find(v => v.id === variantId) ?? primary?.variants.find(v => v.isDefault) ?? primary?.variants[0];
  const groups = primary?.addOnGroups ?? [];
  const syrupGroup = groups.find(g => g.name.includes('قطر') && g.name.includes('صحي'));
  const otherGroups = groups.filter(g => g !== syrupGroup);
  const syrupSize = syrupGroup?.options.find(o => o.name === healthySize) ??
    syrupGroup?.options.find(o => variant?.name.includes(o.name)) ?? syrupGroup?.options[0];
  const chosenExtras = (primary?.addOns ?? []).filter(a => addOns.includes(a.name));
  const chosenGroups = otherGroups.flatMap(group => {
    const option = group.options.find(o => o.name === groupPicks[group.name]);
    return option ? [{ group, option }] : [];
  });
  const extrasPrice = chosenExtras.reduce((sum, a) => sum + optionPrice(a.price), 0);
  const groupsPrice = chosenGroups.reduce((sum, o) => sum + optionPrice(o.option.price), 0);
  const qatrPrice = healthySyrup ? optionPrice(syrupSize?.price) : 0;
  const unitPrice = optionPrice(variant?.price) + extrasPrice + groupsPrice + qatrPrice;
  const requiresConfirmation = kind === 'duo' || finishes.length > 0;
  const canOrder = !!primary && !!variant && !requiresConfirmation;

  useEffect(() => {
    setVariantId(''); setAddOns([]); setGroupPicks({}); setHealthySyrup(false); setHealthySize(''); setAdded(false);
  }, [primary?.id]);
  useEffect(() => { if (kind !== 'duo') setSecondaryId(''); }, [kind]);

  const title = people === 1 ? 'صحنك الخاص' : `صينية لـ ${people} أشخاص`;
  const summary = [
    `KÖMÜR STUDIO — ${title}`,
    `عدد الصواني: ${trays}`,
    `النوع الأساسي: ${primary?.name ?? 'غير محدد'}`,
    kind === 'duo' && secondary ? `تقسيمة نوعين: ${primary?.name} + ${secondary.name} (تحتاج تأكيد)` : '',
    `الحجم من المنيو: ${variant?.name ?? 'غير محدد'}`,
    `القطر: ${syrupOptions.find(x => x.id === syrup)?.name ?? ''}${healthySyrup ? ` + بديل صحي ${syrupSize?.name ?? ''}` : ''}`,
    chosenExtras.length ? `إضافات: ${chosenExtras.map(x => `${x.name} (+${x.price} ₪)`).join('، ')}` : '',
    chosenGroups.length ? `خيارات: ${chosenGroups.map(x => `${x.group.name}: ${x.option.name}`).join('، ')}` : '',
    finishes.length ? `طلبات خاصة تحتاج تسعير/تأكيد: ${specialFinishes.filter(x => finishes.includes(x.id)).map(x => x.label).join('، ')}` : '',
    occasion.trim() ? `المناسبة: ${occasion.trim()}` : '',
    note.trim() ? `ملاحظات: ${note.trim()}` : '',
    requiresConfirmation ? 'السعر النهائي يتحدد بعد تأكيد المطعم' : `سعر تقديري حسب أصناف المنيو: ${prettyPrice(unitPrice * trays)} ₪`,
  ].filter(Boolean).join('\n');
  const waLink = `https://wa.me/${formattedPhone(settings?.whatsapp)}?text=${encodeURIComponent(`مرحبًا، بدي أستفسر عن تنفيذ تصميم خاص من KÖMÜR STUDIO:\n\n${summary}`)}`;

  function toggle<T>(value: T, current: T[], setter: (updater: (old: T[]) => T[]) => void) {
    setter(old => old.includes(value) ? old.filter(x => x !== value) : [...old, value]);
  }

  function reset() {
    setPeople(1); setTrays(1); setKind('single'); setPrimaryId(''); setSecondaryId(''); setVariantId('');
    setSyrup('normal'); setHealthySyrup(false); setHealthySize(''); setAddOns([]); setGroupPicks({});
    setFinishes([]); setOccasion(''); setNote(''); setAdded(false);
  }

  function addToCart() {
    if (!canOrder || !primary || !variant) return;
    const parts = [
      'KÖMÜR STUDIO', variant.name, `لـ ${people} ${people === 1 ? 'شخص' : 'أشخاص'}`,
      syrupOptions.find(x => x.id === syrup)?.name ?? 'قطر عادي',
      healthySyrup ? `قطر صحي: ${syrupSize?.name ?? 'اختيار خاص'}` : '',
      ...chosenExtras.map(x => x.name),
      ...chosenGroups.map(x => `${x.group.name}: ${x.option.name}`),
      occasion.trim() ? `مناسبة: ${occasion.trim()}` : '',
      note.trim() ? `ملاحظات: ${note.trim()}` : '',
    ].filter(Boolean);
    // Preserve the canonical product and variant IDs and carry preparation notes in variantName
    // so they reach the existing order screen, printed receipt and staff dashboard.
    onAddToCart(primary, { ...variant, name: parts.join(' · '), price: unitPrice }, trays);
    setAdded(true);
    onNavigate('checkout');
  }

  async function copyDesign() {
    try {
      await navigator.clipboard.writeText(summary);
      setSavedMessage('تم نسخ تفاصيل تصميمك');
    } catch { setSavedMessage('ما قدرنا ننسخ تلقائيًا؛ استخدم رابط الاستفسار'); }
  }

  return (
    <section className="ks-studio" dir="rtl" aria-labelledby="ks-title">
      <div className="ks-studio__veil" aria-hidden="true" />
      <div className="ks-shell">
        <header className="ks-header">
          <div className="ks-header__label"><span className="ks-header__spark">✦</span><bdi dir="ltr">KÖMÜR / SIGNATURE STUDIO</bdi></div>
          <div className="ks-header__actions">
            <button type="button" onClick={reset}><RotateCcw size={16} /> ابدأ من جديد</button>
            <button type="button" onClick={() => onNavigate('menu')}><ArrowRight size={16}/> الرجوع للمنيو</button>
          </div>
        </header>

        <div className="ks-intro">
          <span className="ks-intro__eyebrow">التجربة بتبدأ من ذوقك</span>
          <h1 id="ks-title">صمّم <em>كنافتك</em> على كيفك.</h1>
          <p>صحن إلك، أو صينية للّمة. اختار النوع والحجم والإضافات والقطر؛ وإحنا بنرتّب التفاصيل بتجربة واحدة.</p>
        </div>

        <div className="ks-layout">
          <main className="ks-builder">
            <section className="ks-panel" aria-labelledby="ks-step-1">
              <div className="ks-panel__heading"><span>01</span><div><h2 id="ks-step-1">لمين الصينية؟</h2><p>شخص واحد أو عزومة كاملة — إنت بتقرر.</p></div></div>
              <div className="ks-guests">
                <div className="ks-guests__count"><Users size={21}/><div><small>عدد الأشخاص</small><strong>{people}</strong></div></div>
                <div className="ks-stepper"><button type="button" aria-label="تقليل الأشخاص" disabled={people <= 1} onClick={() => setPeople(p => limit(p-1,1,40))}><Minus size={18}/></button><span>{people === 1 ? 'إلي لحالي' : `${people} أشخاص`}</span><button type="button" aria-label="زيادة الأشخاص" disabled={people >= 40} onClick={() => setPeople(p => limit(p+1,1,40))}><Plus size={18}/></button></div>
              </div>
              <div className="ks-pills">{[1,2,4,6,10,15,20].map(n => <button type="button" key={n} className={people === n ? 'is-on' : ''} onClick={() => setPeople(n)}>{n === 1 ? 'شخصي' : n === 2 ? 'لشخصين' : `${n} أشخاص`}</button>)}</div>
              <p className="ks-help"><CircleHelp size={15}/> العدد للمساعدة في التخطيط، لكن حجم الصينية الفعلي بتختاره من أحجام المنيو الموجودة.</p>
            </section>

            <section className="ks-panel" aria-labelledby="ks-step-2">
              <div className="ks-panel__heading"><span>02</span><div><h2 id="ks-step-2">اختار نوع الكنافة</h2><p>من أصناف Kömür المتوفرة فعلًا.</p></div></div>
              <div className="ks-choice-row" role="group" aria-label="توزيع النكهات">
                <button type="button" className={kind === 'single' ? 'is-selected' : ''} onClick={() => setKind('single')}><Check size={16}/> نوع واحد</button>
                <button type="button" className={kind === 'duo' ? 'is-selected' : ''} onClick={() => setKind('duo')}><Sparkles size={16}/> نص ونص <small>طلب خاص</small></button>
              </div>
              {eligible.length ? <div className="ks-products" role="group" aria-label="الصنف الأساسي">
                {eligible.map(p => <button type="button" key={p.id} className={`ks-product ${primary?.id === p.id ? 'is-selected' : ''}`} onClick={() => { setPrimaryId(p.id); if (p.id === secondaryId) setSecondaryId(''); }} aria-pressed={primary?.id === p.id}>
                  <span className="ks-product__photo"><img src={studioArtwork(p, 'thumb')} alt="" loading="lazy" /></span>
                  <span className="ks-product__label">{p.name}</span>
                  <span className="ks-product__check">{primary?.id === p.id ? <Check size={15}/> : <Plus size={15}/>}</span>
                </button>)}
              </div> : <p className="ks-warning">ما في أصناف كنافة متاحة حاليًا. راجع المنيو بعد تحديثه.</p>}
              {kind === 'duo' && <div className="ks-duo">
                <label htmlFor="ks-second-type">النوع الثاني لنصف الصينية</label>
                <select id="ks-second-type" value={secondary?.id || ''} onChange={event => setSecondaryId(event.target.value)}>
                  {eligible.filter(p => p.id !== primary?.id).map(p => <option value={p.id} key={p.id}>{p.name}</option>)}
                </select>
                <p className="ks-warning">تقسيم الصينية إلى نوعين يحتاج تأكيد إمكانية التنفيذ والسعر من المطعم، لذلك ما بنضيفه للسلة تلقائيًا.</p>
              </div>}
            </section>

            <section className="ks-panel" aria-labelledby="ks-step-3">
              <div className="ks-panel__heading"><span>03</span><div><h2 id="ks-step-3">حجم الصينية</h2><p>الصدر بتصميم مستطيل ثابت — بدون خيارات أشكال غير ضرورية.</p></div></div>
              {primary && <div className="ks-size-grid" role="group" aria-label="أحجام الصنف">
                {primary.variants.map(v => <button type="button" className={`ks-size ${variant?.id === v.id ? 'is-selected' : ''}`} key={v.id} aria-pressed={variant?.id === v.id} onClick={() => setVariantId(v.id)}>
                  <span>{v.name}</span><strong>{prettyPrice(v.price)} <small>₪</small></strong>
                </button>)}
              </div>}
              <div className="ks-qty"><span>عدد الصواني</span><div className="ks-stepper"><button type="button" disabled={trays <= 1} aria-label="تقليل الصواني" onClick={() => setTrays(v => limit(v-1,1,8))}><Minus size={16}/></button><strong>{trays}</strong><button type="button" disabled={trays >= 8} aria-label="زيادة الصواني" onClick={() => setTrays(v => limit(v+1,1,8))}><Plus size={16}/></button></div></div>
            </section>

            <section className="ks-panel" aria-labelledby="ks-step-4">
              <div className="ks-panel__heading"><span>04</span><div><h2 id="ks-step-4">الإضافات واللمسات</h2><p>الإضافات المسعّرة حسب المنيو، وطلبات خاصة حسب رغبتك.</p></div></div>
              {(primary?.addOns?.length || 0) > 0 && <>
                <h3 className="ks-subheading">إضافات معتمدة للصنف</h3>
                <div className="ks-addon-grid">{primary!.addOns!.map(a => <button type="button" className={`ks-addon ${addOns.includes(a.name) ? 'is-selected' : ''}`} key={a.name} aria-pressed={addOns.includes(a.name)} onClick={() => toggle(a.name,addOns,setAddOns)}><span>{a.name}</span><strong>+{prettyPrice(a.price)} ₪</strong><i>{addOns.includes(a.name) ? <Check size={15}/> : <Plus size={15}/>}</i></button>)}</div>
              </>}
              {otherGroups.map(group => <div className="ks-options-group" key={group.name}><h3 className="ks-subheading">{group.name}</h3><div className="ks-pills">{group.options.map(option => <button key={option.name} type="button" className={groupPicks[group.name] === option.name ? 'is-on' : ''} onClick={() => setGroupPicks(old => ({...old,[group.name]:old[group.name] === option.name ? '' : option.name}))}>{option.name}{typeof option.price === 'number' ? ` · +${option.price} ₪` : ''}</button>)}</div></div>)}
              <h3 className="ks-subheading">لمسات خاصة <small>تحتاج تأكيد</small></h3>
              <div className="ks-finishes">{specialFinishes.map(f => <button type="button" className={finishes.includes(f.id) ? 'is-selected' : ''} aria-pressed={finishes.includes(f.id)} key={f.id} onClick={() => toggle(f.id,finishes,setFinishes)}><span>{finishes.includes(f.id) ? <Check size={16}/> : <Plus size={16}/>}</span>{f.label}</button>)}</div>
              <p className="ks-help">اللمسات الخاصة مش مسعّرة في المنيو الحالي؛ لما تختار منها بنحوّل التصميم لاستفسار للتأكيد بدل طلب تلقائي.</p>
            </section>

            <section className="ks-panel" aria-labelledby="ks-step-5">
              <div className="ks-panel__heading"><span>05</span><div><h2 id="ks-step-5">كيف بتحب القطر؟</h2><p>تفاصيل صغيرة بتفرّق بالطعم.</p></div></div>
              <div className="ks-syrup-grid">{syrupOptions.map(o => <button type="button" key={o.id} aria-pressed={syrup === o.id} className={`ks-syrup ${syrup === o.id ? 'is-selected' : ''}`} onClick={() => { setSyrup(o.id); if (o.id === 'none') setHealthySyrup(false); }}><span>{o.name}</span><small>{o.description}</small></button>)}</div>
              {syrupGroup && <div className="ks-healthy"><label className="ks-healthy__check"><input type="checkbox" checked={healthySyrup} disabled={syrup === 'none'} onChange={e => setHealthySyrup(e.target.checked)} /><span><strong>بديل قطر صحي</strong><small>خيار موجود في المنيو — بسعر حسب الحجم</small></span></label>{healthySyrup && <select aria-label="حجم القطر الصحي" value={syrupSize?.name || ''} onChange={e => setHealthySize(e.target.value)}>{syrupGroup.options.map(option => <option key={option.name} value={option.name}>{option.name} · +{prettyPrice(option.price)} ₪</option>)}</select>}</div>}
            </section>

            <section className="ks-panel" aria-labelledby="ks-step-6">
              <div className="ks-panel__heading"><span>06</span><div><h2 id="ks-step-6">تفاصيلك الأخيرة</h2><p>إذا عندك مناسبة أو ملاحظة على التحضير.</p></div></div>
              <div className="ks-fields"><label>اسم المناسبة <small>اختياري</small><input value={occasion} onChange={e => setOccasion(e.target.value.slice(0,50))} maxLength={50} placeholder="مثلاً عيد ميلاد أو قعدة أحباب" /></label><label>ملاحظات للصينية <small>اختياري</small><textarea value={note} onChange={e => setNote(e.target.value.slice(0,140))} maxLength={140} rows={3} placeholder="مثلاً تقطيع صغير أو ملاحظة خاصة..." /></label></div>
            </section>
          </main>

          <aside className="ks-preview" aria-label="معاينة تصميم الصينية">
            <div className="ks-preview__inner">
              <header className="ks-preview__top"><div><span>YOUR SIGNATURE TRAY</span><h2>صينيتك. على كيفك.</h2></div><WandSparkles size={23}/></header>
              <div className="ks-scene">
                <div className="ks-scene__glow"/>
                <div className="ks-scene__tray" aria-label="معاينة تصويرية تقريبية لتقسيمة الصينية">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div key={`${primary?.id}-${secondary?.id}-${kind}`} className="ks-scene__food" initial={reduceMotion ? {opacity:0}:{opacity:0,scale:.95}} animate={{opacity:1,scale:1}} exit={{opacity:0}} transition={{duration:reduceMotion?0:.36}}>
                      {primary && <div className="ks-scene__zone" style={{backgroundImage:`url(${studioArtwork(primary, 'hero')})`}}/>}
                      {kind==='duo' && secondary && <div className="ks-scene__zone ks-scene__zone--second" style={{backgroundImage:`url(${studioArtwork(secondary, 'hero')})`}}/>}
                      <div className="ks-scene__glaze"/><div className="ks-scene__lines"/>
                    </motion.div>
                  </AnimatePresence>
                  <div className="ks-scene__tray-rim"/>
                </div>
                <span className="ks-scene__disclaimer">معاينة تقريبية للتقسيمة — ليست صورة المنتج النهائي</span>
              </div>
              <div className="ks-preview__info"><span className="ks-preview__pill"><Flame size={14}/>{people === 1 ? 'صحن خاص' : 'صينية مشاركة'}</span><h3>{title}</h3><p>{primary?.name ?? 'اختار صنفك'}{kind==='duo' && secondary ? ` + ${secondary.name}` : ''}</p><div className="ks-preview__specs"><span>الحجم <b>{variant?.name ?? '—'}</b></span><span>العدد <b>{trays}</b></span><span>القطر <b>{healthySyrup ? 'بديل صحي' : syrupOptions.find(x=>x.id===syrup)?.name}</b></span></div>
                <div className="ks-preview__total"><div><small>{requiresConfirmation ? 'سعر الطلب الخاص' : 'الإجمالي حسب المنيو'}</small><strong>{requiresConfirmation ? 'بعد التأكيد' : `${prettyPrice(unitPrice * trays)} ₪`}</strong></div>{!requiresConfirmation && <span>شامل الخيارات المسعّرة</span>}</div>
                {requiresConfirmation ? <a className="ks-preview__primary" href={waLink} target="_blank" rel="noopener noreferrer"><Send size={17}/> أرسل التصميم للتأكيد <ArrowLeft size={18}/></a> : <button type="button" disabled={!canOrder} className="ks-preview__primary" onClick={addToCart}><ShoppingBag size={19}/>{added ? 'تمت الإضافة' : 'أضف الصينية للسلة'}<ArrowLeft size={18}/></button>}
                <button className="ks-preview__secondary" type="button" onClick={copyDesign}><Copy size={16}/> نسخ تفاصيل التصميم</button><span role="status" className="ks-preview__message">{savedMessage}</span>
                <p className="ks-preview__policy">{requiresConfirmation ? 'النوعين أو اللمسات الخاصة تتطلب تأكيد الإمكانية والسعر، ولا تُعتبر طلبًا مؤكدًا.' : 'السعر مأخوذ من الصنف والحجم والإضافات المعتمدة في المنيو. عدد الأشخاص لا يغيّر السعر تلقائيًا.'}</p>
              </div>
            </div>
          </aside>
        </div>
        <footer className="ks-footer"><Gift size={17}/><span>استوديو كُومُر — تفاصيلك بتفرق. يرجى تأكيد الأشكال والتقسيمات الخاصة مع الفرع قبل الدفع.</span><button type="button" onClick={() => onNavigate('menu')}>تصفّح المنيو <ArrowLeft size={16}/></button></footer>
      </div>
    </section>
  );
}
