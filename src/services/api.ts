import {
  Product,
  Order,
  Offer,
  Review,
  DeliveryInterest,
  StoreSettings,
  DashboardStats,
  UserSession,
  PublicAiContextResponse,
} from '../types';

export const api = {
  // Products
  async getProducts(category?: string): Promise<Product[]> {
    const url = category && category !== 'all' ? `/api/products?category=${category}` : '/api/products';
    const res = await fetch(url);
    const data = await res.json();
    return data.products || [];
  },

  async createProduct(product: Partial<Product>): Promise<Product> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.product;
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.product;
  },

  async deleteProduct(id: string): Promise<boolean> {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    const data = await res.json();
    return data.success;
  },

  // Orders
  async getOrders(status?: string, search?: string): Promise<Order[]> {
    let url = '/api/orders?';
    if (status && status !== 'all') url += `status=${status}&`;
    if (search) url += `search=${encodeURIComponent(search)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.orders || [];
  },

  async getOrder(id: string): Promise<Order | null> {
    const res = await fetch(`/api/orders/${id}`);
    const data = await res.json();
    return data.order || null;
  },

  async createOrder(order: any): Promise<Order> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'فشل إنشاء الطلب');
    return data.order;
  },

  async addOrder(order: any): Promise<Order> {
    return this.createOrder(order);
  },

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.order;
  },

  // Offers
  async getOffers(): Promise<Offer[]> {
    const res = await fetch('/api/offers');
    const data = await res.json();
    return data.offers || [];
  },

  async createOffer(offer: Partial<Offer>): Promise<Offer> {
    const res = await fetch('/api/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(offer),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.offer;
  },

  async updateOffer(id: string, offer: Partial<Offer>): Promise<Offer> {
    const res = await fetch(`/api/offers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(offer),
    });
    const data = await res.json();
    return data.offer;
  },

  async deleteOffer(id: string): Promise<boolean> {
    const res = await fetch(`/api/offers/${id}`, { method: 'DELETE' });
    const data = await res.json();
    return data.success;
  },

  // Reviews
  async getReviews(all = false): Promise<Review[]> {
    const res = await fetch(`/api/reviews${all ? '?all=true' : ''}`);
    const data = await res.json();
    return data.reviews || [];
  },

  async submitReview(review: { customerName: string; rating: number; comment: string }): Promise<string> {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.message;
  },

  async updateReviewStatus(id: string, isApproved: boolean): Promise<Review> {
    const res = await fetch(`/api/reviews/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isApproved }),
    });
    const data = await res.json();
    return data.review;
  },

  async deleteReview(id: string): Promise<boolean> {
    const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
    const data = await res.json();
    return data.success;
  },

  async clearDemoReviews(): Promise<boolean> {
    const res = await fetch('/api/reviews/clear-demo', { method: 'POST' });
    const data = await res.json();
    return data.success;
  },

  // Delivery Interest
  async getDeliveryInterests(): Promise<DeliveryInterest[]> {
    const res = await fetch('/api/delivery-interest');
    const data = await res.json();
    return data.interests || [];
  },

  async submitDeliveryInterest(data: { area: string; customerPhone?: string; notes?: string }): Promise<string> {
    const res = await fetch('/api/delivery-interest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.message;
  },

  // Store Settings
  async getSettings(): Promise<StoreSettings> {
    const res = await fetch('/api/settings');
    const data = await res.json();
    return data.settings;
  },

  async updateSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    const data = await res.json();
    return data.settings;
  },

  // Dashboard & AI
  async getDashboardStats(range = '7d', from?: string, to?: string): Promise<DashboardStats> {
    let url = `/api/dashboard/stats?range=${range}`;
    if (from && to) url += `&from=${from}&to=${to}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.stats;
  },

  async askAi(question: string, range = '7d', from?: string, to?: string): Promise<{ answer: string; metricsUsed?: any }> {
    const res = await fetch('/api/ai/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, range, from, to }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data;
  },

  async generateAiReport(range = '7d', from?: string, to?: string): Promise<{ report: string; metrics: any }> {
    const res = await fetch('/api/ai/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ range, from, to }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data;
  },

  async resetSampleData(): Promise<void> {
    await fetch('/api/seed/reset', { method: 'POST' });
  },

  // AI Public Context
  async getPublicAiContext(): Promise<PublicAiContextResponse> {
    const res = await fetch('/api/v1/ai/public-context');
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch AI public context');
    return data;
  },

  // n8n Customer AI Agent
  async askKourAiAgent(userMessage: string): Promise<string> {
    try {
      // استخدم رابط Production الخاص بـ n8n
      const response = await fetch('http://localhost:5678/webhook/7bacd75e-d944-48f6-a66b-baaaacd82f31', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('فشل الاتصال بمساعد كنافة على الفحم');
      }

      const data = await response.json();

      // نرجع نص الرد الناتج من الـ AI Agent
      return data.reply || data.output || 'أهلاً بك! لم أستطع فهم الطلب بالكامل، هل يمكنك إعادة التوضيح؟';
    } catch (error) {
      console.error('AI Agent Error:', error);
      return 'عذراً، حدث خطأ في الاتصال بالمساعد الذكي حالياً.';
    }
  },

  // Auth
  async login(credentials: { username: string; password: string }): Promise<UserSession> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'فشل تسجيل الدخول');
    return { ...data.user, token: data.token };
  }
};
