import { useState } from 'react';
import { Flame } from 'lucide-react';

/** Seed Unsplash photographs are unverified; never present them as restaurant products. */
export function ProductImage({ src, name, eager = false }: { src?: string; name: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  const trusted = src && !src.includes('unsplash.com') && !failed;
  return <div className="product-media">
    {trusted ? <img src={src} alt={name} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} decoding="async" onError={() => setFailed(true)} /> :
      <div className="photo-placeholder" role="img" aria-label={`صورة ${name} لم تتوفر بعد`}>
        <span className="photo-orbit"><Flame size={42} strokeWidth={1} /></span>
        <span className="eyebrow" lang="en" dir="ltr">THE ART OF FIRE</span>
        <strong>{name}</strong><small>بانتظار تصوير الصنف من الفرع</small>
      </div>}
  </div>;
}
