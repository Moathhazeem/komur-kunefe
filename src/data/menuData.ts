import { Product } from '../types';

const sizes = ['XS', 'S', 'M', 'L', 'XL', '2.5', '3', '3.5'];
const iceCream = [{ name: 'إضافة بوظة', price: 4 }];
const sauces = ['نوتيلا', 'لوتس', 'زبدة الفستق', 'شوكولاته بيضاء'].map((name) => ({ name, price: 4 }));

const images = {
  kunefePistachio: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/K%C3%BCnefe_Pistachio.JPG/1280px-K%C3%BCnefe_Pistachio.JPG',
  nabulsiKnafeh: 'https://img-global.cpcdn.com/recipes/276d7237ed1de5a8/680x781cq80/%D8%A7%D9%84%D8%B5%D9%88%D8%B1%D8%A9-%D8%A7%D9%84%D8%B1%D8%A6%D9%8A%D8%B3%D9%8A%D8%A9-%D9%84%D9%88%D8%B5%D9%81%D8%A9%D9%83%D9%86%D8%A7%D9%81%D8%A9-%D9%86%D8%A7%D8%A8%D9%84%D8%B3%D9%8A%D8%A9-%D9%86%D8%A7%D8%B9%D9%85%D8%A9.jpg',
  kunefeAshta: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6d/K%C3%BCnefe_-_pistachio.jpg/1280px-K%C3%BCnefe_-_pistachio.jpg',
  burgerKunafa: 'https://img.ananinja.com/media/ninja-catalog-42/restaurants/shuqkz9369sm88dixqaq86ux48ls/69918cd794c5410346ece04f.jpg?q=75&w=1080',
  chocolateKunefe: 'https://static.wixstatic.com/media/99649a_3ae3c95ff023440b84fd5ed1c7bfd877~mv2.jpg/v1/fill/w_980%2Ch_667%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01%2Cenc_auto/99649a_3ae3c95ff023440b84fd5ed1c7bfd877~mv2.jpg',
  feteer: 'https://sceneeats.com/Content/Admin/Uploads/Articles/ArticleImages/4c8499ea-1027-4753-805e-344007eb5920.jpg',
  baklavaIceCream: 'https://d1w7312wesee68.cloudfront.net/zs8MP5aUHuJ4BTNjjlx5AIX_aRZPuBvx_oX_LPcoW0M/resize%3Afit%3A720%3A720/plain/s3%3A/toasttab/restaurants/restaurant-206988000000000000/menu/images/item-c9b0020c-30fe-457d-a053-f8a8d4b53546.jpg',
  bormaPistachio: 'https://sweetsjerusalem.com/cdn/shop/files/DSC03682.jpg?v=1745324737&width=1946',
  creamRolls: 'https://www.zamanalwsl.net/CustomImage/get/700/500/365-fe1a53fb0c.jpg',
  osmalieh: '/amalieh.jpg',
  creamFingers: 'https://img.ananinja.com/media/ninja-catalog-42/restaurants/4zlelh8lj2pvnw6ttwh3l51nvbq1/3333881.jpg?q=75&w=1080',
  burmaCream: 'https://media.zid.store/thumbs/909c78da-e62f-4a46-9c02-d266b83c09f3/054e3ba7-c1a1-4fb1-ba88-b1be64dcc91d-thumbnail-770x770-70.jpg',
  cheeseKunafa: 'https://images.deliveryhero.io/image/menu-import-gateway-prd/regions/ME/chains/HS-HMF/56cf4da9599c6835fd40f5514d0089aa.jpg?quality=75&webp=true&width=1440',
  khodood: 'https://www.her-news.com/Upload/libfiles/14/8/650.jpg',
  madlouqa: 'https://www.jabri.com.jo/sites/default/files/madlooa_2.jpg',
  birdNest: 'https://cdn.salla.sa/ZwNrO/HoDSVP6l0p2E8Z8mTCfpRO6ATEXoVorx53LxVndt.jpg',
  halawetJibn: 'https://cdn.tasteatlas.com/images/dishes/a1008d8c9b664b20a8fddda74ef7093c.jpg?h=560&w=1920',
  pistachioBurma: 'https://static.wixstatic.com/media/d21864_408b6b37d6a049008fd3b5d02ba37f60~mv2.jpg/v1/fill/w_480%2Ch_534%2Cal_c%2Cq_80%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/d21864_408b6b37d6a049008fd3b5d02ba37f60~mv2.jpg',
  trilece: 'https://www.ismailkaratas.com.tr/img/yenitarif/2285/trelice.jpg',
  feteerMilk: 'https://www.eldahan.com/foods/Milk_Cr%C3%A8me_Feteer.jpg',
  creamBiscuits: 'https://wholesale.herbsnbeans.co.uk/cdn/shop/files/abu-walad-sandwich-biscuits.jpg?v=1772104055&width=3840',
  warbat: 'https://falasteenifoodie.com/wp-content/uploads/2025/03/Middle-Eastern-Warbat-Bil-Ashta-1024x754.jpg',
  harissaAshta: 'https://alsultanoglu.com/cdn/shop/files/1_0cbbf28e-63a2-4ad6-8c4c-0afd9966bfc8_1024x1024.png?v=1720509901',
  waterSmall: 'https://ik.imagekit.io/pimberly/595e406f0f15f30010780448/6e6a9e01/66788e6c4b07950019667018/NL10016_01.jpg?tr=w-600%2Ch-600%2Ccm-pad_resize%2Cbg-FFFFFF',
  waterLarge: 'https://aqua-amore.com/cdn/shop/collections/Radnor-1500ml-Plastic-Bottl-247x300_large.jpg?v=1755596553',
  cola: '/coca-cola.jpg',
  soda: 'https://www.ready2drink.de/cdn/shop/products/10227_r2d_Schweppes_SodaWater_1A_1080x1080px_230321_720x.png?v=1679399038',
  sprite: 'https://clickandcollect.scandipark.dk/media/image/product/9712/lg/sprite-05l-plus-pant.jpg',
};

const productImages: Record<string, string> = {
  'كنافة اسطنبولية بالفستق الناعم': images.kunefePistachio,
  'كنافة اسطنبولية فستق أكسترا': images.kunefePistachio,
  'كنافة نابلسية ناعمة': images.nabulsiKnafeh,
  'كنافة اسطنبولية محيرة': images.kunefeAshta,
  'اسطنبولية بحشوة الجبن والفستق الحلبي': images.kunefePistachio,
  'اسطنبولية بالقشطة': images.kunefeAshta,
  'كنافة برغر': images.burgerKunafa,
  'كنافة اسطنبولية بالشوكولاته': images.chocolateKunefe,
  'فطير السلطان': images.feteer,
  'بقلاوة بالبوظة': images.baklavaIceCream,
  'كنافة برمة بالجبنة': images.kunefeAshta,
  'بصله فستق': images.bormaPistachio,
  'ععملية (عملية)': images.osmalieh,
  'بين نارين': images.cheeseKunafa,
  'خدود': images.khodood,
  'مدلوقة': images.madlouqa,
  'عش بلبل': images.birdNest,
  'حلاوة جبن': images.halawetJibn,
  'اصابع فستق دولما': images.pistachioBurma,
  'ترليشيا': images.trilece,
  'فطير بالجبنة': images.feteer,
  'فطير بالحليب': images.feteerMilk,
  'بسكويت بالقشطة': images.creamBiscuits,
  'اصابع بالقشطة': images.creamFingers,
  'وربات بالقشطة': images.warbat,
  'برمه حلبي بالقشطة': images.burmaCream,
  'هريسة بالقشطة': images.harissaAshta,
  'مياه صغير': images.waterSmall,
  'مياه كبير': images.waterLarge,
  'كوكا كولا': images.cola,
  'سودا': images.soda,
  'سبرايت': images.sprite,
};

const imageFields = (name: string, fallback: string) => {
  const image = productImages[name] ?? fallback;
  const isPistachioKunefe = image === images.kunefePistachio;
  const isKaymakKunefe = image === images.kunefeAshta;
  const isLocalCola = image === images.cola;
  const isLocalOsmalieh = image === images.osmalieh;
  return {
    image,
    imageCredit: isPistachioKunefe ? 'Benreis — CC BY 3.0'
      : isKaymakKunefe ? 'E4024 — CC BY-SA 4.0'
      : isLocalCola ? 'Ossewa — CC BY-SA 4.0'
      : isLocalOsmalieh ? 'Image source: Baitiana'
      : `Image source: ${new URL(image).hostname}`,
    imageCreditUrl: isPistachioKunefe ? 'https://commons.wikimedia.org/wiki/File:K%C3%BCnefe_Pistachio.JPG'
      : isKaymakKunefe ? 'https://commons.wikimedia.org/wiki/File:K%C3%BCnefe_-_pistachio.jpg'
      : isLocalCola ? 'https://commons.wikimedia.org/wiki/File:Coca-Cola_330ml_can.jpg'
      : isLocalOsmalieh ? 'https://baitiana.com/2024/03/11/osmaliyi-bil-ashta-dessert/'
      : image,
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
