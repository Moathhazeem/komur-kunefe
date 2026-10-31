import { Product } from '../types';

const sizes = ['XS', 'S', 'M', 'L', 'XL', '2.5', '3', '3.5'];
const iceCream = [{ name: 'إضافة بوظة', price: 4 }];
const sauces = ['نوتيلا', 'لوتس', 'زبدة الفستق', 'شوكولاته بيضاء'].map((name) => ({ name, price: 4 }));

const images = {
  nabulsiKnafeh: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/%D8%A7%D9%84%D9%83%D9%86%D8%A7%D9%81%D8%A9_%D8%A7%D9%84%D9%86%D8%A7%D8%A8%D9%84%D8%B3%D9%8A%D8%A9.jpg/960px-%D8%A7%D9%84%D9%83%D9%86%D8%A7%D9%81%D8%A9_%D8%A7%D9%84%D9%86%D8%A7%D8%A8%D9%84%D8%B3%D9%8A%D8%A9.jpg',
  pistachioBaklava: 'https://images.unsplash.com/photo-1676014959543-81df1079b423?auto=format&fit=crop&w=1200&q=85',
  assortedSweets: 'https://images.unsplash.com/photo-1762806965030-b8399ae9f068?auto=format&fit=crop&w=1200&q=85',
  chocolate: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=85',
  water: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=1200&q=85',
  cola: 'https://images.unsplash.com/photo-1709240428510-0189e299c1fe?auto=format&fit=crop&w=1200&q=85',
  sprite: 'https://images.unsplash.com/photo-1696706980174-79c1c11aa683?auto=format&fit=crop&w=1200&q=85',
};

const productImages: Record<string, string> = {
  'كنافة اسطنبولية بالفستق الناعم': images.nabulsiKnafeh,
  'كنافة اسطنبولية فستق أكسترا': images.nabulsiKnafeh,
  'كنافة نابلسية ناعمة': images.nabulsiKnafeh,
  'كنافة اسطنبولية محيرة': images.nabulsiKnafeh,
  'اسطنبولية بحشوة الجبن والفستق الحلبي': images.nabulsiKnafeh,
  'اسطنبولية بالقشطة': images.assortedSweets,
  'كنافة برغر': images.nabulsiKnafeh,
  'كنافة اسطنبولية بالشوكولاته': images.chocolate,
  'فطير السلطان': images.assortedSweets,
  'بقلاوة بالبوظة': images.pistachioBaklava,
  'كنافة برمة بالجبنة': images.nabulsiKnafeh,
  'بصله فستق': images.pistachioBaklava,
  'ععملية (عملية)': images.assortedSweets,
  'بين نارين': images.nabulsiKnafeh,
  'خدود': images.pistachioBaklava,
  'مدلوقة': images.assortedSweets,
  'عش بلبل': images.pistachioBaklava,
  'حلاوة جبن': images.nabulsiKnafeh,
  'اصابع فستق دولما': images.pistachioBaklava,
  'ترليشيا': images.assortedSweets,
  'فطير بالجبنة': images.assortedSweets,
  'فطير بالحليب': images.assortedSweets,
  'بسكويت بالقشطة': images.pistachioBaklava,
  'اصابع بالقشطة': images.pistachioBaklava,
  'وربات بالقشطة': images.pistachioBaklava,
  'برمه حلبي بالقشطة': images.pistachioBaklava,
  'هريسة بالقشطة': images.assortedSweets,
  'مياه صغير': images.water,
  'مياه كبير': images.water,
  'كوكا كولا': images.cola,
  'سودا': images.sprite,
  'سبرايت': images.sprite,
};

const imageFields = (name: string, fallback: string) => {
  const image = productImages[name] ?? fallback;
  return {
    image,
    ...(image === images.nabulsiKnafeh ? {
      imageCredit: 'Leen.salem — CC BY-SA 4.0',
      imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:%D8%A7%D9%84%D9%83%D9%86%D8%A7%D9%81%D8%A9_%D8%A7%D9%84%D9%86%D8%A7%D8%A8%D9%84%D8%B3%D9%8A%D8%A9.jpg',
    } : {}),
  };
};

const sized = [
  ['كنافة اسطنبولية بالفستق الناعم', 'charcoal', [15, 30, 55, 80, 100, 135, 165, 190], [null, null, 63, 90, 110, 145, 175, 200], iceCream],
  ['كنافة اسطنبولية فستق أكسترا', 'charcoal', [15, 30, 60, 85, 110, 150, 180, 210], [null, null, 68, 90, 110, 160, 190, 220], iceCream],
  ['كنافة نابلسية ناعمة', 'charcoal', [10, 20, 40, 58, 76, 90, 110, 125], [null, null, 48, 67, 86, 100, 120, 135], iceCream],
  ['كنافة اسطنبولية محيرة', 'charcoal', [10, 20, 40, 60, 85, 110, 120, 140], [null, 30, 48, 70, 95, 120, 130, 150], iceCream],
  ['اسطنبولية بحشوة الجبن والفستق الحلبي', 'charcoal', [13, 25, 52, 75, 100, 130, 155, 180], [null, null, 60, 85, 110, 140, 165, 190], iceCream],
  ['اسطنبولية بالقشطة', 'charcoal', [12, 25, 50, 75, 95, 125, 150, 175], [null, null, 58, 85, 105, 135, 160, 185], [{ name: 'حشوة بالفستق', price: 3 }, ...iceCream]],
  ['كنافة برغر', 'charcoal', [15, 35], [null, null], sauces, ['XS', 'S']],
  ['كنافة اسطنبولية بالشوكولاته', 'nutella', [12, 25], [null, null], sauces, ['XS', 'S']],
];

const fixed = [
  ['فطير السلطان', 40, 'oriental'], ['بقلاوة بالبوظة', 15, 'oriental'], ['كنافة برمة بالجبنة', 36, 'oriental'],
  ['بصله فستق', 95, 'oriental'], ['ععملية (عملية)', 38, 'oriental'], ['بين نارين', 36, 'oriental'],
  ['خدود', 45, 'oriental'], ['مدلوقة', 50, 'oriental'], ['عش بلبل', 55, 'oriental'], ['حلاوة جبن', 40, 'oriental'],
  ['اصابع فستق دولما', 95, 'oriental'], ['ترليشيا', 50, 'oriental'], ['فطير بالجبنة', 34, 'oriental'],
  ['فطير بالحليب', 32, 'oriental'], ['بسكويت بالقشطة', 38, 'oriental'], ['اصابع بالقشطة', 40, 'oriental'],
  ['وربات بالقشطة', 40, 'oriental'], ['برمه حلبي بالقشطة', 45, 'oriental'], ['هريسة بالقشطة', 40, 'oriental'],
  ['مياه صغير', 3, 'beverages'], ['مياه كبير', 5, 'beverages'], ['كوكا كولا', 3, 'beverages'],
  ['سودا', 3, 'beverages'], ['سبرايت', 3, 'beverages'],
];

export const OFFICIAL_PRODUCTS: Product[] = [
  ...sized.map(([name, category, dineIn, takeaway, addOns, customSizes]: any, index) => {
    const itemSizes: string[] = customSizes ?? sizes;
    const variants = itemSizes.map((size, i) => ({
      id: `menu-${index + 1}-${size.replace('.', '-')}`,
      name: `حجم ${size}`,
      price: dineIn[i],
      dineInPrice: dineIn[i],
      ...(takeaway[i] == null ? {} : { takeawayPrice: takeaway[i] }),
      ...(i === 0 ? { isDefault: true } : {}),
    }));
    return {
      id: `menu-${index + 1}`, name, category, description: '', basePrice: variants[0].price,
      isInitialPrice: false, ...imageFields(name, images.nabulsiKnafeh), isAvailable: true, featured: false, variants, addOns,
    };
  }),
  ...fixed.map(([name, price, category]: any, index) => ({
    id: `menu-fixed-${index + 1}`, name, category, description: '', basePrice: price,
    isInitialPrice: false, ...imageFields(name, images.assortedSweets), isAvailable: true, featured: false,
    variants: [{ id: `menu-fixed-${index + 1}-single`, name: 'حجم واحد', price, dineInPrice: price, isDefault: true }],
  })),
];

export const HEALTHY_SYRUP_NOTE = 'يوجد لدينا اصناف صحية، يمكن استبدال القطر العادي لقطر صحي';
