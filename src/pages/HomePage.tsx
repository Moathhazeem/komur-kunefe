import { ArrowLeft, MapPin, Phone, Star } from 'lucide-react';
import type { Offer, Product, ProductVariant, Review, StoreSettings } from '../types';
import { isActiveOffer } from '../utils/offers';
import { ProductCard } from '../components/ProductCard';
import { BrandHero } from '../components/home/BrandHero';
import { CraftSection } from '../components/home/CraftSection';
import { GeniusInvitation } from '../components/home/GeniusInvitation';

interface HomePageProps {
  products: Product[];
  offers: Offer[];
  reviews: Review[];
  settings: StoreSettings | null;
  onNavigate: (tab: string) => void;
  onNavigateToProduct: (productId: string) => void;
  onAddToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
  onOpenDeliverySurvey: () => void;
}

export function HomePage({products, offers, reviews, settings, onNavigate, onNavigateToProduct}: HomePageProps) {
  const selection = [...products].sort((a,b)=>Number(Boolean(b.featured))-Number(Boolean(a.featured))).filter(p=>p.category==='charcoal' || p.featured).slice(0,3);
  const activeOffers = offers.filter(isActiveOffer);
  const approvedReviews = reviews.filter(r=>r.isApproved && !r.isDemo).slice(0,3);
  return <div className="brand-home">
    <BrandHero onNavigate={onNavigate}/>
    <div className="brand-ribbon" aria-label="تجربة كُومُر"><span>من قلب نابلس</span><i>✳</i><span>تُحضّر عالجمر</span><i>✳</i><span>حلوة مع اللَمّة</span><i>✳</i><span lang="en">THE ART OF FIRE</span></div>
    <section id="signature-selection" className="collection-section brand-container">
      <header className="editorial-heading"><div><span className="section-kicker">01 / مختارات كُومُر</span><h2>اختار أول <em>لقمة.</em></h2></div><div><p>أصناف من المنيو، لكل مزاج وحجم لَمّة.</p><button className="brand-text-link ink" onClick={()=>onNavigate('menu')}>استكشف المنيو <ArrowLeft size={18}/></button></div></header>
      <div className="signature-products">{selection.map((product,index)=><ProductCard key={product.id} product={product} revealDelay={index*80} onOpenDetails={p=>onNavigateToProduct(p.id)}/>)}</div>
      {!selection.length && <button className="brand-button dark" onClick={()=>onNavigate('menu')}>اكتشف المنيو <ArrowLeft size={18}/></button>}
    </section>
    <CraftSection story={settings && !settings.isStoryDraft ? settings.ourStory : undefined} onNavigate={onNavigate}/>
    <GeniusInvitation onNavigate={onNavigate}/>
    {activeOffers.length>0 && <section className="brand-container offer-editorial"><div><span className="section-kicker light">إشي حلو، بسعر أحلى</span><h2>{activeOffers[0].title}</h2><p>{activeOffers[0].description}</p></div><button className="brand-button cream" onClick={()=>onNavigate('offers')}>تفاصيل العرض <ArrowLeft size={18}/></button></section>}
    {approvedReviews.length>0 && <section className="brand-container reviews-editorial"><header className="editorial-heading"><div><span className="section-kicker">من زبائن الفرع</span><h2>بعد أول <em>لقمة.</em></h2></div><button className="brand-text-link ink" onClick={()=>onNavigate('reviews')}>كل التجارب <ArrowLeft size={18}/></button></header><div className="review-columns">{approvedReviews.map(review=><figure key={review.id}><div className="review-stars" aria-label={`تقييم ${review.rating} من 5`}>{Array.from({length:Math.max(0,Math.min(5,Math.round(review.rating)))},(_,i)=><Star key={i} size={14} fill="currentColor"/>)}</div><blockquote>“{review.comment}”</blockquote><figcaption>{review.customerName || review.userName || 'زبون الفرع'}</figcaption></figure>)}</div></section>}
    <section className="visit-editorial"><div className="brand-container visit-layout"><div><span className="section-kicker light">بنستناكم في رافدية</span><h2>ريحة الجمر بتدلّك.<br/><em>وأول لقمة بتخلّيك.</em></h2><p><MapPin size={16}/>{settings?.branch || 'رافدية، الشارع الرئيسي، نابلس'}</p>{settings?.hours && <p>{settings.hours}</p>}</div><div className="visit-actions"><button className="brand-button" onClick={()=>onNavigate('menu')}>اطلب قبل ما توصل <ArrowLeft size={18}/></button><a className="brand-text-link" href={`tel:${settings?.phone || '+970562606061'}`}><Phone size={17}/><bdi>{settings?.phone || '+970 562 606 061'}</bdi></a><button className="brand-text-link" onClick={()=>onNavigate('contact')}>معلومات الفرع <ArrowLeft size={17}/></button></div></div><span className="visit-wordmark" aria-hidden="true" lang="en">KÖMÜR</span></section>
  </div>;
}
