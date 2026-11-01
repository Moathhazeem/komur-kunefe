// Image URLs copied from origin/main at a3ce1a7; product prices and IDs are unchanged.
export const MAIN_MENU_IMAGES = {
  nabulsiKnafeh: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/%D8%A7%D9%84%D9%83%D9%86%D8%A7%D9%81%D8%A9_%D8%A7%D9%84%D9%86%D8%A7%D8%A8%D9%84%D8%B3%D9%8A%D8%A9.jpg/960px-%D8%A7%D9%84%D9%83%D9%86%D8%A7%D9%81%D8%A9_%D8%A7%D9%84%D9%86%D8%A7%D8%A8%D9%84%D8%B3%D9%8A%D8%A9.jpg',
  pistachioBaklava: 'https://images.unsplash.com/photo-1676014959543-81df1079b423?auto=format&fit=crop&w=1200&q=85',
  assortedSweets: 'https://images.unsplash.com/photo-1762806965030-b8399ae9f068?auto=format&fit=crop&w=1200&q=85',
  chocolate: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=85',
  water: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=1200&q=85',
  cola: 'https://images.unsplash.com/photo-1709240428510-0189e299c1fe?auto=format&fit=crop&w=1200&q=85',
  sprite: 'https://images.unsplash.com/photo-1696706980174-79c1c11aa683?auto=format&fit=crop&w=1200&q=85',
};
export const KNAFEH_CREDIT_URL = 'https://commons.wikimedia.org/wiki/File:%D8%A7%D9%84%D9%83%D9%86%D8%A7%D9%81%D8%A9_%D8%A7%D9%84%D9%86%D8%A7%D8%A8%D9%84%D8%B3%D9%8A%D8%A9.jpg';
const legacyPhotos = ['1579954115545', '1587314168485', '1541781774459', '1509440159596'];
export function menuImage(src: string | undefined, name: string) {
  // Preserve restaurant-uploaded media and all image URLs already present on main.
  if (src && (!src.includes('unsplash.com') || Object.values(MAIN_MENU_IMAGES).includes(src) || !legacyPhotos.some(id=>src.includes(id)))) return src;
  const normalized=name.replace(/[إأآ]/g,'ا');
  if (/شوكولا|نوتيلا/.test(normalized)) return MAIN_MENU_IMAGES.chocolate;
  if (/قشطة|قشطه/.test(normalized)) return MAIN_MENU_IMAGES.assortedSweets;
  if (/فستق/.test(normalized)) return MAIN_MENU_IMAGES.pistachioBaklava;
  return MAIN_MENU_IMAGES.nabulsiKnafeh;
}
