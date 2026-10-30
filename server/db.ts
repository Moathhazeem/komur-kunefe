import fs from 'fs';
import path from 'path';

export interface ProductVariant {
  id: string;
  name: string; // e.g., "حجم واحد", "صحن فردي", "سدر صغير", "سدر وسط", "سدر كبير"
  price: number;
  isDefault?: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: 'charcoal' | 'nutella' | 'nawashef' | 'other' | 'offers';
  description: string;
  basePrice: number;
  isInitialPrice: boolean; // Flag "سعر مبدئي - يحتاج مراجعة"
  image: string;
  isAvailable: boolean;
  variants: ProductVariant[];
  isSeasonal?: boolean;
  featured?: boolean;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  variantId: string;
  variantName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  total: number;
  pickupTime: string;
  notes?: string;
  status: 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  paymentMethod: 'mock_online' | 'cash_on_pickup';
  paymentStatus: 'paid' | 'pending';
  source: 'website' | 'instagram' | 'facebook' | 'whatsapp';
  createdAt: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  discountPercent: number;
  badge: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  includedProductNames: string[];
}

export interface Review {
  id: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  isApproved: boolean;
  isDemo?: boolean;
  createdAt: string;
}

export interface DeliveryInterest {
  id: string;
  area: string;
  customerPhone: string;
  notes?: string;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  branch: string;
  phone: string;
  whatsapp: string;
  hours: string;
  facebookUrl: string;
  instagramUrl: string;
  logoUrl: string;
  announcementBanner: string;
  ourStory: string;
  isStoryDraft: boolean;
}

export interface DatabaseSchema {
  products: Product[];
  orders: Order[];
  offers: Offer[];
  reviews: Review[];
  deliveryInterests: DeliveryInterest[];
  settings: StoreSettings;
}

const DB_FILE = path.resolve(process.cwd(), 'database.json');

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'كنافة نابلسية خشنة ع الفحم',
    category: 'charcoal',
    description: 'كنافة خشنة بالسمن البلدي الفاخر والجبنة النابلسية البلدية تُخبز على جمر الفحم الطبيعي لحظة بلحظة حتى تصبح ذهبية مقرمشة.',
    basePrice: 25,
    isInitialPrice: true,
    image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    featured: true,
    variants: [
      { id: 'v-1-1', name: 'حجم واحد (صحن شخصي فاخر)', price: 25, isDefault: true },
      { id: 'v-1-2', name: 'سدر صغير (2-3 أشخاص)', price: 65 },
      { id: 'v-1-3', name: 'سدر وسط (5-6 أشخاص)', price: 110 },
      { id: 'v-1-4', name: 'سدر كبير مناسبات (10 أشخاص)', price: 190 }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-2',
    name: 'كنافة نابلسية ناعمة ع الفحم',
    category: 'charcoal',
    description: 'الكنافة النابلسية الناعمة الكلاسيكية، ناعمة ومحمرة بعناية على الجمر الهادئ، مع مطة الجبنة البلدية الأصيلة ورشة فستق حلبي أخضر.',
    basePrice: 25,
    isInitialPrice: true,
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    featured: true,
    variants: [
      { id: 'v-2-1', name: 'حجم واحد (صحن شخصي فاخر)', price: 25, isDefault: true },
      { id: 'v-2-2', name: 'سدر صغير (2-3 أشخاص)', price: 65 },
      { id: 'v-2-3', name: 'سدر وسط (5-6 أشخاص)', price: 110 }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-3',
    name: 'كنافة نوتيلا فاخرة ع الفحم',
    category: 'nutella',
    description: 'مزيج استثنائي يجمع بين قرمشة عجينة الكنافة المحمصة على الفحم وشوكولاتة النوتيلا الأصلية الغنية والمكسرات المحمصة.',
    basePrice: 30,
    isInitialPrice: true,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    featured: true,
    variants: [
      { id: 'v-3-1', name: 'حجم واحد (صحن شخصي)', price: 30, isDefault: true },
      { id: 'v-3-2', name: 'سدر مشاركة نوتيلا', price: 85 }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-4',
    name: 'كنافة مكس نصفين (جبنة بلدي + نوتيلا)',
    category: 'nutella',
    description: 'نصف كنافة جبنة بلدية نابلسية ع الفحم ونصف كنافة نوتيلا بلجيكية، تلبي جميع الأذواق في صحن واحد.',
    basePrice: 32,
    isInitialPrice: true,
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    variants: [
      { id: 'v-4-1', name: 'حجم واحد (طبق مكس)', price: 32, isDefault: true }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-5',
    name: 'بين نارين بالجبنة النابلسية ع الفحم',
    category: 'charcoal',
    description: 'طبقة كنافة مقرمشة من الأعلى وأخرى من الأسفل تحتضنان الجبنة الساخنة المذابة مع نفحة الفحم الفريدة.',
    basePrice: 28,
    isInitialPrice: true,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    variants: [
      { id: 'v-5-1', name: 'حجم واحد (صحن شخصي)', price: 28, isDefault: true }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-6',
    name: 'معمول العيد الفاخر بالجوز البلدي',
    category: 'nawashef',
    description: 'نواشف العيد الموسمية: معمول محشو بأجود أنواع الجوز البلدي والقرفة والمحلب والسمن البقري الصافي.',
    basePrice: 45,
    isInitialPrice: true,
    image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isSeasonal: true,
    variants: [
      { id: 'v-6-1', name: 'علبة نصف كيلو', price: 25 },
      { id: 'v-6-2', name: 'علبة كيلو كامل فاخرة', price: 45, isDefault: true }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-7',
    name: 'معمول العيد بالتمر النابلسي',
    category: 'nawashef',
    description: 'عجينة السميد الناعمة المعطرة باليانسون والشومر محشوة بعجوة التمر المتبلة بالسمن البلدي.',
    basePrice: 35,
    isInitialPrice: true,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isSeasonal: true,
    variants: [
      { id: 'v-7-1', name: 'علبة كيلو فاخرة', price: 35, isDefault: true }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-8',
    name: 'غريبة شامية بالفستق الحلبي',
    category: 'nawashef',
    description: 'نواشف العيد: حبات الغريبة الهشة تذوب في الفم مع حبة فستق حلبي فاخرة.',
    basePrice: 40,
    isInitialPrice: true,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isSeasonal: true,
    variants: [
      { id: 'v-8-1', name: 'علبة كيلو', price: 40, isDefault: true }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-9',
    name: 'قهوة تركية على رمل وجمر الفحم',
    category: 'other',
    description: 'فنجان قهوة محوّجة بالهيل الفلسطيني مطبوخة على نار هادئة.',
    basePrice: 6,
    isInitialPrice: true,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    variants: [
      { id: 'v-9-1', name: 'فنجان واحد', price: 6, isDefault: true }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-10',
    name: 'شاي خمير مع الميرمية والنعناع',
    category: 'other',
    description: 'كأس شاي مخمّر على الجمر بالطريقة التقليدية مع الميرمية الجبلية الفلسطينية.',
    basePrice: 5,
    isInitialPrice: true,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    variants: [
      { id: 'v-10-1', name: 'كأس واحد', price: 5, isDefault: true }
    ],
    createdAt: new Date().toISOString()
  }
];

const INITIAL_OFFERS: Offer[] = [
  {
    id: 'off-1',
    title: 'عرض لمة العيلة (سدر ع الفحم + شاي خمير مجانًا)',
    description: 'اطلب أي سدر كنافة نابلسية ع الفحم (وسط أو كبير) واحصل على إبريق شاي خمير على الفحم مجانًا.',
    discountPercent: 15,
    badge: 'عرض نهاية الأسبوع',
    startDate: '2026-10-01',
    endDate: '2026-12-31',
    isActive: true,
    includedProductNames: ['كنافة نابلسية خشنة ع الفحم', 'كنافة نابلسية ناعمة ع الفحم']
  },
  {
    id: 'off-2',
    title: 'عرض نواشف العيد وموسم البركة',
    description: 'خصم 10% عند طلب علبتين معمول (جوز وتمر) مع تغليف هدايا أنيق.',
    discountPercent: 10,
    badge: 'موسمي خاص',
    startDate: '2026-10-15',
    endDate: '2026-11-30',
    isActive: true,
    includedProductNames: ['معمول العيد الفاخر بالجوز البلدي', 'معمول العيد بالتمر النابلسي']
  }
];

const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Kömür Künefe — كنافة ع الفحم',
  tagline: 'المذاق النابلسي الأصيل على جمر الفحم الطبيعي',
  branch: 'رافِدية - الشارع الرئيسي (بجانب دوار الشهداء والجامعة القديمة)، نابلس، فلسطين',
  phone: '+970 562 606 061',
  whatsapp: '970562606061',
  hours: 'يوميًا: 11:00 صباحًا – 12:00 منتصف الليل (في العطلات والمناسبات حتى 1:00 فجرًا)',
  facebookUrl: 'https://www.facebook.com/Komurkunefe/',
  instagramUrl: 'https://www.instagram.com/komurkunefe',
  logoUrl: '',
  announcementBanner: '🔥 كنافة نابلسية ساخنة ومقرمشة تُخبز مباشرة على جمر الفحم الطبيعي في رافدية!',
  ourStory: 'بدأت قصة "كُومُر كُونافيه" من إيماننا بأن سر الكنافة النابلسية الحقيقي لا يكتمل إلا مع حرارة جمر الفحم الهادئة. نستخدم أجود أنواع الجبنة البلدية النابلسية الطازجة مع السمن الأصيل، ونخبز كل صحن وسدر على الفحم لنوفر نكهة مدخنة خفيفة وقرمشة ذهبية لا تنسى. زورونا في رافدية لتتذوقوا الفرق بأنفسكم!',
  isStoryDraft: true
};

// Generate realistic simulated orders for analytics (tagged with source and hours)
function generateSampleOrders(): Order[] {
  const sources: Order['source'][] = ['website', 'instagram', 'facebook', 'whatsapp'];
  const customerNames = [
    'أحمد المصري', 'محمد حسونة', 'سامر خليل', 'خالد يعيش', 'رنا التميمي', 
    'محمود الشكعة', 'ليلى جردانة', 'طارق عنبتاوي', 'يوسف دروزة', 'هبة صوالحة',
    'عمر حجاوي', 'نور المصري', 'علاء كنعان', 'بشار شاهين', 'فاطمة العالول'
  ];
  const phones = ['0599123456', '0568987654', '0598765432', '0569112233', '0595334455'];
  
  const sampleOrders: Order[] = [];
  const now = Date.now();

  // Create 45 historical orders across the last 30 days
  for (let i = 0; i < 45; i++) {
    const daysAgo = Math.floor(Math.random() * 28);
    // Peak hours usually 17:00 to 23:00 (5pm to 11pm)
    const hour = Math.random() > 0.3 ? 17 + Math.floor(Math.random() * 6) : 12 + Math.floor(Math.random() * 5);
    const minute = Math.floor(Math.random() * 60);
    const orderDate = new Date(now - daysAgo * 24 * 3600 * 1000);
    orderDate.setHours(hour, minute, 0, 0);

    const numItems = Math.floor(Math.random() * 2) + 1;
    const items: OrderItem[] = [];
    let orderTotal = 0;

    for (let j = 0; j < numItems; j++) {
      // Skew towards top-seller: كنافة خشنة ع الفحم or كنافة نوتيلا
      const productIndex = Math.random() > 0.4 ? (Math.random() > 0.5 ? 0 : 2) : Math.floor(Math.random() * INITIAL_PRODUCTS.length);
      const prod = INITIAL_PRODUCTS[productIndex];
      const variant = prod.variants[0];
      const qty = Math.random() > 0.7 ? 2 : 1;
      items.push({
        productId: prod.id,
        name: prod.name,
        variantId: variant.id,
        variantName: variant.name,
        price: variant.price,
        quantity: qty
      });
      orderTotal += variant.price * qty;
    }

    const orderNum = `KM-${8000 + i}`;
    const source = sources[Math.floor(Math.random() * sources.length)];
    const status: Order['status'] = i < 3 ? 'new' : (i < 6 ? 'preparing' : 'completed');

    sampleOrders.push({
      id: `ord-${i + 1}`,
      orderNumber: orderNum,
      customerName: customerNames[i % customerNames.length],
      customerPhone: phones[i % phones.length],
      items,
      total: orderTotal,
      pickupTime: 'خلال 20-30 دقيقة',
      notes: i % 3 === 0 ? 'قطر خفيف، زيادة فستق لو سمحتم' : '',
      status,
      paymentMethod: i % 2 === 0 ? 'mock_online' : 'cash_on_pickup',
      paymentStatus: i % 2 === 0 ? 'paid' : (status === 'completed' ? 'paid' : 'pending'),
      source,
      createdAt: orderDate.toISOString()
    });
  }

  // Sort by date desc
  return sampleOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    customerName: 'إبراهيم النابلسي',
    rating: 5,
    comment: 'أطيب كنافة ع الفحم في نابلس! نكهة الجمر مع مطة الجبنة البلدية بتفرق كثير عن أفران الغاز. الله يباركلكم.',
    isApproved: true,
    isDemo: true,
    createdAt: '2026-10-25T19:30:00Z'
  },
  {
    id: 'rev-2',
    customerName: 'ميساء عودة',
    rating: 5,
    comment: 'كنافة النوتيلا بتجنن، مقرمشة ومش مشبعة قطر كثير، متوازنة جدًا. بنصح الكل يجربها في رافدية.',
    isApproved: true,
    isDemo: true,
    createdAt: '2026-10-27T18:15:00Z'
  },
  {
    id: 'rev-3',
    customerName: 'طارق الدبيك',
    rating: 5,
    comment: 'استلام سريع من المحل والشباب محترمين جداً وخدومين. الكنافة وصلت سخنة وبتشهي.',
    isApproved: true,
    isDemo: true,
    createdAt: '2026-10-28T21:00:00Z'
  }
];

const INITIAL_DELIVERY_INTERESTS: DeliveryInterest[] = [
  {
    id: 'del-1',
    area: 'رفيديا - شارع 15 قرب الأكاديمية',
    customerPhone: '0599112233',
    notes: 'يا ريت توفروا توصيل سريع وقت السهرة',
    createdAt: '2026-10-24T20:10:00Z'
  },
  {
    id: 'del-2',
    area: 'حي المعاجين - نابلس',
    customerPhone: '0568445566',
    notes: 'بطلب أسبوعياً لو في توصيل',
    createdAt: '2026-10-26T21:40:00Z'
  },
  {
    id: 'del-3',
    area: 'الجبل الشمالي - قرب المستشفى الإنجيلي',
    customerPhone: '0597332211',
    notes: '',
    createdAt: '2026-10-27T17:25:00Z'
  },
  {
    id: 'del-4',
    area: 'المخفية - قرب الحرم الجامعي الجديد',
    customerPhone: '0569778899',
    notes: 'طلاب سكنات بنطلب دايمًا',
    createdAt: '2026-10-28T22:15:00Z'
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error reading database file, initializing defaults:', e);
    }

    const initial: DatabaseSchema = {
      products: INITIAL_PRODUCTS,
      orders: generateSampleOrders(),
      offers: INITIAL_OFFERS,
      reviews: INITIAL_REVIEWS,
      deliveryInterests: INITIAL_DELIVERY_INTERESTS,
      settings: INITIAL_SETTINGS
    };

    this.saveData(initial);
    return initial;
  }

  private saveData(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing database:', e);
    }
  }

  public getProducts(): Product[] {
    return this.data.products;
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  public saveProduct(product: Product): Product {
    const idx = this.data.products.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      this.data.products[idx] = product;
    } else {
      this.data.products.push(product);
    }
    this.saveData(this.data);
    return product;
  }

  public deleteProduct(id: string): boolean {
    const len = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    if (this.data.products.length !== len) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  public getOrders(): Order[] {
    return this.data.orders;
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id || o.orderNumber === id);
  }

  public addOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Order {
    const orderNumber = `KM-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString()
    };
    this.data.orders.unshift(newOrder);
    this.saveData(this.data);
    return newOrder;
  }

  public updateOrderStatus(id: string, status: Order['status']): Order | null {
    const order = this.data.orders.find(o => o.id === id || o.orderNumber === id);
    if (!order) return null;
    order.status = status;
    if (status === 'completed' && order.paymentMethod === 'cash_on_pickup') {
      order.paymentStatus = 'paid';
    }
    this.saveData(this.data);
    return order;
  }

  public getOffers(): Offer[] {
    return this.data.offers;
  }

  public saveOffer(offer: Offer): Offer {
    const idx = this.data.offers.findIndex(o => o.id === offer.id);
    if (idx >= 0) {
      this.data.offers[idx] = offer;
    } else {
      this.data.offers.push(offer);
    }
    this.saveData(this.data);
    return offer;
  }

  public deleteOffer(id: string): boolean {
    const len = this.data.offers.length;
    this.data.offers = this.data.offers.filter(o => o.id !== id);
    if (this.data.offers.length !== len) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  public getReviews(onlyApproved = true): Review[] {
    if (onlyApproved) {
      return this.data.reviews.filter(r => r.isApproved);
    }
    return this.data.reviews;
  }

  public addReview(reviewData: { customerName: string; rating: number; comment: string }): Review {
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      customerName: reviewData.customerName,
      rating: reviewData.rating,
      comment: reviewData.comment,
      isApproved: false, // Requires owner approval
      isDemo: false,
      createdAt: new Date().toISOString()
    };
    this.data.reviews.unshift(newReview);
    this.saveData(this.data);
    return newReview;
  }

  public updateReviewStatus(id: string, isApproved: boolean): Review | null {
    const rev = this.data.reviews.find(r => r.id === id);
    if (!rev) return null;
    rev.isApproved = isApproved;
    this.saveData(this.data);
    return rev;
  }

  public deleteReview(id: string): boolean {
    const len = this.data.reviews.length;
    this.data.reviews = this.data.reviews.filter(r => r.id !== id);
    if (this.data.reviews.length !== len) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  public clearDemoReviews(): void {
    this.data.reviews = this.data.reviews.filter(r => !r.isDemo);
    this.saveData(this.data);
  }

  public getDeliveryInterests(): DeliveryInterest[] {
    return this.data.deliveryInterests;
  }

  public addDeliveryInterest(area: string, customerPhone: string, notes?: string): DeliveryInterest {
    const item: DeliveryInterest = {
      id: `del-${Date.now()}`,
      area,
      customerPhone,
      notes,
      createdAt: new Date().toISOString()
    };
    this.data.deliveryInterests.unshift(item);
    this.saveData(this.data);
    return item;
  }

  public getSettings(): StoreSettings {
    return this.data.settings;
  }

  public updateSettings(newSettings: Partial<StoreSettings>): StoreSettings {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.saveData(this.data);
    return this.data.settings;
  }

  public resetSampleData(): void {
    this.data = {
      products: INITIAL_PRODUCTS,
      orders: generateSampleOrders(),
      offers: INITIAL_OFFERS,
      reviews: INITIAL_REVIEWS,
      deliveryInterests: INITIAL_DELIVERY_INTERESTS,
      settings: INITIAL_SETTINGS
    };
    this.saveData(this.data);
  }

  // Analytics helper methods
  public getAnalytics(filter: { range?: string; from?: string; to?: string }) {
    const orders = this.data.orders.filter(o => o.status !== 'cancelled');
    const now = new Date();
    let startDate = new Date();

    if (filter.range === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (filter.range === '7d') {
      startDate.setDate(now.getDate() - 7);
    } else if (filter.range === '30d') {
      startDate.setDate(now.getDate() - 30);
    } else if (filter.from && filter.to) {
      startDate = new Date(filter.from);
      now.setTime(new Date(filter.to).getTime());
    } else {
      // Default 7 days
      startDate.setDate(now.getDate() - 7);
    }

    const filteredOrders = orders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= startDate && d <= now;
    });

    const totalSales = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

    // Customer analysis
    const customerOrderCounts: Record<string, number> = {};
    filteredOrders.forEach(o => {
      const key = o.customerPhone || o.customerName;
      customerOrderCounts[key] = (customerOrderCounts[key] || 0) + 1;
    });
    const repeatCustomers = Object.values(customerOrderCounts).filter(c => c > 1).length;

    // Product breakdown
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    filteredOrders.forEach(o => {
      o.items.forEach(item => {
        if (!productSales[item.name]) {
          productSales[item.name] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productSales[item.name].quantity += item.quantity;
        productSales[item.name].revenue += item.price * item.quantity;
      });
    });

    const productList = Object.values(productSales);
    const topProducts = [...productList].sort((a, b) => b.quantity - a.quantity);
    const leastProducts = [...productList].sort((a, b) => a.quantity - b.quantity);

    // Peak hours
    const hourlyDistribution: Record<number, number> = {};
    for (let h = 0; h < 24; h++) hourlyDistribution[h] = 0;
    filteredOrders.forEach(o => {
      const h = new Date(o.createdAt).getHours();
      hourlyDistribution[h] = (hourlyDistribution[h] || 0) + 1;
    });

    // Traffic source breakdown
    const sourceBreakdown: Record<string, number> = {
      website: 0,
      instagram: 0,
      facebook: 0,
      whatsapp: 0
    };
    filteredOrders.forEach(o => {
      sourceBreakdown[o.source] = (sourceBreakdown[o.source] || 0) + 1;
    });

    // Delivery requests breakdown by area
    const deliveryDemandByArea: Record<string, number> = {};
    this.data.deliveryInterests.forEach(d => {
      deliveryDemandByArea[d.area] = (deliveryDemandByArea[d.area] || 0) + 1;
    });

    return {
      period: {
        from: startDate.toISOString(),
        to: now.toISOString(),
        range: filter.range || '7d'
      },
      summary: {
        totalSales,
        totalOrders,
        avgOrderValue,
        repeatCustomers,
        totalCustomers: Object.keys(customerOrderCounts).length
      },
      topProducts: topProducts.slice(0, 5),
      leastProducts: leastProducts.slice(0, 5),
      hourlyDistribution,
      sourceBreakdown,
      deliveryDemand: {
        totalVotes: this.data.deliveryInterests.length,
        byArea: deliveryDemandByArea
      }
    };
  }
}

export const db = new Database();
