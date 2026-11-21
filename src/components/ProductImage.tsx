import { useState } from 'react';
import { Flame } from 'lucide-react';
import { MAIN_MENU_IMAGES, KNAFEH_CREDIT_URL, menuImage } from '../data/brandImages';

interface ProductImageProps {
  src?: string;
  name: string;
  eager?: boolean;
  editorial?: boolean;
  sizes?: string;
}

const referenceImages = new Set<string>(Object.values(MAIN_MENU_IMAGES));
const responsiveImages = new Map(
  [...referenceImages].filter((url) => url.startsWith('https://images.unsplash.com/') && url.includes('w=1200'))
    .map((url) => [url, [480, 768, 1200].map((width) => url.replace('w=1200', 'w=' + width) + ' ' + width + 'w').join(', ')]),
);

export function ProductImage({ src, name, eager = false, editorial = false, sizes }: ProductImageProps) {
  const image = menuImage(src, name);
  const [failedSource, setFailedSource] = useState<string>();
  const available = Boolean(image) && failedSource !== image;
  const nabulsi = image === MAIN_MENU_IMAGES.nabulsiKnafeh;
  const reference = editorial || referenceImages.has(image);
  const srcSet = sizes ? responsiveImages.get(image) : undefined;

  return (
    <div className="product-media">
      {available ? (
        <img src={image} srcSet={srcSet} sizes={srcSet ? sizes : undefined} alt={(reference ? 'صورة توضيحية - ' : '') + name}
          loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} decoding="async"
          onError={() => setFailedSource(image)} />
      ) : (
        <div className="photo-placeholder" role="img" aria-label={'صورة ' + name + ' غير متاحة'}>
          <span className="photo-orbit" aria-hidden="true"><Flame size={42} strokeWidth={1} /></span>
          <span className="eyebrow" lang="en" dir="ltr">THE ART OF FIRE</span>
          <strong>{name}</strong>
        </div>
      )}
      {available && reference && (
        <span className="photo-caption">
          {nabulsi
            ? <a href={KNAFEH_CREDIT_URL} target="_blank" rel="noreferrer">صورة توضيحية · <bdi>Leen.salem / CC BY-SA 4.0</bdi></a>
            : 'صورة توضيحية من المنيو'}
        </span>
      )}
    </div>
  );
}
