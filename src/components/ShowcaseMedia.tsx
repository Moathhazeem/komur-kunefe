import { useState } from 'react';
import type { Product } from '../types';
import { productImageSources } from '../utils/productImage';

export function ShowcaseMedia({ product, hero = false }: { product: Product; hero?: boolean }) {
  const [failedSource, setFailedSource] = useState<string>();
  const available = product.image && failedSource !== product.image;
  return <>
    {available ? <img src={product.image} srcSet={productImageSources(product.image)}
      sizes={hero ? '(min-width: 900px) 48vw, 90vw' : '110px'}
      alt={hero ? product.name : ''} loading={hero ? 'eager' : 'lazy'} decoding="async"
      onError={() => setFailedSource(product.image)} />
      : <span className="showcase-media-fallback">{hero ? 'صورة الصنف غير متاحة' : product.name}</span>}
    {hero && available && product.imageCredit && <span className="showcase-credit">
      {product.imageCreditUrl ? <a href={product.imageCreditUrl} target="_blank" rel="noreferrer">{product.imageCredit}</a> : product.imageCredit}
    </span>}
  </>;
}
