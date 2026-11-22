import type { Product } from '../types';

/** Studio-only illustrations from the approved menu art set; never change catalog data. */
const ART: Readonly<Record<string, string>> = {
  'كنافة اسطنبولية بالفستق الناعم': 'istanbul-pistachio',
  'كنافة اسطنبولية فستق اكسترا': 'pistachio-extra',
  'كنافة نابلسية ناعمة': 'nabulsi-soft',
  'كنافة اسطنبولية محيرة': 'istanbul-mhayara',
  'اسطنبولية بحشوة الجبن والفستق الحلبي': 'istanbul-pistachio',
  'اسطنبولية بالقشطة': 'cream-kunafa',
  'كنافة اسطنبولية بالشوكولاته': 'chocolate-kunafa',
  'كنافة برمة بالجبنة': 'burma-rolls',
};

const norm = (s: string) => s.normalize('NFKC').toLowerCase()
  .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
  .replace(/[\u0623\u0625\u0622\u0671]/g, 'ا')
  .replace(/\s+/g, ' ').trim();
const mapped = new Map(Object.entries(ART).map(([name,key]) => [norm(name),key]));
export function studioArtwork(product?: Pick<Product,'name' | 'image'>, mode: 'hero' | 'thumb' = 'hero'): string {
  if (!product) return '/media/kunafa-pistachio-hero.webp';
  const key = mapped.get(norm(product.name));
  return key ? `/media/studio-art/${key}-${mode === 'hero' ? 'hero' : 'thumb'}.webp` : product.image;
}
