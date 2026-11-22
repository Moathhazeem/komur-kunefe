import type { Product } from '../types';

/** Editorial illustrations, not photographs of prepared restaurant orders.
 * Deliberately separate from the Product model and API prices/inventory.
 */
const artwork: Readonly<Record<string, string>> = {
  'كنافة اسطنبولية بالفستق الناعم': 'istanbul-pistachio',
  'كنافة اسطنبولية فستق اكسترا': 'pistachio-extra',
  'كنافة نابلسية ناعمة': 'nabulsi-soft',
  'كنافة اسطنبولية محيرة': 'istanbul-mhayara',
  'اسطنبولية بحشوة الجبن والفستق الحلبي': 'istanbul-pistachio',
  'اسطنبولية بالقشطة': 'cream-kunafa',
  'كنافة اسطنبولية بالشوكولاته': 'chocolate-kunafa',
  'كنافة برمة بالجبنة': 'burma-rolls',
};

function canonicalName(text: string): string {
  return text.normalize('NFKC').toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[\u0623\u0625\u0622\u0671]/g, 'ا')
    .replace(/\s+/g, ' ').trim();
}

const index = new Map(Object.entries(artwork).map(([name, stem]) => [canonicalName(name), stem]));

export interface MenuArtwork {
  src: string;
  generated: boolean;
  kind: 'cutout' | 'editorial' | 'original';
}

export function getMenuArtwork(product: Pick<Product, 'name' | 'image'>, mode: 'hero' | 'thumbnail'): MenuArtwork {
  const key = canonicalName(product.name);
  const stem = index.get(key);
  if (mode === 'hero' && stem === 'istanbul-pistachio') {
    return { src: '/media/kunafa-pistachio-hero.webp', generated: true, kind: 'cutout' };
  }
  if (stem) {
    return { src: `/media/menu-art/${stem}-${mode === 'hero' ? 'hero' : 'thumb'}.webp`, generated: true, kind: 'editorial' };
  }
  return { src: product.image, generated: false, kind: 'original' };
}
