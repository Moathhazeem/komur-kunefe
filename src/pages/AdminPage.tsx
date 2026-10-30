import React, { useState, useEffect } from 'react';
import {
  Shield, ShoppingBag, Utensils, Sparkles, MessageSquare, Bike,
  BarChart3, Bot, Settings, LogOut, CheckCircle, Clock, AlertTriangle,
  Plus, Edit2, Trash2, Printer, Search, RefreshCw, Eye, EyeOff, Send,
  FileText, Download, Check, X, Tag, DollarSign, TrendingUp, Users, Flame
} from 'lucide-react';
import { Product, Order, Offer, Review, DeliveryInterest, StoreSettings, DashboardStats, UserSession } from '../types';
import { api } from '../services/api';
import { ReceiptPrintModal } from '../components/ReceiptPrintModal';

interface AdminPageProps {
  settings: StoreSettings | null;
  onRefreshGlobalSettings: () => void;
  onNavigateHome: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  settings,
  onRefreshGlobalSettings,
  onNavigateHome,
}) => {
  // Auth state
  const [session, setSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('komur_admin_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [usernameInput, setUsernameInput] = useState('admin');
  const [passwordInput, setPasswordInput] = useState('komur2025');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'offers' | 'reviews' | 'delivery' | 'analytics' | 'ai' | 'settings'>('orders');

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);
  const [soundAlertEnabled, setSoundAlertEnabled] = useState(true);

  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Offers State
  const [offers, setOffers] = useState<Offer[]>([]);
  const [editingOffer, setEditingOffer] = useState<Partial<Offer> | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);

  // Delivery Interests State
  const [deliveryInterests, setDeliveryInterests] = useState<DeliveryInterest[]>([]);

  // Analytics & Dashboard State
  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d' | 'custom'>('7d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  // AI Agent State
  const [aiChatMessages, setAiChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'مرحباً بك! أنا "مساعد كُومُر الذكي". أحلل بيانات مبيعات وسلوك زبائن المحل في رافدية بدقة. اسألني عن أكثر الأصناف مبيعاً، المنتجات الراكدة، أوقات الذروة، أو اطلب تقرير عمل شامل!'
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<StoreSettings | null>(settings);

  // Initial load when logged in
  useEffect(() => {
    if (session) {
      loadAllAdminData();
      const interval = setInterval(() => {
        // Silent background refresh for orders
        loadOrders();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [session, activeTab, dateRange]);

  useEffect(() => {
    if (settings) {
      setSettingsForm(settings);
    }
  }, [settings]);

  const loadAllAdminData = async () => {
    await Promise.all([
      loadOrders(),
      loadProducts(),
      loadOffers(),
      loadReviews(),
      loadDelivery(),
      loadStats(),
    ]);
  };

  const loadOrders = async () => {
    try {
      const data = await api.getOrders(orderFilter, orderSearch);
      setOrders(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadOffers = async () => {
    try {
      const data = await api.getOffers();
      setOffers(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadReviews = async () => {
    try {
      const data = await api.getReviews(true); // all reviews including unapproved
      setReviews(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadDelivery = async () => {
    try {
      const data = await api.getDeliveryInterests();
      setDeliveryInterests(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadStats = async () => {
    try {
      const data = await api.getDashboardStats(dateRange, customFrom, customTo);
      setDashboardStats(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Auth handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const sess = await api.login({ username: usernameInput, password: passwordInput });
      setSession(sess);
      localStorage.setItem('komur_admin_session', JSON.stringify(sess));
    } catch (err: any) {
      setLoginError(err.message || 'بيانات الدخول غير صحيحة');
    }
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('komur_admin_session');
  };

  // Order status update
  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      loadOrders();
    } catch (e: any) {
      alert(e.message || 'فشل تحديث حالة الطلب');
    }
  };

  // Product save
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || editingProduct?.basePrice === undefined) return;

    try {
      if (editingProduct.id) {
        await api.updateProduct(editingProduct.id, editingProduct);
      } else {
        await api.createProduct(editingProduct);
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      loadProducts();
    } catch (e: any) {
      alert(e.message || 'فشل حفظ الصنف');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الصنف من المنيو؟')) return;
    try {
      await api.deleteProduct(id);
      loadProducts();
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Reviews moderation
  const handleToggleReviewStatus = async (id: string, isApproved: boolean) => {
    try {
      await api.updateReviewStatus(id, isApproved);
      loadReviews();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('حذف هذا التقييم نهائياً؟')) return;
    try {
      await api.deleteReview(id);
      loadReviews();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleClearDemoReviews = async () => {
    if (!confirm('سيتم حذف جميع التقييمات التجريبية الخاصة بالمعاينة، والإبقاء فقط على تقييمات الزبائن الحقيقيين. هل توافق؟')) return;
    try {
      await api.clearDemoReviews();
      loadReviews();
      alert('تم حذف التقييمات التجريبية بنجاح!');
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Offer save
  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffer?.title) return;
    try {
      if (editingOffer.id) {
        await api.updateOffer(editingOffer.id, editingOffer);
      } else {
        await api.createOffer(editingOffer);
      }
      setIsOfferModalOpen(false);
      setEditingOffer(null);
      loadOffers();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (!confirm('حذف هذا العرض؟')) return;
    try {
      await api.deleteOffer(id);
      loadOffers();
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Store settings save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;
    try {
      await api.updateSettings(settingsForm);
      onRefreshGlobalSettings();
      alert('تم حفظ إعدادات المحل بنجاح!');
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Reset demo store data
  const handleResetSampleData = async () => {
    if (!confirm('هل تريد إعادة تعيين بيانات المتجر والمبيعات الافتراضية؟')) return;
    try {
      await api.resetSampleData();
      await loadAllAdminData();
      alert('تمت استعادة البيانات الافتراضية بنجاح!');
    } catch (e: any) {
      alert(e.message);
    }
  };

  // AI Agent Ask
  const handleAskAi = async (questionText?: string) => {
    const q = questionText || aiInput;
    if (!q.trim() || isAiLoading) return;

    setAiChatMessages((prev) => [...prev, { role: 'user', text: q }]);
    setAiInput('');
    setIsAiLoading(true);

    try {
      const res = await api.askAi(q, dateRange, customFrom, customTo);
      setAiChatMessages((prev) => [...prev, { role: 'assistant', text: res.answer }]);
    } catch (err: any) {
      setAiChatMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'حدث خطأ أثناء التواصل مع نموذج الذكاء الاصطناعي. يرجى المحاولة لاحقاً.' },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Generate Executive Strategic Report
  const handleGenerateReport = async () => {
    setIsAiLoading(true);
    try {
      const res = await api.generateAiReport(dateRange, customFrom, customTo);
      setGeneratedReport(res.report);
    } catch (e: any) {
      alert(e.message || 'فشل توليد التقرير');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Login view if unauthenticated
  if (!session) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-right animate-fadeIn">
        <div className="bg-white border-2 border-orange-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white mx-auto shadow-md">
              <Shield className="w-9 h-9" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 font-heading">
              لوحة تحكم كُومُر كُونافيه
            </h1>
            <p className="text-xs text-slate-500">
              دخول صاحب المحل وطاقم العمل في رافدية
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                اسم المستخدم
              </label>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                كلمة المرور
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none transition-all"
              />
            </div>

            {/* Quick credentials hint for evaluation */}
            <div className="bg-orange-50/70 p-3 rounded-xl border border-orange-200 text-[11px] text-slate-600 space-y-1">
              <p className="font-bold text-slate-800">بيانات الدخول المبدئية للفرع:</p>
              <p>• المالك: <span className="text-orange-600 font-mono font-bold">admin</span> / كلمة المرور: <span className="text-orange-600 font-mono font-bold">komur2025</span></p>
              <p>• موظف الكاونتر: <span className="text-slate-700 font-mono">staff</span> / كلمة المرور: <span className="text-slate-700 font-mono">staff123</span></p>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-md transition-all"
            >
              تسجيل الدخول للوحة التحكم
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={onNavigateHome}
              className="text-xs text-slate-500 hover:text-orange-600"
            >
              ← العودة لواجهة الزبائن الرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 text-right space-y-8">
      
      {/* Admin Top Header Bar */}
      <div className="bg-white border border-orange-100 rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-black shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                لوحة تحكم Kömür Künefe
              </h1>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-300 px-2 py-0.5 rounded-md font-bold">
                متصل مباشر
              </span>
            </div>
            <p className="text-xs text-slate-500">
              مرحباً {session.name} ({session.role === 'owner' ? 'صلاحيات المالك الكاملة' : 'طاقم العمل'}) | فرع رافدية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => loadAllAdminData()}
            className="p-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="تحديث البيانات"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">تحديث</span>
          </button>

          <button
            onClick={onNavigateHome}
            className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-colors"
          >
            الموقع كزبون
          </button>

          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold flex items-center gap-1 transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Admin Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-orange-100">
        {[
          { id: 'orders', label: 'الطلبات الحية', icon: ShoppingBag, badge: orders.filter((o) => o.status === 'new').length },
          { id: 'products', label: 'المنيو والأسعار', icon: Utensils },
          { id: 'offers', label: 'العروض الموسمية', icon: Sparkles },
          { id: 'reviews', label: 'آراء الزبائن', icon: MessageSquare, badge: reviews.filter((r) => !r.isApproved).length },
          { id: 'delivery', label: 'اهتمام التوصيل', icon: Bike, badge: deliveryInterests.length },
          { id: 'analytics', label: 'الداشبورد الذكي', icon: BarChart3 },
          { id: 'ai', label: 'مساعد كُومُر AI', icon: Bot },
          { id: 'settings', label: 'إعدادات المحل', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
                active
                  ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-orange-200 hover:text-orange-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="bg-white text-orange-600 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Controls bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#140F0D] p-4 rounded-2xl border border-[#271E18]">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'new', label: 'جديد' },
                { id: 'preparing', label: 'قيد التحضير' },
                { id: 'ready', label: 'جاهز للاستلام' },
                { id: 'completed', label: 'تم التسليم' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setOrderFilter(st.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    orderFilter === st.id
                      ? 'bg-[#FF7A1A] text-black'
                      : 'bg-[#1F1713] text-[#9E9385] hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#7A7165] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="بحث برقم الطلب، الاسم، أو الهاتف..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full bg-[#0D0A08] border border-[#2B201A] focus:border-[#FF7A1A] rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-[#6B6156] focus:outline-none"
              />
            </div>
          </div>

          {/* Orders Table */}
          {orders.length === 0 ? (
            <div className="bg-[#140F0D] border border-[#271E18] rounded-3xl p-12 text-center text-[#8C8074]">
              لا توجد طلبات تطابق هذا الفلتر حالياً.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className={`bg-[#140F0D] border rounded-2xl p-4 sm:p-5 transition-all shadow-md ${
                    order.status === 'new'
                      ? 'border-[#FF7A1A] ring-1 ring-[#FF7A1A]/30'
                      : 'border-[#261D17]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#221813] pb-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-black text-[#FFE17D] font-heading font-mono">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs text-[#9E9385]">
                        {new Date(order.createdAt).toLocaleDateString('ar-EG')} - {new Date(order.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[11px] bg-[#1F1612] text-[#A89E92] px-2 py-0.5 rounded border border-[#33251D]">
                        المصدر: {order.source || 'الموقع'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#8C8074]">حالة الطلب:</span>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                        className={`text-xs font-black px-3 py-1.5 rounded-xl border focus:outline-none ${
                          order.status === 'new'
                            ? 'bg-[#2B170E] text-[#FF9E3B] border-[#FF7A1A]'
                            : order.status === 'preparing'
                            ? 'bg-amber-950/70 text-amber-300 border-amber-600'
                            : order.status === 'ready'
                            ? 'bg-blue-950/70 text-blue-300 border-blue-600'
                            : order.status === 'completed'
                            ? 'bg-green-950/70 text-green-300 border-green-600'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        <option value="new">جديد (بانتظار التحضير)</option>
                        <option value="preparing">قيد التحضير (ع الفحم)</option>
                        <option value="ready">جاهز للاستلام بالمحل</option>
                        <option value="completed">تم التسليم بنجاح</option>
                        <option value="cancelled">ملغي</option>
                      </select>

                      <button
                        onClick={() => setSelectedOrderForPrint(order)}
                        className="p-1.5 rounded-lg bg-[#201712] hover:bg-[#2F2119] text-[#FF9E3B] border border-[#3B291E]"
                        title="طباعة الفاتورة"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-[#7D7266] block">بيانات الزبون:</span>
                      <span className="font-bold text-white text-sm block">{order.customerName}</span>
                      <a href={`tel:${order.customerPhone}`} className="text-[#FF9E3B] hover:underline dir-ltr inline-block">
                        {order.customerPhone}
                      </a>
                    </div>

                    <div>
                      <span className="text-[#7D7266] block">موعد وطريقة الاستلام:</span>
                      <span className="font-bold text-[#FFE17D] block">{order.pickupTime}</span>
                      <span className="text-[#A89E92] block">
                        {order.paymentMethod === 'mock_online' ? 'دفع إلكتروني (تم الدفع)' : 'دفع عند الاستلام كاش/بطاقة'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#7D7266] block">الأصناف المطلوبة:</span>
                      <div className="space-y-0.5 pt-0.5">
                        {order.items.map((it, i) => (
                          <div key={i} className="text-white">
                            • {it.name} ({it.variantName}) × <strong>{it.quantity}</strong> = {it.price * it.quantity} ₪
                          </div>
                        ))}
                      </div>
                      <div className="pt-1 font-bold text-sm text-[#FFC83D]">
                        المجموع: {order.total} شيكل
                      </div>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="mt-2 pt-2 border-t border-[#1C140F] text-xs text-[#A89E92]">
                      <span className="font-bold text-[#FF9E3B]">ملاحظة الزبون: </span>
                      <span>{order.notes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: PRODUCTS & PRICING MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white font-heading">
                إدارة الأصناف والأسعار (شيكل ₪)
              </h2>
              <p className="text-xs text-[#9E9385]">
                الأسعار الأولية معلمة كـ "سعر مبدئي - يحتاج مراجعة". يمكنك تعديل أي سعر وتحديث الأحجام بضغطة زر.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingProduct({
                  name: '',
                  category: 'charcoal',
                  description: '',
                  basePrice: 25,
                  isInitialPrice: false,
                  image: '',
                  isAvailable: true,
                  variants: [{ id: `v-${Date.now()}`, name: 'حجم واحد', price: 25, isDefault: true }],
                });
                setIsProductModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#FF7A1A] text-black font-bold text-xs flex items-center gap-1.5 shadow-md ember-glow"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة صنف جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-[#140F0D] border border-[#271E18] rounded-2xl p-4 flex flex-col justify-between space-y-4 shadow-lg relative"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-white text-base font-heading">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setIsProductModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-[#201712] hover:bg-[#33241B] text-[#FF9E3B]"
                        title="تعديل"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1.5 rounded-lg bg-[#241512] hover:bg-[#381B16] text-red-400"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#A89E92] line-clamp-2 mb-3">
                    {product.description}
                  </p>

                  {/* Status badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    {product.isInitialPrice ? (
                      <span className="bg-yellow-950/70 text-yellow-300 border border-yellow-800/40 text-[10px] px-2 py-0.5 rounded font-bold">
                        سعر مبدئي - يحتاج مراجعة
                      </span>
                    ) : (
                      <span className="bg-green-950/70 text-green-300 border border-green-800/40 text-[10px] px-2 py-0.5 rounded">
                        سعر معتمد
                      </span>
                    )}
                    {!product.isAvailable && (
                      <span className="bg-red-950/70 text-red-300 border border-red-800/40 text-[10px] px-2 py-0.5 rounded">
                        غير متوفر مؤقتاً
                      </span>
                    )}
                  </div>

                  {/* Variants list */}
                  <div className="space-y-1 bg-[#0D0A08] p-2.5 rounded-xl border border-[#211812] text-xs">
                    <span className="text-[#7D7266] block font-bold text-[10px]">الأحجام والأسعار:</span>
                    {product.variants.map((v) => (
                      <div key={v.id} className="flex justify-between text-[#C7BDB1]">
                        <span>{v.name}</span>
                        <span className="font-bold text-[#FFC83D]">{v.price} ₪</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#221813] flex items-center justify-between text-xs">
                  <span className="text-[#8C8074]">التصنيف: {product.category}</span>
                  <button
                    onClick={async () => {
                      await api.updateProduct(product.id, { isAvailable: !product.isAvailable });
                      loadProducts();
                    }}
                    className={`text-[11px] font-bold px-2 py-1 rounded-lg ${
                      product.isAvailable
                        ? 'bg-[#18231C] text-[#4ADE80] hover:bg-[#203026]'
                        : 'bg-[#291714] text-[#F87171] hover:bg-[#381F1A]'
                    }`}
                  >
                    {product.isAvailable ? 'معروض للبيع' : 'مخفي من المنيو'}
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 3: SEASONAL OFFERS */}
      {activeTab === 'offers' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white font-heading">
                إدارة العروض والمناسبات (العيد ورمضان)
              </h2>
              <p className="text-xs text-[#9E9385]">
                أنشئ عروضاً خاصة مع تحديد نسبة الخصم والمدة وتظهر مباشرة في واجهة الزبائن.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingOffer({
                  title: '',
                  description: '',
                  discountPercent: 15,
                  badge: 'عرض رمضان والعيد',
                  startDate: new Date().toISOString().split('T')[0],
                  endDate: '',
                  isActive: true,
                  includedProductNames: ['كنافة نابلسية خشنة ع الفحم'],
                });
                setIsOfferModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#FF7A1A] text-black font-bold text-xs flex items-center gap-1.5 shadow-md ember-glow"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء عرض جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="bg-[#140F0D] border border-[#271E18] rounded-2xl p-5 space-y-4 shadow-lg relative flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-[#FF7A1A] text-black text-xs font-black px-2.5 py-0.5 rounded-full">
                      {offer.badge}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingOffer(offer);
                          setIsOfferModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-[#201712] hover:bg-[#33241B] text-[#FF9E3B]"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteOffer(offer.id)}
                        className="p-1.5 rounded-lg bg-[#241512] hover:bg-[#381B16] text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white font-heading">
                    {offer.title}
                  </h3>
                  <p className="text-xs text-[#A89E92] leading-relaxed">
                    {offer.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#221813] flex items-center justify-between text-xs">
                  <span className="text-[#FFC83D] font-bold font-heading text-sm">
                    خصم {offer.discountPercent}%
                  </span>
                  <button
                    onClick={async () => {
                      await api.updateOffer(offer.id, { isActive: !offer.isActive });
                      loadOffers();
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      offer.isActive
                        ? 'bg-[#18231C] text-[#4ADE80]'
                        : 'bg-[#291714] text-[#F87171]'
                    }`}
                  >
                    {offer.isActive ? 'نشط ويظهر بالموقع' : 'معطل ومخفي'}
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 4: REVIEWS MODERATION */}
      {activeTab === 'reviews' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white font-heading">
                إدارة ومراجعة آراء الزبائن
              </h2>
              <p className="text-xs text-[#9E9385]">
                الموافقة على آراء الزبائن الحقيقية قبل نشرها علناً لمنع التقييمات المزيفة.
              </p>
            </div>

            <button
              onClick={handleClearDemoReviews}
              className="px-4 py-2 rounded-xl bg-[#291512] hover:bg-[#3D1A15] text-[#F87171] border border-[#52221B] text-xs font-bold transition-colors self-start sm:self-auto"
            >
              حذف التقييمات التجريبية (إبقاء الحقيقي فقط)
            </button>
          </div>

          <div className="space-y-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-[#140F0D] border border-[#271E18] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{rev.customerName}</span>
                    <span className="text-xs text-[#FFC83D]">★ {rev.rating}/5</span>
                    {rev.isDemo && (
                      <span className="text-[10px] bg-yellow-950/70 text-yellow-400 border border-yellow-800/40 px-1.5 py-0.5 rounded">
                        تجريبي
                      </span>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded ${
                      rev.isApproved ? 'bg-green-950/70 text-green-300' : 'bg-amber-950/70 text-amber-300'
                    }`}>
                      {rev.isApproved ? 'معتمد ومنشور' : 'بانتظار الموافقة'}
                    </span>
                  </div>
                  <p className="text-xs text-[#C7BDB1] leading-relaxed">
                    "{rev.comment}"
                  </p>
                  <span className="text-[10px] text-[#7A7165] block">
                    {new Date(rev.createdAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleReviewStatus(rev.id, !rev.isApproved)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      rev.isApproved
                        ? 'bg-[#291B13] text-[#FF9E3B] border border-[#FF7A1A]/40'
                        : 'bg-[#18231C] text-[#4ADE80] border border-[#22C55E]/40'
                    }`}
                  >
                    {rev.isApproved ? 'إخفاء عن الزوار' : 'موافقة ونشر بالموقع'}
                  </button>
                  <button
                    onClick={() => handleDeleteReview(rev.id)}
                    className="p-1.5 rounded-xl bg-[#241512] text-red-400 hover:bg-[#381B16]"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 5: DELIVERY INTEREST ANALYTICS */}
      {activeTab === 'delivery' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="bg-[#140F0D] border border-[#271E18] rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#261A13] border border-[#FF7A1A]/40 text-[#FF9E3B] flex items-center justify-center font-bold">
                <Bike className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-heading">
                  قياس رغبة الزبائن في خدمة التوصيل (نابلس)
                </h2>
                <p className="text-xs text-[#9E9385]">
                  إجمالي الزبائن الذين سجلوا رغبتهم بتوصيل الكنافة: <strong>{deliveryInterests.length} زبون</strong>
                </p>
              </div>
            </div>

            <div className="divide-y divide-[#211812] pt-2">
              {deliveryInterests.map((item) => (
                <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-bold text-white text-sm block">منطقة: {item.area}</span>
                    {item.notes && <span className="text-[#A89E92] block">ملاحظة: {item.notes}</span>}
                  </div>
                  <div className="text-left">
                    <span className="text-[#FFC83D] dir-ltr block">{item.customerPhone || 'بدون رقم'}</span>
                    <span className="text-[10px] text-[#7A7165]">
                      {new Date(item.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 6: SMART DASHBOARD (DECISION INTELLIGENCE) */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Time filter */}
          <div className="bg-[#140F0D] border border-[#271E18] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#8C8074]">الفترة الزمنية:</span>
              {(['today', '7d', '30d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    dateRange === r
                      ? 'bg-[#FF7A1A] text-black font-black'
                      : 'bg-[#1F1713] text-[#9E9385] hover:text-white'
                  }`}
                >
                  {r === 'today' ? 'اليوم' : r === '7d' ? 'آخر 7 أيام' : 'آخر 30 يومًا'}
                </button>
              ))}
            </div>

            <button
              onClick={handleResetSampleData}
              className="text-xs text-[#8C8074] hover:text-[#FFE17D] flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>إعادة تعيين البيانات الافتراضية للتحليل</span>
            </button>
          </div>

          {dashboardStats && (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#140F0D] border border-[#271E18] rounded-2xl p-5 space-y-1 shadow-md">
                  <span className="text-xs text-[#8C8074] block">إجمالي المبيعات</span>
                  <div className="text-2xl sm:text-3xl font-black text-[#FFC83D] font-heading">
                    {dashboardStats.summary.totalSales} <span className="text-xs font-bold text-[#8C8074]">₪</span>
                  </div>
                  <span className="text-[11px] text-[#4ADE80] block">شامل جميع الطلبات المؤكدة</span>
                </div>

                <div className="bg-[#140F0D] border border-[#271E18] rounded-2xl p-5 space-y-1 shadow-md">
                  <span className="text-xs text-[#8C8074] block">عدد الطلبات</span>
                  <div className="text-2xl sm:text-3xl font-black text-white font-heading">
                    {dashboardStats.summary.totalOrders}
                  </div>
                  <span className="text-[11px] text-[#A89E92] block">طلبات مستلمة في الفرع</span>
                </div>

                <div className="bg-[#140F0D] border border-[#271E18] rounded-2xl p-5 space-y-1 shadow-md">
                  <span className="text-xs text-[#8C8074] block">متوسط قيمة الطلب</span>
                  <div className="text-2xl sm:text-3xl font-black text-[#FFE17D] font-heading">
                    {dashboardStats.summary.avgOrderValue} <span className="text-xs font-bold text-[#8C8074]">₪</span>
                  </div>
                  <span className="text-[11px] text-[#A89E92] block">متوسط الفاتورة الواحدة</span>
                </div>

                <div className="bg-[#140F0D] border border-[#271E18] rounded-2xl p-5 space-y-1 shadow-md">
                  <span className="text-xs text-[#8C8074] block">الزبائن المتكررون</span>
                  <div className="text-2xl sm:text-3xl font-black text-[#4ADE80] font-heading">
                    {dashboardStats.summary.repeatCustomers}
                  </div>
                  <span className="text-[11px] text-[#A89E92] block">أكثر من طلب واحد</span>
                </div>
              </div>

              {/* Top & Least Selling Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Top Sellers */}
                <div className="bg-[#140F0D] border border-[#271E18] rounded-2xl p-5 space-y-4 shadow-lg">
                  <div className="flex items-center gap-2 text-[#4ADE80] font-heading font-bold text-base">
                    <TrendingUp className="w-5 h-5" />
                    <span>أكثر 5 منتجات مبيعاً في الفترة المحددة</span>
                  </div>
                  <div className="space-y-2.5">
                    {dashboardStats.topProducts.map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#0E0A08] border border-[#221813]">
                        <span className="font-bold text-white">{i + 1}. {p.name}</span>
                        <div className="text-left font-mono">
                          <span className="text-[#FFC83D] font-bold">{p.quantity} قطعة</span>
                          <span className="text-[#7A7165] block">{p.revenue} ₪</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Least Sellers */}
                <div className="bg-[#140F0D] border border-[#271E18] rounded-2xl p-5 space-y-4 shadow-lg">
                  <div className="flex items-center gap-2 text-[#F87171] font-heading font-bold text-base">
                    <Tag className="w-5 h-5" />
                    <span>أقل المنتجات مبيعاً (فرص للتنشيط وعمل عروض)</span>
                  </div>
                  <div className="space-y-2.5">
                    {dashboardStats.leastProducts.map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#0E0A08] border border-[#221813]">
                        <span className="font-bold text-white">{i + 1}. {p.name}</span>
                        <div className="text-left font-mono">
                          <span className="text-red-400 font-bold">{p.quantity} قطعة</span>
                          <span className="text-[#7A7165] block">{p.revenue} ₪</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Hourly Peak & Source Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Hourly Peak */}
                <div className="bg-[#140F0D] border border-[#271E18] rounded-2xl p-5 space-y-4 shadow-lg">
                  <h3 className="font-bold text-white text-sm font-heading">
                    ساعات الذروة (توزيع الطلبات حسب أوقات اليوم)
                  </h3>
                  <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 text-center text-[10px]">
                    {Object.entries(dashboardStats.hourlyDistribution).map(([hour, count]) => (
                      <div key={hour} className="space-y-1">
                        <div
                          className="w-full bg-[#FF7A1A]/30 hover:bg-[#FF7A1A] rounded-md transition-all"
                          style={{ height: `${Math.max(12, Number(count) * 10)}px` }}
                          title={`الساعة ${hour}:00 - عدد الطلبات: ${count}`}
                        />
                        <span className="text-[#73685C] block">{hour}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#A89E92]">
                    * تتركز الذروة في رافدية بين الساعة 6:00 مساءً و 11:00 مساءً. ننصح بتجهيز كميات إضافية من الفحم في هذا التوقيت.
                  </p>
                </div>

                {/* Traffic Source Breakdown */}
                <div className="bg-[#140F0D] border border-[#271E18] rounded-2xl p-5 space-y-4 shadow-lg">
                  <h3 className="font-bold text-white text-sm font-heading">
                    مصادر الطلبات (حملات السوشال ميديا والموقع)
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-[#0E0A08] rounded-xl border border-[#211812] space-y-1">
                      <span className="text-[#E1306C] font-bold">إنستغرام (Instagram)</span>
                      <span className="text-xl font-bold text-white block">{dashboardStats.sourceBreakdown.instagram} طلب</span>
                    </div>
                    <div className="p-3 bg-[#0E0A08] rounded-xl border border-[#211812] space-y-1">
                      <span className="text-[#22C55E] font-bold">واتساب (WhatsApp)</span>
                      <span className="text-xl font-bold text-white block">{dashboardStats.sourceBreakdown.whatsapp} طلب</span>
                    </div>
                    <div className="p-3 bg-[#0E0A08] rounded-xl border border-[#211812] space-y-1">
                      <span className="text-[#1877F2] font-bold">فيسبوك (Facebook)</span>
                      <span className="text-xl font-bold text-white block">{dashboardStats.sourceBreakdown.facebook} طلب</span>
                    </div>
                    <div className="p-3 bg-[#0E0A08] rounded-xl border border-[#211812] space-y-1">
                      <span className="text-[#FFC83D] font-bold">الموقع المباشر</span>
                      <span className="text-xl font-bold text-white block">{dashboardStats.sourceBreakdown.website} طلب</span>
                    </div>
                  </div>
                </div>

              </div>
            </>
          )}

        </div>
      )}

      {/* TAB 7: AI AGENT & STRATEGIC REPORT */}
      {activeTab === 'ai' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="bg-[#140F0D] border border-[#271E18] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#241A14] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF7A1A] to-[#802200] flex items-center justify-center text-black font-black ember-glow">
                  <Bot className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-heading">
                    مساعد كُومُر الذكي (AI Business Agent)
                  </h2>
                  <p className="text-xs text-[#9E9385]">
                    مدعوم بنموذج Gemini 3.8 Flash ويجيب من بيانات المحل الفعلية دون اختلاق أرقام
                  </p>
                </div>
              </div>

              <button
                onClick={handleGenerateReport}
                disabled={isAiLoading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF7A1A] to-[#FF4D00] text-black font-black text-xs shadow-md ember-glow flex items-center gap-2 self-start sm:self-auto hover:scale-105 transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>توليد تقرير أداء استراتيجي كامل</span>
              </button>
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-bold text-[#8C8074]">أسئلة مقترحة:</span>
              {[
                'شو أقل منتج مبيعاً هذا الشهر وشو بتنصحني أعمل؟',
                'مين أكثر منتج مبيعاً في المحل؟',
                'متى ساعات الذروة في رافدية وكيف أستعد لها؟',
                'شو وضع اهتمام الزبائن بالتوصيل وشو المناطق الأكثر طلباً؟',
                'كيف أرفع مبيعات نواشف العيد والمشروبات؟',
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAskAi(chip)}
                  disabled={isAiLoading}
                  className="px-3 py-1.5 rounded-lg bg-[#201712] hover:bg-[#2F2119] text-[#FFE17D] border border-[#3D291E] text-xs transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat Messages Log */}
            <div className="bg-[#0D0A08] border border-[#211812] rounded-2xl p-4 sm:p-6 space-y-4 max-h-[460px] overflow-y-auto">
              {aiChatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-[#261A13] border border-[#FF7A1A]/40 text-[#FF9E3B] flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-[#FF7A1A] text-black font-bold'
                        : 'bg-[#181310] text-[#E0D5C8] border border-[#2D2018] whitespace-pre-line'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex items-center gap-2 text-xs text-[#FFC83D]">
                  <span className="w-3 h-3 border-2 border-[#FFC83D] border-t-transparent rounded-full animate-spin" />
                  <span>المساعد الذكي يحلل بيانات المبيعات الحالية...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="اسأل المساعد الذكي عن أي تحليل تجاري في المحل..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
                disabled={isAiLoading}
                className="flex-1 bg-[#0D0A08] border border-[#291F18] focus:border-[#FF7A1A] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-[#63594F] focus:outline-none"
              />
              <button
                onClick={() => handleAskAi()}
                disabled={isAiLoading || !aiInput.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF7A1A] to-[#FF4D00] text-black font-bold text-xs shadow-md ember-glow hover:scale-105 transition-all disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Render Generated Strategic Report if available */}
          {generatedReport && (
            <div className="bg-[#140F0D] border-2 border-[#FF7A1A]/40 rounded-3xl p-6 sm:p-10 space-y-6 shadow-2xl animate-fadeIn">
              <div className="flex items-center justify-between border-b border-[#241A14] pb-4">
                <div className="flex items-center gap-2 text-[#FFE17D]">
                  <FileText className="w-5 h-5 text-[#FF7A1A]" />
                  <h3 className="text-lg font-bold font-heading">
                    التقرير التنفيذي الاستراتيجي لمحل Kömür Künefe
                  </h3>
                </div>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#201712] hover:bg-[#2E2019] text-[#FFE17D] border border-[#3E291C] text-xs font-bold"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة أو حفظ كـ PDF</span>
                </button>
              </div>

              <div className="bg-[#0D0A08] p-6 rounded-2xl border border-[#241B15] text-[#D1C6BA] text-xs sm:text-sm leading-relaxed whitespace-pre-line font-mono">
                {generatedReport}
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 8: STORE SETTINGS & LOGO */}
      {activeTab === 'settings' && settingsForm && (
        <form onSubmit={handleSaveSettings} className="space-y-6 animate-fadeIn">
          
          <div className="bg-[#140F0D] border border-[#271E18] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <h2 className="text-xl font-bold text-white font-heading border-b border-[#241A14] pb-3">
              إعدادات المحل والهوية (فرع رافدية - نابلس)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#D4C8B8] mb-1">اسم المحل</label>
                <input
                  type="text"
                  value={settingsForm.storeName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                  className="w-full bg-[#0D0A08] border border-[#2B1F17] rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#D4C8B8] mb-1">رابط الشعار (Logo URL)</label>
                <input
                  type="text"
                  placeholder="اترك فارغاً لاستخدام أيقونة الفحم والجمر الافتراضية"
                  value={settingsForm.logoUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
                  className="w-full bg-[#0D0A08] border border-[#2B1F17] rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#D4C8B8] mb-1">رقم الهاتف والاتصال</label>
                <input
                  type="text"
                  value={settingsForm.phone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                  className="w-full bg-[#0D0A08] border border-[#2B1F17] rounded-xl px-3.5 py-2.5 text-white focus:outline-none dir-ltr text-right"
                />
              </div>

              <div>
                <label className="block font-bold text-[#D4C8B8] mb-1">رقم الواتساب (لروابط المحادثة المباشرة)</label>
                <input
                  type="text"
                  value={settingsForm.whatsapp}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                  className="w-full bg-[#0D0A08] border border-[#2B1F17] rounded-xl px-3.5 py-2.5 text-white focus:outline-none dir-ltr text-right"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-[#D4C8B8] mb-1">العنوان بالتفصيل</label>
                <input
                  type="text"
                  value={settingsForm.branch}
                  onChange={(e) => setSettingsForm({ ...settingsForm, branch: e.target.value })}
                  className="w-full bg-[#0D0A08] border border-[#2B1F17] rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-[#D4C8B8] mb-1">ساعات الدوام اليومية</label>
                <input
                  type="text"
                  value={settingsForm.hours}
                  onChange={(e) => setSettingsForm({ ...settingsForm, hours: e.target.value })}
                  className="w-full bg-[#0D0A08] border border-[#2B1F17] rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#D4C8B8] mb-1">رابط صفحة الإنستغرام</label>
                <input
                  type="text"
                  value={settingsForm.instagramUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                  className="w-full bg-[#0D0A08] border border-[#2B1F17] rounded-xl px-3.5 py-2.5 text-white focus:outline-none dir-ltr text-right"
                />
              </div>

              <div>
                <label className="block font-bold text-[#D4C8B8] mb-1">رابط صفحة الفيسبوك</label>
                <input
                  type="text"
                  value={settingsForm.facebookUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, facebookUrl: e.target.value })}
                  className="w-full bg-[#0D0A08] border border-[#2B1F17] rounded-xl px-3.5 py-2.5 text-white focus:outline-none dir-ltr text-right"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-[#D4C8B8] mb-1">شريط الإعلان المتحرك في أعلى الموقع</label>
                <input
                  type="text"
                  value={settingsForm.announcementBanner}
                  onChange={(e) => setSettingsForm({ ...settingsForm, announcementBanner: e.target.value })}
                  className="w-full bg-[#0D0A08] border border-[#2B1F17] rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-[#D4C8B8] mb-1">
                  قصة المحل والعائلة (نص صفحة "قصتنا")
                </label>
                <textarea
                  rows={4}
                  value={settingsForm.ourStory}
                  onChange={(e) => setSettingsForm({ ...settingsForm, ourStory: e.target.value })}
                  className="w-full bg-[#0D0A08] border border-[#2B1F17] rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end">
              <button
                type="submit"
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#FF7A1A] to-[#FF4D00] text-black font-black text-sm shadow-md ember-glow hover:scale-105 transition-all"
              >
                حفظ كافة التعديلات
              </button>
            </div>
          </div>

        </form>
      )}

      {/* MODAL: ADD / EDIT PRODUCT */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#140F0D] border-2 border-[#FF7A1A]/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto text-right space-y-4 animate-fadeIn">
            <h3 className="text-lg font-bold text-white font-heading border-b border-[#241A14] pb-2">
              {editingProduct.id ? 'تعديل صنف في المنيو' : 'إضافة صنف جديد للكنافة'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#D4C8B8] mb-1">اسم الصنف <span className="text-[#FF7A1A]">*</span></label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-[#0D0A08] border border-[#2F231A] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-[#D4C8B8] mb-1">التصنيف</label>
                <select
                  value={editingProduct.category || 'charcoal'}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                  className="w-full bg-[#0D0A08] border border-[#2F231A] rounded-xl px-3 py-2 text-white"
                >
                  <option value="charcoal">كنافة على الفحم</option>
                  <option value="nutella">كنافة نوتيلا</option>
                  <option value="nawashef">نواشف العيد (موسمي)</option>
                  <option value="other">أصناف أخرى ومشروبات</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#D4C8B8] mb-1">السعر الأساسي بالشيكل (₪) <span className="text-[#FF7A1A]">*</span></label>
                <input
                  type="number"
                  required
                  min={1}
                  value={editingProduct.basePrice || 25}
                  onChange={(e) => setEditingProduct({ ...editingProduct, basePrice: Number(e.target.value) })}
                  className="w-full bg-[#0D0A08] border border-[#2F231A] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-[#D4C8B8] mb-1">الوصف</label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-[#0D0A08] border border-[#2F231A] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-[#D4C8B8] mb-1">رابط الصورة (Image URL)</label>
                <input
                  type="text"
                  placeholder="اترك فارغاً لاستخدام المربع الداكن وتوهج الجمر التلقائي"
                  value={editingProduct.image || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                  className="w-full bg-[#0D0A08] border border-[#2F231A] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isInitialPrice || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isInitialPrice: e.target.checked })}
                    className="accent-[#FF7A1A]"
                  />
                  <span>تعليم كـ "سعر تقديري يحتاج مراجعة"</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isAvailable !== false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isAvailable: e.target.checked })}
                    className="accent-[#FF7A1A]"
                  />
                  <span>متوفر للبيع الآن</span>
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#8C8074] hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#FF7A1A] text-black font-bold"
                >
                  حفظ الصنف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT OFFER */}
      {isOfferModalOpen && editingOffer && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#140F0D] border-2 border-[#FF7A1A]/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-right space-y-4 animate-fadeIn">
            <h3 className="text-lg font-bold text-white font-heading border-b border-[#241A14] pb-2">
              {editingOffer.id ? 'تعديل العرض' : 'إنشاء عرض موسمي جديد'}
            </h3>

            <form onSubmit={handleSaveOffer} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#D4C8B8] mb-1">عنوان العرض</label>
                <input
                  type="text"
                  required
                  value={editingOffer.title || ''}
                  onChange={(e) => setEditingOffer({ ...editingOffer, title: e.target.value })}
                  className="w-full bg-[#0D0A08] border border-[#2F231A] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#D4C8B8] mb-1">نسبة الخصم %</label>
                  <input
                    type="number"
                    value={editingOffer.discountPercent || 0}
                    onChange={(e) => setEditingOffer({ ...editingOffer, discountPercent: Number(e.target.value) })}
                    className="w-full bg-[#0D0A08] border border-[#2F231A] rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#D4C8B8] mb-1">الشارة (Badge)</label>
                  <input
                    type="text"
                    value={editingOffer.badge || 'عرض خاص'}
                    onChange={(e) => setEditingOffer({ ...editingOffer, badge: e.target.value })}
                    className="w-full bg-[#0D0A08] border border-[#2F231A] rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#D4C8B8] mb-1">تفاصيل العرض</label>
                <textarea
                  rows={2}
                  value={editingOffer.description || ''}
                  onChange={(e) => setEditingOffer({ ...editingOffer, description: e.target.value })}
                  className="w-full bg-[#0D0A08] border border-[#2F231A] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#8C8074]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#FF7A1A] text-black font-bold"
                >
                  حفظ العرض
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print receipt modal */}
      <ReceiptPrintModal
        isOpen={!!selectedOrderForPrint}
        onClose={() => setSelectedOrderForPrint(null)}
        order={selectedOrderForPrint}
        settings={settings}
      />

    </div>
  );
};
