import { useState } from 'react';
import { Flame } from 'lucide-react';
import { MAIN_MENU_IMAGES, KNAFEH_CREDIT_URL, menuImage } from '../data/brandImages';

interface ProductImageProps {
  src?: string;
  name: string;
  eager?: boolean;
  editorial?: boolean;
}
export function ProductImage({ src, name, eager = false, editorial = false }: ProductImageProps) {
  const image = menuImage(src, name);
  const [failedSource, setFailedSource] = useState<string>();
  const available = image && failedSource !== image;
  const nabulsi = image === MAIN_MENU_IMAGES.nabulsiKnafeh;
  const reference = editorial || Object.values(MAIN_MENU_IMAGES).includes(image || '');
  return <div className="product-media">
    {available ? <img src={image} alt={reference ? `صورة توضيحية — ${name}` : name}
      loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'}
      decoding="async" onError={() => setFailedSource(image)} /> :
      <div className="photo-placeholder" role="img" aria-label={`صورة ${name} غير متاحة`}>
        <span className="photo-orbit"><Flame size={42} strokeWidth={1} /></span>
        <span className="eyebrow" lang="en" dir="ltr">THE ART OF FIRE</span>
        <strong>{name}</strong>
      </div>}
    {available && reference && <span className="photo-caption">
      {nabulsi ? <a href={KNAFEH_CREDIT_URL} target="_blank" rel="noreferrer">صورة توضيحية · Leen.salem / CC BY-SA 4.0</a> : 'صورة توضيحية من المنيو'}
    </span>}
  </div>;
}
