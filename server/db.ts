import fs from 'fs';
import path from 'path';
import { OFFICIAL_PRODUCTS, HEALTHY_SYRUP_NOTE } from '../src/data/menuData';

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  dineInPrice?: number;
  takeawayPrice?: number;
  isDefault?: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: 'charcoal' | 'nutella' | 'nawashef' | 'other' | 'offers' | 'oriental' | 'beverages';
  description: string;
  basePrice: number;
  isInitialPrice: boolean;
  image: string;
  imageCredit?: string;
  imageCreditUrl?: string;
  isAvailable: boolean;
  variants: ProductVariant[];
  isSeasonal?: boolean;
  featured?: boolean;
  addOns?: Array<{ name: string; price: number }>;
  addOnGroups?: Array<{ name: string; options: Array<{ name: string; price: number }> }>;
  createdAt?: string;
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
  deliveryFee?: number;
  fulfillment?: 'pickup' | 'delivery';
  deliveryAddress?: string;
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
  healthySyrupNote?: string;
  isStoreOpen?: boolean;
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

// EXCLUSIVE: The 8 official items of Kömür Künefe
export const INITIAL_PRODUCTS: Product[] = OFFICIAL_PRODUCTS;

const INITIAL_OFFERS: Offer[] = [
  {
    id: 'off-1',
    title: 'عرض لمة العيلة (سدر إسطنبولية ع الفحم)',
    description: 'اطلب أي سدر إسطنبولية ع الفحم واحصل على إضافة بوظة تركية مجاناً.',
    discountPercent: 15,
    badge: 'عرض خاص',
    startDate: '2026-10-01',
    endDate: '2026-12-31',
    isActive: true,
    includedProductNames: ['إسطنبولية بالقشطة', 'إسطنبولية محيرة', 'كنافة نابلسية ناعمة ع الفحم'],
  },
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
  announcementBanner: '🔥 المنيو الجديد متوفر الآن | إضافة بوظة لبعض الأصناف بـ 4 شيكل',
  healthySyrupNote: HEALTHY_SYRUP_NOTE,
  isStoreOpen: true,
  ourStory: 'بدأت قصة "كُومُر كُونافيه" من إيماننا بأن سر الكنافة النابلسية والإسطنبولية الحقيقي لا يكتمل إلا مع حرارة جمر الفحم الهادئة. نستخدم أجود أنواع الجبنة البلدية النابلسية والقشطة الطازجة والفستق الحلبي الفاخر مع السمن الأصيل، ونخبز كل صحن وسدر على الفحم لنوفر نكهة مدخنة خفيفة وقرمشة ذهبية لا تنسى. زورونا في رافدية لتتذوقوا الفرق بأنفسكم!',
  isStoryDraft: false,
};

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

  for (let i = 0; i < 40; i++) {
    const daysAgo = Math.floor(Math.random() * 28);
    const hour = Math.random() > 0.3 ? 17 + Math.floor(Math.random() * 6) : 12 + Math.floor(Math.random() * 5);
    const minute = Math.floor(Math.random() * 60);
    const orderDate = new Date(now - daysAgo * 24 * 3600 * 1000);
    orderDate.setHours(hour, minute, 0, 0);

    const numItems = Math.floor(Math.random() * 2) + 1;
    const items: OrderItem[] = [];
    let orderTotal = 0;

    for (let j = 0; j < numItems; j++) {
      const productIndex = Math.floor(Math.random() * INITIAL_PRODUCTS.length);
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
      notes: i % 3 === 0 ? 'قطر خفيف، زيادة فستق حلبي' : '',
      status,
      paymentMethod: i % 2 === 0 ? 'mock_online' : 'cash_on_pickup',
      paymentStatus: 'paid',
      source,
      createdAt: orderDate.toISOString()
    });
  }

  return sampleOrders;
}

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    customerName: 'إبراهيم النابلسي',
    rating: 5,
    comment: 'أطيب إسطنبولية وكنافة ع الفحم في نابلس! نكهة الجمر مع مطة الجبنة والقشطة البلدية بتفرق كثير عن أفران الغاز.',
    isApproved: true,
    isDemo: true,
    createdAt: '2026-10-25T19:30:00Z'
  },
  {
    id: 'rev-2',
    customerName: 'ميساء عودة',
    rating: 5,
    comment: 'الإسطنبولية المحيرة خرافية، مقرمشة ومش مشبعة قطر كثير، متوازنة جدًا. بنصح الكل يجربها في رافدية.',
    isApproved: true,
    isDemo: true,
    createdAt: '2026-10-27T18:15:00Z'
  },
  {
    id: 'rev-3',
    customerName: 'طارق الدبيك',
    rating: 5,
    comment: 'استلام سريع من المحل والشباب محترمين جداً وخدومين. الكنافة وصلت سخنة وبتشهي مع الفستق الحلبي.',
    isApproved: true,
    isDemo: true,
    createdAt: '2026-10-28T21:00:00Z'
  }
,
  {
    id: 'rev-4', customerName: 'سارة الخطيب', rating: 5,
    comment: 'الكنافة وصلت سخنة ومقرمشة، والجبنة طعمها طيب كثير. أكيد رح أكرر التجربة.',
    isApproved: true, isDemo: true, createdAt: '2026-10-29T19:20:00Z'
  },
  {
    id: 'rev-5', customerName: 'ليث حمدان', rating: 4,
    comment: 'خدمة سريعة وطعم زاكي، الحجم مناسب والسعر معقول. بنصح فيها.',
    isApproved: true, isDemo: true, createdAt: '2026-10-30T20:10:00Z'
  },
  {
    id: 'rev-6', customerName: 'نور ياسين', rating: 5,
    comment: 'إسطنبولية الفستق طيبة ومقرمشة، والتقديم كان مرتب. تجربة حلوة.',
    isApproved: true, isDemo: true, createdAt: '2026-10-31T18:45:00Z'
  },
  {
    id: 'rev-7', customerName: 'محمد شرف', rating: 5,
    comment: 'أحلى شي إنها بتنخبز على الفحم قدامك، بتوصل طازجة وطعمها مميز.',
    isApproved: true, isDemo: true, createdAt: '2026-11-01T21:05:00Z'
  },
  {
    id: 'rev-8', customerName: 'ريم عودة', rating: 4,
    comment: 'الكنافة طيبة والقطر موزون، والموظفين تعاملهم لطيف. زيارة موفقة.',
    isApproved: true, isDemo: true, createdAt: '2026-11-02T19:35:00Z'
  },
  {
    id: 'rev-9', customerName: 'يزن المصري', rating: 5,
    comment: 'طلبنا أكثر من صنف وكلهم زاكيين، خصوصاً الكنافة النابلسية على الفحم.',
    isApproved: true, isDemo: true, createdAt: '2026-11-03T20:25:00Z'
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
        const parsed = JSON.parse(raw);
        // Ensure legacy products are sanitized and replaced with ONLY official products
        if (parsed && Array.isArray(parsed.products)) {
          parsed.products = INITIAL_PRODUCTS;
          this.saveData(parsed);
          return parsed;
        }
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
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    if (this.data.products.length !== initialLen) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  public getOrders(): Order[] {
    return this.data.orders;
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id);
  }

  public addOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'> & { id?: string; orderNumber?: string; createdAt?: string }): Order {
    const nextNum = 8000 + this.data.orders.length + 1;
    const newOrder: Order = {
      ...orderData,
      id: orderData.id || `ord-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      orderNumber: orderData.orderNumber || `KM-${nextNum}`,
      status: orderData.status || 'new',
      createdAt: orderData.createdAt || new Date().toISOString()
    };
    this.data.orders.unshift(newOrder);
    this.saveData(this.data);
    return newOrder;
  }

  public createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'> & { id?: string; orderNumber?: string; createdAt?: string }): Order {
    return this.addOrder(orderData);
  }

  public insertOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'> & { id?: string; orderNumber?: string; createdAt?: string }): Order {
    return this.addOrder(orderData);
  }

  public saveOrder(order: Order | any): Order {
    if (!order.id || !order.orderNumber) {
      return this.addOrder(order);
    }
    const idx = this.data.orders.findIndex(o => o.id === order.id);
    if (idx >= 0) {
      this.data.orders[idx] = order;
    } else {
      this.data.orders.unshift(order);
    }
    this.saveData(this.data);
    return order;
  }

  public updateOrderStatus(id: string, status: Order['status']): Order | undefined {
    const order = this.getOrderById(id);
    if (order) {
      order.status = status;
      this.saveData(this.data);
      return order;
    }
    return undefined;
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
    const initialLen = this.data.offers.length;
    this.data.offers = this.data.offers.filter(o => o.id !== id);
    if (this.data.offers.length !== initialLen) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  public getReviews(approvedOnly = false): Review[] {
    if (approvedOnly) {
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
      isApproved: false,
      createdAt: new Date().toISOString()
    };
    this.data.reviews.unshift(newReview);
    this.saveData(this.data);
    return newReview;
  }

  public updateReviewStatus(id: string, isApproved: boolean): Review | undefined {
    const review = this.data.reviews.find(r => r.id === id);
    if (review) {
      review.isApproved = isApproved;
      this.saveData(this.data);
      return review;
    }
    return undefined;
  }

  public clearDemoReviews(): void {
    this.data.reviews = this.data.reviews.filter(r => !r.isDemo);
    this.saveData(this.data);
  }

  public saveReview(review: Review): Review {
    const idx = this.data.reviews.findIndex(r => r.id === review.id);
    if (idx >= 0) {
      this.data.reviews[idx] = review;
    } else {
      this.data.reviews.unshift(review);
    }
    this.saveData(this.data);
    return review;
  }

  public deleteReview(id: string): boolean {
    const initialLen = this.data.reviews.length;
    this.data.reviews = this.data.reviews.filter(r => r.id !== id);
    if (this.data.reviews.length !== initialLen) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  public getDeliveryInterests(): DeliveryInterest[] {
    return this.data.deliveryInterests;
  }

  public addDeliveryInterest(area: string, customerPhone: string, notes: string): DeliveryInterest {
    const record: DeliveryInterest = {
      id: `del-${Date.now()}`,
      area,
      customerPhone,
      notes,
      createdAt: new Date().toISOString()
    };
    this.data.deliveryInterests.unshift(record);
    this.saveData(this.data);
    return record;
  }

  public saveDeliveryInterest(interest: DeliveryInterest): DeliveryInterest {
    this.data.deliveryInterests.unshift(interest);
    this.saveData(this.data);
    return interest;
  }

  public getSettings(): StoreSettings {
    return this.data.settings;
  }

  public updateSettings(settings: Partial<StoreSettings>): StoreSettings {
    this.data.settings = { ...this.data.settings, ...settings };
    this.saveData(this.data);
    return this.data.settings;
  }

  public saveSettings(settings: StoreSettings): StoreSettings {
    this.data.settings = settings;
    this.saveData(this.data);
    return settings;
  }

  public getAnalytics(filter: { range?: string; from?: string; to?: string }): any {
    return this.getDashboardStats(filter);
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

  public getDashboardStats(filter: { range?: string; from?: string; to?: string }): any {
    const now = new Date();
    let startDate = new Date();

    if (filter.from && filter.to) {
      startDate = new Date(filter.from);
    } else if (filter.range === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (filter.range === '30d') {
      startDate.setDate(now.getDate() - 30);
    } else {
      startDate.setDate(now.getDate() - 7);
    }

    const filteredOrders = this.data.orders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= startDate && d <= now;
    });

    const totalSales = filteredOrders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

    const productStats: Record<string, { quantity: number; revenue: number }> = {};
    const customerOrderCounts: Record<string, number> = {};

    filteredOrders.forEach(o => {
      customerOrderCounts[o.customerPhone] = (customerOrderCounts[o.customerPhone] || 0) + 1;
      if (o.status !== 'cancelled') {
        o.items.forEach(item => {
          if (!productStats[item.name]) {
            productStats[item.name] = { quantity: 0, revenue: 0 };
          }
          productStats[item.name].quantity += item.quantity;
          productStats[item.name].revenue += item.price * item.quantity;
        });
      }
    });

    const repeatCustomers = Object.values(customerOrderCounts).filter(c => c > 1).length;

    const sortedProducts = Object.entries(productStats).map(([name, stats]) => ({
      name,
      ...stats
    })).sort((a, b) => b.revenue - a.revenue);

    const topProducts = sortedProducts.slice(0, 5);
    const leastProducts = [...sortedProducts].reverse().slice(0, 5);

    const hourlyDistribution: Record<number, number> = {};
    for (let h = 0; h < 24; h++) hourlyDistribution[h] = 0;
    filteredOrders.forEach(o => {
      const h = new Date(o.createdAt).getHours();
      hourlyDistribution[h] = (hourlyDistribution[h] || 0) + 1;
    });

    const sourceBreakdown: Record<string, number> = {
      website: 0,
      instagram: 0,
      facebook: 0,
      whatsapp: 0
    };
    filteredOrders.forEach(o => {
      sourceBreakdown[o.source] = (sourceBreakdown[o.source] || 0) + 1;
    });

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
      topProducts,
      leastProducts,
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

// Explicit named exports for order operations
export const addOrder = (orderData: any) => db.addOrder(orderData);
export const createOrder = (orderData: any) => db.addOrder(orderData);
export const insertOrder = (orderData: any) => db.addOrder(orderData);
export const saveOrder = (order: Order) => db.saveOrder(order);
export const getOrders = () => db.getOrders();
export const getOrderById = (id: string) => db.getOrderById(id);
export const updateOrderStatus = (id: string, status: Order['status']) => db.updateOrderStatus(id, status);
