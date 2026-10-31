export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  dineInPrice?: number;
  takeawayPrice?: number;
  isDefault?: boolean;
}

export interface Review {
  id: string;
  productId?: string;
  customerName?: string;
  userName?: string;
  rating: number; // 1 to 5
  comment: string;
  isApproved?: boolean;
  isDemo?: boolean;
  createdAt: string;
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
  createdAt?: string;
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
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

export interface DashboardStats {
  period: {
    from: string;
    to: string;
    range: string;
  };
  summary: {
    totalSales: number;
    totalOrders: number;
    avgOrderValue: number;
    repeatCustomers: number;
    totalCustomers: number;
  };
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  leastProducts: Array<{ name: string; quantity: number; revenue: number }>;
  hourlyDistribution: Record<number, number>;
  sourceBreakdown: Record<string, number>;
  deliveryDemand: {
    totalVotes: number;
    byArea: Record<string, number>;
  };
}

export interface UserSession {
  username: string;
  role: 'owner' | 'staff';
  name: string;
  token: string;
}
