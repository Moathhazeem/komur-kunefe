import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Shield, ShoppingBag, Utensils, Sparkles, MessageSquare, Bike,
  BarChart3, Bot, Settings, LogOut, CheckCircle, Clock, AlertTriangle,
  Plus, Edit2, Trash2, Printer, Search, RefreshCw, Eye, EyeOff, Send,
  FileText, Download, Check, X, Tag, DollarSign, TrendingUp, Users, Flame
} from 'lucide-react';
import { Product, Order, Offer, Review, DeliveryInterest, StoreSettings, DashboardStats, UserSession } from '../types';
import { api } from '../services/api';
import { ReceiptPrintModal } from '../components/ReceiptPrintModal';
import { NeighborhoodsBarChart } from '../components/charts/NeighborhoodsBarChart';
import { SourceDonutChart } from '../components/charts/SourceDonutChart';
import { PeakHoursAreaChart } from '../components/charts/PeakHoursAreaChart';
import { CompetitorIntelligence } from '../components/CompetitorIntelligence';
import { MarkdownChatContent } from '../components/MarkdownChatContent';

interface AdminPageProps {
  settings: StoreSettings | null;
  onRefreshGlobalSettings: () => void;
  onNavigateHome: () => void;
  onNavigate?: (tab: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  settings,
  onRefreshGlobalSettings,
  onNavigateHome,
  onNavigate,
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
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'offers' | 'reviews' | 'delivery' | 'analytics' | 'ai' | 'competitors' | 'settings'>(() => {
    try {
      const stored = sessionStorage.getItem('komur_admin_target_tab');
      if (stored && ['orders', 'products', 'offers', 'reviews', 'delivery', 'analytics', 'ai', 'competitors', 'settings'].includes(stored)) {
        sessionStorage.removeItem('komur_admin_target_tab');
        return stored as any;
      }
      const hashMatch = window.location.hash.match(/tab=([a-z]+)/i);
      if (hashMatch && ['orders', 'products', 'offers', 'reviews', 'delivery', 'analytics', 'ai', 'competitors', 'settings'].includes(hashMatch[1])) {
        return hashMatch[1] as any;
      }
    } catch { }
    return 'orders';
  });

  // Listen for hash & cross-page navigation triggers to sync tabs
  useEffect(() => {
    const handleTabSync = () => {
      try {
        const stored = sessionStorage.getItem('komur_admin_target_tab');
        if (stored && ['orders', 'products', 'offers', 'reviews', 'delivery', 'analytics', 'ai', 'competitors', 'settings'].includes(stored)) {
          sessionStorage.removeItem('komur_admin_target_tab');
          setActiveTab(stored as any);
          return;
        }
        const hashMatch = window.location.hash.match(/tab=([a-z]+)/i);
        if (hashMatch && ['orders', 'products', 'offers', 'reviews', 'delivery', 'analytics', 'ai', 'competitors', 'settings'].includes(hashMatch[1])) {
          setActiveTab(hashMatch[1] as any);
        }
      } catch { }
    };

    window.addEventListener('hashchange', handleTabSync);
    return () => window.removeEventListener('hashchange', handleTabSync);
  }, []);

  // Orders State
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll active tab into visible view
    const el = tabsContainerRef.current;
    if (!el) return;
    const activeEl = el.querySelector('[data-active="true"]') as HTMLElement | null;
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeTab]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);
  const [soundAlertEnabled, setSoundAlertEnabled] = useState(true);

  const [isManualOrderModalOpen, setIsManualOrderModalOpen] = useState(false);
  const [isSavingManualOrder, setIsSavingManualOrder] = useState(false);
  const [manualOrderForm, setManualOrderForm] = useState({
    customerName: '', customerPhone: '', source: 'whatsapp' as 'whatsapp' | 'instagram' | 'facebook',
    fulfillment: 'pickup' as 'pickup' | 'delivery', deliveryAddress: '', pickupTime: 'خلال 20-30 دقيقة',
    notes: '', paymentStatus: 'pending' as 'paid' | 'pending',
  });
  const [manualOrderItems, setManualOrderItems] = useState<Array<{ productId: string; variantId: string; quantity: number }>>([]);
  const [manualProductId, setManualProductId] = useState('');
  const [manualVariantId, setManualVariantId] = useState('');
  const [manualQuantity, setManualQuantity] = useState(1);

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
      text: 'مرحباً بك! أنا "مساعد كُومُر الذكي"، مساعدك لتحليل أعمال المحل والمبيعات والمنافسين والتسويق. اسألني عن بيانات المحل أو المنافسين أو السوشال ميديا، وسأساعدك بتحليل واضح وتوصيات عملية.'
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
  }, [session, activeTab, dateRange, orderSearch]);

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
      const data = await api.getOrders('all', orderSearch);
      setOrders(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!session || activeTab !== 'orders') return;
    let active = true;
    const timeout = window.setTimeout(() => {
      api.getOrders('all', orderSearch).then((data) => { if (active) setOrders(data); }).catch((error) => console.error(error));
    }, 250);
    return () => { active = false; window.clearTimeout(timeout); };
  }, [orderSearch, session, activeTab]);

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

  const handleSaveManualOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!manualOrderForm.customerName.trim() || !manualOrderForm.customerPhone.trim() || manualOrderItems.length === 0) {
      alert('أدخل اسم الزبون ورقم هاتفه وأضف صنفاً واحداً على الأقل.');
      return;
    }
    if (manualOrderForm.fulfillment === 'delivery' && !manualOrderForm.deliveryAddress.trim()) {
      alert('أدخل عنوان التوصيل.');
      return;
    }
    setIsSavingManualOrder(true);
    try {
      await api.createManualOrder({ ...manualOrderForm, items: manualOrderItems });
      setIsManualOrderModalOpen(false);
      setManualOrderForm({ customerName: '', customerPhone: '', source: 'whatsapp', fulfillment: 'pickup', deliveryAddress: '', pickupTime: 'خلال 20-30 دقيقة', notes: '', paymentStatus: 'pending' });
      setManualOrderItems([]);
      setManualProductId('');
      setManualVariantId('');
      await loadOrders();
    } catch (error: any) {
      alert(error.message || 'تعذر حفظ الطلب اليدوي.');
    } finally {
      setIsSavingManualOrder(false);
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
    if (editingOffer.type === 'coupon' && (!editingOffer.couponCode?.trim() || !editingOffer.discountPercent || editingOffer.discountPercent < 1 || editingOffer.discountPercent > 100)) {
      alert('أدخل رمز كوبون ونسبة خصم بين 1 و100');
      return;
    }
    try {
      if (editingOffer.id) {
        await api.updateOffer(editingOffer.id, editingOffer);
      } else {
        await api.createOffer(editingOffer);
      }
      setIsOfferModalOpen(false);
      setEditingOffer(null);
      loadOffers();
      window.dispatchEvent(new CustomEvent('komur_offer_published'));
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
      <div className="bg-white border border-amber-100 rounded-3xl p-4 sm:p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
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
            className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
            title="تحديث البيانات"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">تحديث</span>
          </button>

          <button
            onClick={onNavigateHome}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-colors cursor-pointer active:scale-95"
          >
            الموقع كزبون
          </button>

          <button
            onClick={handleLogout}
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer active:scale-95"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Admin Tabs Bar: Native Touch/Mouse Horizontal Scroll without Arrow Buttons */}
      <div className="w-full">
        <div
          ref={tabsContainerRef}
          onWheel={(e) => {
            if (tabsContainerRef.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
              tabsContainerRef.current.scrollLeft += e.deltaY;
            }
          }}
          className="flex items-center gap-2.5 overflow-x-auto flex-nowrap pb-3 pt-1 px-1 scrollbar-none border-b border-amber-200/60 touch-pan-x cursor-grab active:cursor-grabbing select-none"
        >
          {[
            { id: 'orders', label: 'الطلبات الحية', icon: ShoppingBag, badge: orders.filter((o) => o.status === 'new').length },
            { id: 'products', label: 'المنيو والأسعار', icon: Utensils },
            { id: 'offers', label: 'العروض الموسمية', icon: Sparkles },
            { id: 'reviews', label: 'آراء الزبائن', icon: MessageSquare, badge: reviews.filter((r) => !r.isApproved).length },
            { id: 'delivery', label: 'اهتمام التوصيل', icon: Bike, badge: deliveryInterests.length },
            { id: 'analytics', label: 'الداشبورد الذكي', icon: BarChart3 },
            { id: 'ai', label: 'مساعد كُومُر AI', icon: Bot },
            { id: 'competitors', label: 'ذكاء المنافسين', icon: TrendingUp },
            { id: 'settings', label: 'إعدادات المحل', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                data-tab={tab.id}
                data-active={active}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group shrink-0 flex min-h-[44px] items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border cursor-pointer active:scale-95 ${active
                  ? 'bg-[#17120F] text-[#DAB775] border-[#17120F] shadow-sm font-black'
                  : 'bg-white text-[#75675C] border-[#35241A]/10 hover:border-[#C7652D]/40 hover:text-[#C7652D]'
                  }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#DAB775]' : 'text-[#75675C] group-hover:text-[#C7652D]'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`text-[10px] font-black min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center ${
                    active ? 'bg-amber-800 text-white' : 'bg-amber-200 text-amber-900'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-fadeIn">

          {/* Controls bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-amber-100 shadow-sm transition-all">
            <div className="flex items-center gap-2 overflow-x-auto flex-nowrap w-full sm:w-auto pb-1 scrollbar-none">
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
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${orderFilter === st.id
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-500 hover:text-orange-600 hover:bg-amber-50 border border-slate-200'
                    }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-64">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="بحث برقم الطلب، الاسم، أو الهاتف..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="-mt-4 flex justify-start px-4 sm:pl-4 sm:pr-0" dir="ltr">
            <button
              type="button"
              onClick={() => { setManualOrderItems([]); setManualProductId(''); setManualVariantId(''); setIsManualOrderModalOpen(true); }}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-orange-700 sm:w-64"
            >
              <Plus className="h-4 w-4" /> إضافة طلب من السوشيال ميديا
            </button>
          </div>

          {isManualOrderModalOpen && createPortal(
            <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 p-3 sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsManualOrderModalOpen(false); }}>
              <div role="dialog" aria-modal="true" aria-labelledby="manual-order-title" className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-amber-200 bg-white p-5 shadow-2xl sm:p-7">
                <form onSubmit={handleSaveManualOrder} className="space-y-5">
                  <div className="flex items-start justify-between gap-3 border-b border-amber-100 pb-4">
                    <div>
                      <h3 id="manual-order-title" className="text-lg font-black text-slate-900">إضافة طلب من وسائل التواصل</h3>
                      <p className="mt-1 text-xs text-slate-500">سيُحفظ الطلب في قاعدة البيانات ويظهر ضمن تقارير المبيعات حسب مصدره.</p>
                    </div>
                    <button type="button" onClick={() => setIsManualOrderModalOpen(false)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50" aria-label="إغلاق">×</button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="space-y-1.5 text-xs font-bold text-slate-700">اسم الزبون
                      <input required value={manualOrderForm.customerName} onChange={event => setManualOrderForm(form => ({ ...form, customerName: event.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-orange-400" placeholder="الاسم الكامل" />
                    </label>
                    <label className="space-y-1.5 text-xs font-bold text-slate-700">رقم الهاتف
                      <input required type="tel" value={manualOrderForm.customerPhone} onChange={event => setManualOrderForm(form => ({ ...form, customerPhone: event.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-orange-400" placeholder="05xxxxxxxx" />
                    </label>
                    <label className="space-y-1.5 text-xs font-bold text-slate-700">مصدر الطلب
                      <select value={manualOrderForm.source} onChange={event => setManualOrderForm(form => ({ ...form, source: event.target.value as 'whatsapp' | 'instagram' | 'facebook' }))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:border-orange-400">
                        <option value="whatsapp">واتساب</option><option value="instagram">إنستغرام</option><option value="facebook">فيسبوك</option>
                      </select>
                    </label>
                    <label className="space-y-1.5 text-xs font-bold text-slate-700">الدفع
                      <select value={manualOrderForm.paymentStatus} onChange={event => setManualOrderForm(form => ({ ...form, paymentStatus: event.target.value as 'paid' | 'pending' }))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:border-orange-400">
                        <option value="pending">غير مدفوع</option><option value="paid">مدفوع</option>
                      </select>
                    </label>
                  </div>

                  <section className="space-y-3 rounded-2xl border border-amber-100 bg-[#FBF8F2] p-4">
                    <h4 className="text-xs font-black text-slate-800">الأصناف</h4>
                    <div className="grid grid-cols-1 items-end gap-2 sm:grid-cols-[1.3fr_1fr_90px_auto]">
                      <label className="space-y-1 text-[11px] font-bold text-slate-600">المنتج
                        <select value={manualProductId} onChange={event => { const id = event.target.value; setManualProductId(id); setManualVariantId(products.find(product => product.id === id)?.variants?.[0]?.id || ''); }} className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-normal">
                          <option value="">اختر منتجاً</option>{products.filter(product => product.isAvailable !== false).map(product => <option key={product.id} value={product.id}>{product.name}</option>)}
                        </select>
                      </label>
                      <label className="space-y-1 text-[11px] font-bold text-slate-600">الحجم / النوع
                        <select value={manualVariantId} onChange={event => setManualVariantId(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-normal">
                          {(products.find(product => product.id === manualProductId)?.variants || []).map(variant => <option key={variant.id} value={variant.id}>{variant.name} · {variant.price} ₪</option>)}
                        </select>
                      </label>
                      <label className="space-y-1 text-[11px] font-bold text-slate-600">الكمية
                        <input type="number" min="1" max="99" value={manualQuantity} onChange={event => setManualQuantity(Math.max(1, Number(event.target.value) || 1))} className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs" />
                      </label>
                      <button type="button" disabled={!manualProductId || !manualVariantId} onClick={() => { setManualOrderItems(current => { const existing = current.find(item => item.productId === manualProductId && item.variantId === manualVariantId); return existing ? current.map(item => item === existing ? { ...item, quantity: item.quantity + manualQuantity } : item) : [...current, { productId: manualProductId, variantId: manualVariantId, quantity: manualQuantity }]; }); setManualQuantity(1); }} className="min-h-[38px] rounded-lg bg-slate-800 px-3 text-xs font-bold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40">إضافة</button>
                    </div>
                    {manualOrderItems.length === 0 ? <p className="text-[11px] text-slate-400">لم تتم إضافة أصناف بعد.</p> : (
                      <div className="space-y-2">{manualOrderItems.map((item, index) => {
                        const product = products.find(entry => entry.id === item.productId);
                        const variant = product?.variants.find(entry => entry.id === item.variantId);
                        return <div key={`${item.productId}-${item.variantId}`} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs">
                          <span className="font-bold text-slate-800">{product?.name || 'منتج'} <span className="font-normal text-slate-500">({variant?.name})</span></span>
                          <div className="flex items-center gap-2"><button type="button" onClick={() => setManualOrderItems(items => items.map((entry, i) => i === index ? { ...entry, quantity: Math.max(1, entry.quantity - 1) } : entry))} className="h-7 w-7 rounded-md border border-slate-200">−</button><span className="min-w-5 text-center font-bold">{item.quantity}</span><button type="button" onClick={() => setManualOrderItems(items => items.map((entry, i) => i === index ? { ...entry, quantity: Math.min(99, entry.quantity + 1) } : entry))} className="h-7 w-7 rounded-md border border-slate-200">+</button><span className="w-16 text-left font-bold text-orange-700">{(variant?.price || 0) * item.quantity} ₪</span><button type="button" onClick={() => setManualOrderItems(items => items.filter((_, i) => i !== index))} className="px-2 text-rose-600" aria-label="حذف الصنف">حذف</button></div>
                        </div>;
                      })}</div>
                    )}
                  </section>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="space-y-1.5 text-xs font-bold text-slate-700">طريقة الاستلام
                      <select value={manualOrderForm.fulfillment} onChange={event => setManualOrderForm(form => ({ ...form, fulfillment: event.target.value as 'pickup' | 'delivery' }))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal">
                        <option value="pickup">استلام من المحل</option><option value="delivery">توصيل (+15 ₪)</option>
                      </select>
                    </label>
                    {manualOrderForm.fulfillment === 'delivery' ? <label className="space-y-1.5 text-xs font-bold text-slate-700">عنوان التوصيل
                      <input required value={manualOrderForm.deliveryAddress} onChange={event => setManualOrderForm(form => ({ ...form, deliveryAddress: event.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal" placeholder="المدينة، المنطقة، الشارع" />
                    </label> : <label className="space-y-1.5 text-xs font-bold text-slate-700">موعد الاستلام
                      <input value={manualOrderForm.pickupTime} onChange={event => setManualOrderForm(form => ({ ...form, pickupTime: event.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal" />
                    </label>}
                  </div>
                  <label className="block space-y-1.5 text-xs font-bold text-slate-700">ملاحظات الطلب
                    <textarea rows={2} value={manualOrderForm.notes} onChange={event => setManualOrderForm(form => ({ ...form, notes: event.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal" placeholder="ملاحظات الزبون أو تفاصيل إضافية" />
                  </label>
                  <div className="flex flex-col-reverse justify-end gap-2 border-t border-slate-100 pt-4 sm:flex-row">
                    <button type="button" onClick={() => setIsManualOrderModalOpen(false)} className="min-h-[44px] rounded-xl border border-slate-200 px-5 text-xs font-bold text-slate-600 hover:bg-slate-50">إلغاء</button>
                    <button type="submit" disabled={isSavingManualOrder} className="min-h-[44px] rounded-xl bg-orange-600 px-5 text-xs font-bold text-white hover:bg-orange-700 disabled:opacity-60">{isSavingManualOrder ? 'جارٍ حفظ الطلب...' : 'حفظ الطلب في قاعدة البيانات'}</button>
                  </div>
                </form>
              </div>
            </div>,
            document.body
          )}

          {/* Orders Table */}
          {orders.length === 0 ? (
            <div className="bg-white border border-amber-100 rounded-2xl p-12 text-center text-slate-400 shadow-sm">
              لا توجد طلبات تطابق هذا الفلتر حالياً.
            </div>
          ) : (
            <div className="space-y-4">
                {orders.filter((order) => orderFilter === 'all' || order.status === orderFilter).map((order) => (
                <div
                  key={order.id}
                  className={`bg-white border rounded-2xl p-4 sm:p-5 transition-all shadow-sm hover:shadow-md ${order.status === 'new'
                    ? 'border-orange-300 ring-1 ring-orange-200'
                    : 'border-amber-100 hover:border-amber-200'
                    }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-black text-amber-600 font-heading font-mono">
                      <button type="button" className="text-orange-600 underline-offset-2 hover:underline" onClick={() => {
                        try { sessionStorage.setItem('komur_track_query', order.orderNumber); } catch {}
                        onNavigate?.('track');
                      }} title="فتح تتبع هذا الطلب">{order.orderNumber}</button>
                      </span>
                      <span className="text-xs text-slate-400 tabular-nums">
                        {new Date(order.createdAt).toLocaleDateString('ar-EG-u-nu-latn')} - {new Date(order.createdAt).toLocaleTimeString('ar-EG-u-nu-latn', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[11px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
                        المصدر: {order.source || 'الموقع'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">حالة الطلب:</span>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                        className={`text-xs font-black min-h-[44px] px-3 py-2 rounded-xl border focus:outline-none transition-colors ${order.status === 'new'
                          ? 'bg-orange-50 text-orange-600 border-orange-200'
                          : order.status === 'preparing'
                            ? 'bg-amber-50 text-amber-600 border-amber-200'
                            : order.status === 'ready'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : order.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                : 'bg-slate-50 text-slate-500 border-slate-200'
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
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 active:scale-95 transition-all"
                        title="طباعة الفاتورة"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block">بيانات الزبون:</span>
                      <span className="font-bold text-slate-700 text-sm block">{order.customerName}</span>
                      <a href={`tel:${order.customerPhone}`} className="text-orange-500 hover:underline dir-ltr inline-block">
                        {order.customerPhone}
                      </a>
                    </div>

                    <div>
                      <span className="text-slate-400 block">موعد وطريقة الاستلام:</span>
                      <span className="font-bold text-amber-600 block">{order.pickupTime}</span>
                      <span className="text-slate-500 block">
                        {order.paymentMethod === 'mock_online' ? 'دفع إلكتروني تجريبي غير متاح' : 'دفع عند الاستلام كاش/بطاقة'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block">الأصناف المطلوبة:</span>
                      <div className="space-y-0.5 pt-0.5">
                        {order.items.map((it, i) => (
                          <div key={i} className="text-slate-600">
                            • {it.name} ({it.variantName}) × <strong className="text-slate-700">{it.quantity}</strong> = {it.price * it.quantity} ₪
                          </div>
                        ))}
                      </div>
                      <div className="pt-1 font-bold text-sm text-amber-600">
                        المجموع: {order.total} شيكل
                      </div>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                      <span className="font-bold text-orange-500">ملاحظة الزبون: </span>
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
              <h2 className="text-xl font-bold text-slate-900 font-heading">
                إدارة الأصناف والأسعار (شيكل ₪)
              </h2>
              <p className="text-xs text-slate-400">
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
              className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة صنف جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-amber-100 rounded-2xl p-4 flex flex-col justify-between space-y-4 shadow-sm relative hover:shadow-md hover:border-amber-200 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-slate-700 text-base font-heading">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setIsProductModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 transition-colors"
                        title="تعديل"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-400 border border-rose-100 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {product.description}
                  </p>

                  {/* Status badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    {product.isInitialPrice ? (
                      <span className="bg-amber-50 text-amber-600 border border-amber-200 text-[10px] px-2 py-0.5 rounded font-bold">
                        سعر مبدئي - يحتاج مراجعة
                      </span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] px-2 py-0.5 rounded font-bold">
                        سعر معتمد
                      </span>
                    )}
                    {!product.isAvailable && (
                      <span className="bg-rose-50 text-rose-500 border border-rose-100 text-[10px] px-2 py-0.5 rounded font-bold">
                        غير متوفر مؤقتاً
                      </span>
                    )}
                  </div>

                  {/* Variants list */}
                  <div className="space-y-1 bg-amber-50/40 p-2.5 rounded-xl border border-amber-100 text-xs">
                    <span className="text-slate-400 block font-bold text-[10px]">الأحجام والأسعار:</span>
                    {product.variants.map((v) => (
                      <div key={v.id} className="flex justify-between text-slate-600">
                        <span>{v.name}</span>
                        <span className="font-bold text-amber-600">{v.price} ₪</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">التصنيف: {product.category}</span>
                  <button
                    onClick={async () => {
                      await api.updateProduct(product.id, { isAvailable: !product.isAvailable });
                      loadProducts();
                    }}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${product.isAvailable
                      ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200'
                      : 'bg-rose-50 text-rose-500 hover:bg-rose-100 border-rose-100'
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
              <h2 className="text-xl font-bold text-slate-900 font-heading">
                إدارة العروض والمناسبات (العيد ورمضان)
              </h2>
              <p className="text-xs text-slate-400">
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
              className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء عرض جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white border border-amber-100 rounded-2xl p-5 space-y-4 shadow-sm relative flex flex-col justify-between hover:shadow-md hover:border-amber-200 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-orange-500 text-white text-xs font-black px-2.5 py-0.5 rounded-full shadow-sm">
                      {offer.badge}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingOffer(offer);
                          setIsOfferModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteOffer(offer.id)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-400 border border-rose-100 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-700 font-heading">
                    {offer.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {offer.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-amber-600 font-bold font-heading text-sm">
                    خصم {offer.discountPercent}%
                  </span>
                  <button
                    onClick={async () => {
                      await api.updateOffer(offer.id, { isActive: !offer.isActive });
                      loadOffers();
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${offer.isActive
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      : 'bg-rose-50 text-rose-500 border-rose-100'
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
              <h2 className="text-xl font-bold text-slate-900 font-heading">
                إدارة ومراجعة آراء الزبائن
              </h2>
              <p className="text-xs text-slate-400">
                الموافقة على آراء الزبائن الحقيقية قبل نشرها علناً لمنع التقييمات المزيفة.
              </p>
            </div>

            <button
              onClick={handleClearDemoReviews}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white border border-red-500 text-xs font-bold transition-colors shadow-sm self-start sm:self-auto"
            >
              حذف التقييمات التجريبية (إبقاء الحقيقي فقط)
            </button>
          </div>

          <div className="space-y-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white border border-amber-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md hover:border-amber-200 transition-all"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 text-sm">{rev.customerName}</span>
                    <span className="text-xs text-amber-500">★ {rev.rating}/5</span>
                    {rev.isDemo && (
                      <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded font-bold">
                        تجريبي
                      </span>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${rev.isApproved
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      : 'bg-amber-50 text-amber-600 border-amber-200'
                      }`}>
                      {rev.isApproved ? 'معتمد ومنشور' : 'بانتظار الموافقة'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    "{rev.comment}"
                  </p>
                  <span className="text-[10px] text-slate-400 block tabular-nums">
                    {new Date(rev.createdAt).toLocaleDateString('ar-EG-u-nu-latn')}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleReviewStatus(rev.id, !rev.isApproved)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${rev.isApproved
                      ? 'bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-200'
                      : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200'
                      }`}
                  >
                    {rev.isApproved ? 'إخفاء عن الزوار' : 'موافقة ونشر بالموقع'}
                  </button>
                  <button
                    onClick={() => handleDeleteReview(rev.id)}
                    className="p-1.5 rounded-xl bg-rose-50 text-rose-400 hover:bg-rose-100 border border-rose-100 transition-colors"
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

          {/* Geographic Bar Chart Ranking */}
          <NeighborhoodsBarChart
            demandByArea={dashboardStats?.deliveryDemand?.byArea}
            totalVotes={deliveryInterests.length}
            title="تحليل وترتيب المناطق الأكثر رغبة بالتوصيل (نابلس)"
            subtitle="مخطط شريطي أفقي يوضح ترتيب الأحياء والمناطق تنازلياً حسب كثافة الطلب"
          />

          <div className="bg-white border border-amber-100 rounded-3xl p-6 sm:p-8 space-y-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold">
                <Bike className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-700 font-heading">
                  قياس رغبة الزبائن في خدمة التوصيل (نابلس)
                </h2>
                <p className="text-xs text-slate-400">
                  إجمالي الزبائن الذين سجلوا رغبتهم بتوصيل الكنافة: <strong className="text-slate-600">{deliveryInterests.length} زبون</strong>
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 pt-2">
              {deliveryInterests.map((item) => (
                <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-700 text-sm block">منطقة: {item.area}</span>
                    {item.notes && <span className="text-slate-400 block">ملاحظة: {item.notes}</span>}
                  </div>
                  <div className="text-left">
                    <span className="text-amber-600 dir-ltr block font-mono">{item.customerPhone || 'بدون رقم'}</span>
                    <span className="text-[10px] text-slate-400 block tabular-nums">
                      {new Date(item.createdAt).toLocaleDateString('ar-EG-u-nu-latn')}
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
          <div className="bg-white border border-amber-100 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">الفترة الزمنية:</span>
              {(['today', '7d', '30d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${dateRange === r
                    ? 'bg-orange-500 text-white font-black shadow-sm'
                    : 'bg-slate-50 text-slate-500 hover:text-orange-600 hover:bg-amber-50 border border-slate-200'
                    }`}
                >
                  {r === 'today' ? 'اليوم' : r === '7d' ? 'آخر 7 أيام' : 'آخر 30 يومًا'}
                </button>
              ))}
            </div>

            <button
              onClick={handleResetSampleData}
              className="text-xs text-slate-400 hover:text-amber-600 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>إعادة تعيين البيانات الافتراضية للتحليل</span>
            </button>
          </div>

          {dashboardStats && (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-amber-100 rounded-2xl p-5 space-y-1 shadow-sm hover:shadow-md hover:border-amber-200 transition-all">
                  <span className="text-xs text-slate-400 block">إجمالي المبيعات</span>
                  <div className="text-2xl sm:text-3xl font-black text-amber-600 font-heading">
                    {dashboardStats.summary.totalSales} <span className="text-xs font-bold text-slate-400">₪</span>
                  </div>
                  <span className="text-[11px] text-emerald-500 block">شامل جميع الطلبات المؤكدة</span>
                </div>

                <div className="bg-white border border-amber-100 rounded-2xl p-5 space-y-1 shadow-sm hover:shadow-md hover:border-amber-200 transition-all">
                  <span className="text-xs text-slate-400 block">عدد الطلبات</span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-700 font-heading">
                    {dashboardStats.summary.totalOrders}
                  </div>
                  <span className="text-[11px] text-slate-400 block">طلبات مستلمة في الفرع</span>
                </div>

                <div className="bg-white border border-amber-100 rounded-2xl p-5 space-y-1 shadow-sm hover:shadow-md hover:border-amber-200 transition-all">
                  <span className="text-xs text-slate-400 block">متوسط قيمة الطلب</span>
                  <div className="text-2xl sm:text-3xl font-black text-amber-600 font-heading">
                    {dashboardStats.summary.avgOrderValue} <span className="text-xs font-bold text-slate-400">₪</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">متوسط الفاتورة الواحدة</span>
                </div>

                <div className="bg-white border border-amber-100 rounded-2xl p-5 space-y-1 shadow-sm hover:shadow-md hover:border-amber-200 transition-all">
                  <span className="text-xs text-slate-400 block">الزبائن المتكررون</span>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-heading">
                    {dashboardStats.summary.repeatCustomers}
                  </div>
                  <span className="text-[11px] text-slate-400 block">أكثر من طلب واحد</span>
                </div>
              </div>

              {/* Top & Least Selling Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Top Sellers */}
                <div className="bg-white border border-amber-100 rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 text-emerald-600 font-heading font-bold text-base">
                    <TrendingUp className="w-5 h-5" />
                    <span>أكثر 5 منتجات مبيعاً في الفترة المحددة</span>
                  </div>
                  <div className="space-y-2.5">
                    {dashboardStats.topProducts.map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="font-bold text-slate-700">{i + 1}. {p.name}</span>
                        <div className="text-left font-mono">
                          <span className="text-amber-600 font-bold">{p.quantity} قطعة</span>
                          <span className="text-slate-400 block">{p.revenue} ₪</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Least Sellers */}
                <div className="bg-white border border-amber-100 rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 text-rose-500 font-heading font-bold text-base">
                    <Tag className="w-5 h-5" />
                    <span>أقل المنتجات مبيعاً (فرص للتنشيط وعمل عروض)</span>
                  </div>
                  <div className="space-y-2.5">
                    {dashboardStats.leastProducts.map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="font-bold text-slate-700">{i + 1}. {p.name}</span>
                        <div className="text-left font-mono">
                          <span className="text-rose-500 font-bold">{p.quantity} قطعة</span>
                          <span className="text-slate-400 block">{p.revenue} ₪</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Peak Hours: Fluid Area Chart */}
              <PeakHoursAreaChart
                hourlyDistribution={dashboardStats.hourlyDistribution}
              />

              {/* Geographic Neighborhoods (Horizontal Bar) & Demand Sources (Donut Chart) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Demand Sources & Customer Channels (Donut Chart) */}
                <SourceDonutChart
                  sources={dashboardStats.sourceBreakdown}
                />

                {/* Neighborhoods and Areas (Horizontal Bar Chart) */}
                <NeighborhoodsBarChart
                  demandByArea={dashboardStats.deliveryDemand?.byArea}
                  totalVotes={dashboardStats.deliveryDemand?.totalVotes || deliveryInterests.length}
                />
              </div>
            </>
          )}

        </div>
      )}

      {/* TAB 7: AI AGENT & STRATEGIC REPORT */}
      {activeTab === 'ai' && (
        <div className="space-y-6 animate-fadeIn">

          <div className="bg-white border border-amber-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-black shadow-sm">
                  <Bot className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-700 font-heading">
                    مساعد كُومُر الذكي (AI Business Agent)
                  </h2>
                  <p className="text-xs text-slate-400">
                    مدعوم بنموذج Gemini 3.8 Flash ويجيب من بيانات المحل الفعلية دون اختلاق أرقام
                  </p>
                </div>
              </div>

              <button
                onClick={handleGenerateReport}
                disabled={isAiLoading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-sm flex items-center gap-2 self-start sm:self-auto transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>توليد تقرير أداء استراتيجي كامل</span>
              </button>
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-bold text-slate-400">أسئلة مقترحة:</span>
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
                  className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-amber-50 text-slate-500 hover:text-amber-600 border border-slate-200 hover:border-amber-200 text-xs transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat Messages Log */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-4 max-h-[460px] overflow-y-auto">
              {aiChatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 text-xs sm:text-sm leading-relaxed ${msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl ${msg.role === 'user'
                      ? 'bg-orange-500 text-white font-bold shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200 shadow-sm'
                      }`}
                  >
                    <MarkdownChatContent text={msg.text} isUser={msg.role === 'user'} />
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex items-center gap-2 text-xs text-amber-600">
                  <span className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
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
                className="flex-1 bg-slate-50 border border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-700 placeholder-slate-400 focus:outline-none transition-all"
              />
              <button
                onClick={() => handleAskAi()}
                disabled={isAiLoading || !aiInput.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-sm hover:scale-105 transition-all disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Render Generated Strategic Report if available */}
          {generatedReport && (
            <div className="bg-white border border-amber-100 rounded-3xl p-6 sm:p-10 space-y-6 shadow-md animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-bold font-heading text-slate-700">
                    التقرير التنفيذي الاستراتيجي لمحل Kömür Künefe
                  </h3>
                </div>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة أو حفظ كـ PDF</span>
                </button>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-mono">
                {generatedReport}
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 8: COMPETITOR INTELLIGENCE & MARKET ANALYSIS */}
      {activeTab === 'competitors' && (
        <CompetitorIntelligence />
      )}

      {/* TAB 9: STORE SETTINGS & LOGO */}
      {activeTab === 'settings' && settingsForm && (
        <form onSubmit={handleSaveSettings} className="space-y-6 animate-fadeIn">

          <div className="bg-white border border-amber-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
            <h2 className="text-xl font-bold text-slate-700 font-heading border-b border-slate-100 pb-3">
              إعدادات المحل والهوية (فرع رافدية - نابلس)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">اسم المحل</label>
                <input
                  type="text"
                  value={settingsForm.storeName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 placeholder-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">رابط الشعار (Logo URL)</label>
                <input
                  type="text"
                  placeholder="اترك فارغاً لاستخدام أيقونة الفحم والجمر الافتراضية"
                  value={settingsForm.logoUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 placeholder-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">رقم الهاتف والاتصال</label>
                <input
                  type="text"
                  value={settingsForm.phone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 placeholder-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none transition-all dir-ltr text-right"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">رقم التسجيل الضريبي / VAT</label>
                <input type="text" value={settingsForm.taxNumber || ''} onChange={(e) => setSettingsForm({ ...settingsForm, taxNumber: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none" placeholder="اختياري" />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">رقم الواتساب (لروابط المحادثة المباشرة)</label>
                <input
                  type="text"
                  value={settingsForm.whatsapp}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 placeholder-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none transition-all dir-ltr text-right"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-600 mb-1">العنوان بالتفصيل</label>
                <input
                  type="text"
                  value={settingsForm.branch}
                  onChange={(e) => setSettingsForm({ ...settingsForm, branch: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 placeholder-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-600 mb-1">ساعات الدوام اليومية</label>
                <input
                  type="text"
                  value={settingsForm.hours}
                  onChange={(e) => setSettingsForm({ ...settingsForm, hours: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 placeholder-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">رابط صفحة الإنستغرام</label>
                <input
                  type="text"
                  value={settingsForm.instagramUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 placeholder-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none transition-all dir-ltr text-right"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">رابط صفحة الفيسبوك</label>
                <input
                  type="text"
                  value={settingsForm.facebookUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, facebookUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 placeholder-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none transition-all dir-ltr text-right"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-600 mb-1">شريط الإعلان المتحرك في أعلى الموقع</label>
                <input
                  type="text"
                  value={settingsForm.announcementBanner}
                  onChange={(e) => setSettingsForm({ ...settingsForm, announcementBanner: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 placeholder-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-600 mb-1">
                  قصة المحل والعائلة (نص صفحة "قصتنا")
                </label>
                <textarea
                  rows={4}
                  value={settingsForm.ourStory}
                  onChange={(e) => setSettingsForm({ ...settingsForm, ourStory: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 placeholder-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end">
              <button
                type="submit"
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-sm transition-all"
              >
                حفظ كافة التعديلات
              </button>
            </div>
          </div>

        </form>
      )}

      {/* MODAL: ADD / EDIT PRODUCT */}
      {isProductModalOpen && editingProduct && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-amber-100 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto my-auto text-right space-y-4 shadow-xl animate-fadeIn">
            <h3 className="text-lg font-bold text-slate-700 font-heading border-b border-slate-100 pb-2">
              {editingProduct.id ? 'تعديل صنف في المنيو' : 'إضافة صنف جديد للكنافة'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">اسم الصنف <span className="text-orange-500">*</span></label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 placeholder-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">التصنيف</label>
                <select
                  value={editingProduct.category || 'charcoal'}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none transition-all"
                >
                  <option value="charcoal">كنافة على الفحم</option>
                  <option value="nutella">كنافة نوتيلا</option>
                  <option value="nawashef">نواشف العيد (موسمي)</option>
                  <option value="other">أصناف أخرى ومشروبات</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">السعر الأساسي بالشيكل (₪) <span className="text-orange-500">*</span></label>
                <input
                  type="number"
                  required
                  min={1}
                  value={editingProduct.basePrice || 25}
                  onChange={(e) => setEditingProduct({ ...editingProduct, basePrice: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 placeholder-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">الوصف</label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 placeholder-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">رابط الصورة (Image URL)</label>
                <input
                  type="text"
                  placeholder="اترك فارغاً لاستخدام المربع الداكن وتوهج الجمر التلقائي"
                  value={editingProduct.image || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 placeholder-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none transition-all"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={editingProduct.isInitialPrice || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isInitialPrice: e.target.checked })}
                    className="accent-orange-500"
                  />
                  <span>تعليم كـ "سعر تقديري يحتاج مراجعة"</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={editingProduct.isAvailable !== false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isAvailable: e.target.checked })}
                    className="accent-orange-500"
                  />
                  <span>متوفر للبيع الآن</span>
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors"
                >
                  حفظ الصنف
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL: ADD / EDIT OFFER */}
      {isOfferModalOpen && editingOffer && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-amber-100 rounded-3xl p-6 sm:p-8 max-w-lg w-full my-auto text-right space-y-4 shadow-xl animate-fadeIn">
            <h3 className="text-lg font-bold text-slate-700 font-heading border-b border-slate-100 pb-2">
              {editingOffer.id ? 'تعديل العرض' : 'إنشاء عرض موسمي جديد'}
            </h3>

            <form onSubmit={handleSaveOffer} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">نوع العرض</label>
                <select value={editingOffer.type || 'standard'} onChange={(e) => setEditingOffer({ ...editingOffer, type: e.target.value as 'standard' | 'coupon', couponCode: e.target.value === 'coupon' ? (editingOffer.couponCode || 'KOMUR10') : '' })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700">
                  <option value="standard">Standard Offer</option><option value="coupon">Discount Coupon</option>
                </select>
              </div>
              {editingOffer.type === 'coupon' && <div><label className="block font-bold text-slate-600 mb-1">اسم / رمز الكوبون</label><input required value={editingOffer.couponCode || ''} onChange={(e) => setEditingOffer({ ...editingOffer, couponCode: e.target.value.toUpperCase() })} placeholder="KOMUR10" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 uppercase" /></div>}
              <div>
                <label className="block font-bold text-slate-600 mb-1">عنوان العرض</label>
                <input
                  type="text"
                  required
                  value={editingOffer.title || ''}
                  onChange={(e) => setEditingOffer({ ...editingOffer, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 placeholder-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">نسبة الخصم %</label>
                  <input
                    type="number"
                    value={editingOffer.discountPercent || 0}
                    onChange={(e) => setEditingOffer({ ...editingOffer, discountPercent: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 placeholder-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">الشارة (Badge)</label>
                  <input
                    type="text"
                    value={editingOffer.badge || 'عرض خاص'}
                    onChange={(e) => setEditingOffer({ ...editingOffer, badge: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 placeholder-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">تفاصيل العرض</label>
                <textarea
                  rows={2}
                  value={editingOffer.description || ''}
                  onChange={(e) => setEditingOffer({ ...editingOffer, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 placeholder-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none transition-all"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors"
                >
                  حفظ العرض
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Print receipt modal */}
      {selectedOrderForPrint && createPortal(
        <ReceiptPrintModal
          isOpen={!!selectedOrderForPrint}
          onClose={() => setSelectedOrderForPrint(null)}
          order={selectedOrderForPrint}
          settings={settings}
        />,
        document.body
      )}

    </div>
  );
};
