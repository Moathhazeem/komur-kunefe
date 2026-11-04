import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, BarChart3, Check, Clock3, MapPin, PackageCheck, Plus, Save,
  ShieldCheck, ShoppingBag, Store, Trash2, UserRound, Users, Utensils,
  Wrench, CheckCircle2, Layers, ArrowUpRight
} from 'lucide-react';
import { AuthUser, useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Order, Product, StoreSettings } from '../types';

interface CustomerProfileData {
  phone: string;
  addresses: string[];
  dietaryNotes: string;
}

interface AccountSettingsPageProps {
  user: AuthUser;
  isAdmin: boolean;
  settings: StoreSettings | null;
  products: Product[];
  onNavigate: (tab: string) => void;
  onSaveSettings: (settings: Partial<StoreSettings>) => Promise<void>;
}

const profileKey = (email: string) => `komur_account_profile_${email.trim().toLowerCase()}`;

const loadProfile = (email: string, phone = ''): CustomerProfileData => {
  try {
    const saved = localStorage.getItem(profileKey(email));
    if (saved) return { phone, addresses: [], dietaryNotes: '', ...JSON.parse(saved) };
  } catch { }
  return { phone, addresses: [], dietaryNotes: '' };
};

// Warm, creamy aesthetic matching brand tokens: soft white cards, subtle borders, warm shadows
const panelClass = 'rounded-3xl border border-[rgba(53,36,26,0.1)] bg-white p-5 shadow-sm shadow-[#35241A]/5 sm:p-7 transition-all duration-200';
const inputClass = 'mt-2 w-full rounded-xl border border-[rgba(53,36,26,0.15)] bg-[#FAF7F2] px-4 py-3 text-sm text-[#211814] placeholder:text-[#A89A8E] outline-none transition-all duration-200 focus:border-[#C7652D] focus:ring-2 focus:ring-[#C7652D]/20 focus:bg-white';

const ORDER_STATUS_LABELS: Record<Order['status'], string> = {
  new: 'تم الاستلام',
  preparing: 'قيد التحضير',
  ready: 'جاهز للاستلام',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

export const AccountSettingsPage: React.FC<AccountSettingsPageProps> = ({
  user,
  isAdmin,
  settings,
  products,
  onNavigate,
  onSaveSettings,
}) => {
  const { updateProfile, changePassword } = useAuth();

  // Admin active sub-view ('general' = Store Settings, 'staff' = Staff Management interface)
  const [adminActiveTab, setAdminActiveTab] = useState<'general' | 'staff'>('general');

  // Customer profile form state
  const [profile, setProfile] = useState(() => loadProfile(user.email, user.phone));
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [newAddress, setNewAddress] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  // Store settings form state
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');
  const [settingsForm, setSettingsForm] = useState<StoreSettings | null>(settings);

  // Live orders & analytics stats
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<{ totalSales: number; totalOrders: number; activeOrders: number } | null>(null);

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setProfile(loadProfile(user.email, user.phone));
  }, [user.email, user.name, user.phone]);

  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  /**
   * (Backend) API Integration:
   * GET /api/orders & GET /api/analytics/summary
   * Fetches the complete list of live store orders and aggregated metrics for the owner dashboard.
   * Suggested backend implementation: Query indexed 'orders' collection filtered by date range or branchId.
   */
  useEffect(() => {
    let cancelled = false;
    api.getOrders().then((loadedOrders) => {
      if (cancelled) return;
      setAllOrders(loadedOrders);
      if (isAdmin) {
        const activeOrders = loadedOrders.filter((order) => ['new', 'preparing', 'ready'].includes(order.status)).length;
        const totalSales = loadedOrders.filter((order) => order.paymentStatus === 'paid').reduce((sum, order) => sum + order.total, 0);
        setAnalytics({ totalSales, totalOrders: loadedOrders.length, activeOrders });
      }
    }).catch(() => {
      if (!cancelled) setAllOrders([]);
    });
    return () => { cancelled = true; };
  }, [isAdmin]);

  const orders = useMemo(() => allOrders.filter((order) => {
    if (profile.phone.trim()) return order.customerPhone === profile.phone.trim();
    return order.customerName.trim().toLowerCase() === user.name.trim().toLowerCase();
  }), [allOrders, profile.phone, user.name]);

  const openOrders = useMemo(() => orders.filter((order) => ['new', 'preparing', 'ready'].includes(order.status)), [orders]);

  /**
   * Helper to seamlessly navigate to specific sub-pages in Admin Dashboard (Analytics, Products, Orders)
   */
  const navigateToAdminTab = (targetTab: 'analytics' | 'products' | 'orders' | 'settings') => {
    try {
      sessionStorage.setItem('komur_admin_target_tab', targetTab);
    } catch { }
    window.location.hash = `admin?tab=${targetTab}`;
    onNavigate('admin');
  };

  /**
   * (Backend) API Integration:
   * PUT /api/users/profile
   * Updates customer name, email, and phone number in database.
   * Suggested backend implementation: Validate with Zod schema, update MongoDB 'users' collection, re-issue signed JWT token.
   */
  const saveCustomerProfile = () => {
    const result = updateProfile({ name, email, phone: profile.phone.trim() });
    if (!result.ok) {
      setProfileMessage(result.error || 'تعذر حفظ البيانات.');
      return;
    }
    try {
      localStorage.setItem(profileKey(email), JSON.stringify(profile));
    } catch { }
    setProfileMessage('تم حفظ معلومات الحساب بنجاح.');
  };

  /**
   * (Backend) API Integration:
   * PUT /api/users/preferences
   * Persists saved addresses and dietary preferences (e.g. healthy syrup, toppings) in customer profile table.
   */
  const savePreferences = () => {
    try {
      localStorage.setItem(profileKey(user.email), JSON.stringify(profile));
      setProfileMessage('تم حفظ العناوين والتفضيلات بنجاح.');
    } catch {
      setProfileMessage('تعذر الحفظ على هذا الجهاز.');
    }
  };

  /**
   * (Backend) API Integration:
   * POST /api/auth/change-password
   * Verifies current password against stored hash (bcrypt/argon2), validates password policy, and updates to new hash.
   */
  const submitPasswordChange = () => {
    const result = changePassword(currentPassword, newPassword);
    setPasswordMessage(result.ok ? 'تم تغيير كلمة المرور بنجاح.' : result.error || 'تعذر تغيير كلمة المرور.');
    if (result.ok) {
      setCurrentPassword('');
      setNewPassword('');
    }
  };

  /**
   * (Backend) API Integration:
   * PUT /api/settings
   * Persists store name, branch address, contact info, working hours, and operation flags to database.
   * Suggested backend implementation: Validate permissions (must have 'owner' or 'admin' role), save to PostgreSQL/MongoDB,
   * invalidate Redis cache, and publish updates to WebSocket channels.
   */
  const saveStoreSettings = async () => {
    if (!settingsForm) return;
    setSavingSettings(true);
    setSettingsMessage('');
    try {
      await onSaveSettings(settingsForm);
      setSettingsMessage('تم حفظ إعدادات الفرع بنجاح.');
    } catch {
      setSettingsMessage('تعذر الحفظ. يرجى المحاولة مرة أخرى.');
    } finally {
      setSavingSettings(false);
    }
  };

  /**
   * (Backend) API Integration:
   * PATCH /api/settings/status
   * Instantly toggles branch open/closed state.
   * Suggested backend implementation: Update isStoreOpen in DB and broadcast WebSocket event `store_status_changed`
   * to immediately reflect on customer storefronts and prevent new orders when closed.
   */
  const toggleStoreOpenStatus = () => {
    if (!settingsForm) return;
    const updated = { ...settingsForm, isStoreOpen: settingsForm.isStoreOpen === false };
    setSettingsForm(updated);
  };

  const addAddress = () => {
    const address = newAddress.trim();
    if (!address) return;
    setProfile((current) => ({ ...current, addresses: [...current.addresses, address] }));
    setNewAddress('');
  };

  return (
    <main className="min-h-screen bg-[#FAF7F2] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(199,101,45,0.08),rgba(250,247,242,0))] px-4 py-8 text-[#211814] sm:px-6 sm:py-12" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* Header Section */}
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between border-b border-[rgba(53,36,26,0.12)] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#C7652D] animate-pulse" />
              <p className="text-xs font-black tracking-wider text-[#C7652D] uppercase">كُومُر كُونافيه · KÖMÜR KÜNEFE</p>
            </div>
            <h1 className="mt-2 text-3xl font-black text-[#211814] sm:text-4xl">
              {isAdmin ? 'إعدادات المتجر والتشغيل' : 'إعدادات حسابي'}
            </h1>
            <p className="mt-2 text-sm text-[#75675C]">
              {isAdmin
                ? 'لوحة إدارة متجر رافدية: التحكم في ساعات العمل، استقبال الطلبات، الربط مع الأقسام وطاقم العمل.'
                : `أهلاً ${user.name}، يمكنك هنا تعديل بياناتك الشخصية، العناوين، وسجل طلبات الكنافة.`}
            </p>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#C7652D]/20 bg-[#F5ECE0] px-4 py-2 text-xs font-bold text-[#C7652D] shadow-sm">
                <ShieldCheck className="h-4 w-4 text-[#C7652D]" />
                صلاحيات المالك الكاملة
              </span>
            </div>
          )}
        </header>

        {isAdmin ? (
          <div className="space-y-8">

            {/* Top Navigation Tabs Bar */}
            <nav className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[rgba(53,36,26,0.1)] scrollbar-none" aria-label="أقسام الإدارة">
              <button
                type="button"
                onClick={() => setAdminActiveTab('general')}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 border ${adminActiveTab === 'general'
                    ? 'bg-[#C7652D] text-white border-[#C7652D] shadow-md shadow-[#C7652D]/20'
                    : 'bg-white text-[#75675C] border-[rgba(53,36,26,0.1)] hover:border-[#C7652D]/40 hover:text-[#211814]'
                  }`}
              >
                <Store className="h-4 w-4" />
                <span>إعدادات الفرع والتشغيل</span>
              </button>

              <button
                type="button"
                onClick={() => navigateToAdminTab('analytics')}
                className="group flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 border bg-white text-[#4A3B32] border-[rgba(53,36,26,0.1)] hover:border-[#C7652D]/40 hover:text-[#C7652D] hover:bg-[#FAF7F2]"
                title="الانتقال إلى الداشبورد الذكي والتقارير"
              >
                <BarChart3 className="h-4 w-4 text-[#C7652D] transition-transform group-hover:scale-110" />
                <span>الداشبورد الذكي والتقارير</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-[#9E8E81] group-hover:text-[#C7652D]" />
              </button>

              <button
                type="button"
                onClick={() => navigateToAdminTab('products')}
                className="group flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 border bg-white text-[#4A3B32] border-[rgba(53,36,26,0.1)] hover:border-[#C7652D]/40 hover:text-[#C7652D] hover:bg-[#FAF7F2]"
                title="الانتقال إلى إدارة المنيو والأسعار"
              >
                <Utensils className="h-4 w-4 text-[#C7652D] transition-transform group-hover:scale-110" />
                <span>المنيو والأسعار</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-[#9E8E81] group-hover:text-[#C7652D]" />
              </button>

              <button
                type="button"
                onClick={() => setAdminActiveTab('staff')}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 border ${adminActiveTab === 'staff'
                    ? 'bg-[#C7652D] text-white border-[#C7652D] shadow-md shadow-[#C7652D]/20'
                    : 'bg-white text-[#4A3B32] border-[rgba(53,36,26,0.1)] hover:border-[#C7652D]/40 hover:text-[#C7652D] hover:bg-[#FAF7F2]'
                  }`}
              >
                <Users className="h-4 w-4 text-[#C7652D]" />
                <span>إدارة طاقم العمل</span>
                <span className="rounded-full bg-[#DAB775]/20 px-2 py-0.5 text-[10px] font-bold text-[#8C6B28] border border-[#DAB775]/40">
                  قيد التطوير
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigateToAdminTab('orders')}
                className="group flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 border bg-white text-[#4A3B32] border-[rgba(53,36,26,0.1)] hover:border-[#C7652D]/40 hover:text-[#C7652D] hover:bg-[#FAF7F2]"
              >
                <ShoppingBag className="h-4 w-4 text-[#C7652D] transition-transform group-hover:scale-110" />
                <span>الطلبات الحية</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-[#9E8E81] group-hover:text-[#C7652D]" />
              </button>
            </nav>

            {/* TAB CONTENT: GENERAL SETTINGS */}
            {adminActiveTab === 'general' && (
              <div className="space-y-6">

                {/* Store Live Summary Cards */}
                <section className="grid gap-4 sm:grid-cols-3" aria-label="ملخص إحصائيات المتجر">
                  {[
                    { label: 'إجمالي الطلبات المسجلة', value: analytics?.totalOrders ?? '—', icon: ShoppingBag, color: 'text-[#C7652D]' },
                    { label: 'طلبات قيد التحضير والتجهيز', value: analytics?.activeOrders ?? '—', icon: PackageCheck, color: 'text-[#C7652D]' },
                    { label: 'إجمالي المبيعات المحصلة', value: analytics ? `${analytics.totalSales.toLocaleString()} ₪` : '—', icon: BarChart3, color: 'text-emerald-700' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="rounded-3xl border border-[rgba(53,36,26,0.1)] bg-white p-5 shadow-sm shadow-[#35241A]/5">
                      <div className="flex items-center justify-between">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5ECE0] text-[#C7652D] border border-[#C7652D]/20">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="text-[11px] font-semibold text-[#8C7D72]">بيانات حية</span>
                      </div>
                      <p className="mt-4 text-xs font-semibold text-[#75675C]">{label}</p>
                      <strong className={`mt-1 block text-2xl font-black ${color}`}>{value}</strong>
                    </div>
                  ))}
                </section>

                {/* Operations & Store Info Card */}
                {settingsForm && (
                  <section className={panelClass}>
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(53,36,26,0.1)] pb-5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5ECE0] text-[#C7652D] border border-[#C7652D]/20">
                          <Store className="h-6 w-6" />
                        </span>
                        <div>
                          <h2 className="text-xl font-black text-[#211814]">بيانات الفرع والتشغيل الميداني</h2>
                          <p className="mt-0.5 text-xs text-[#75675C]">التحكم في مواعيد العمل، التواصل، وحالة استقبال الطلبات للزبائن.</p>
                        </div>
                      </div>
                      <span className="text-xs text-[#75675C] bg-[#F5ECE0] px-3 py-1.5 rounded-xl border border-[rgba(53,36,26,0.1)] w-fit">
                        فرع رافدية - نابلس
                      </span>
                    </div>

                    {/* Store Open / Closed Switch */}
                    {/* (Backend) API Integration: PATCH /api/settings/status - Toggles isStoreOpen in database */}
                    <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-[rgba(53,36,26,0.1)] bg-[#FAF7F2] p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-bold text-[#211814]">استقبال الطلبات عبر المنصة</strong>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${settingsForm.isStoreOpen !== false
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                              : 'bg-rose-50 text-rose-700 border border-rose-300'
                            }`}>
                            {settingsForm.isStoreOpen !== false ? 'متاح للطلب الآن' : 'مغلق وموقف مؤقتاً'}
                          </span>
                        </div>
                        <p className="text-xs text-[#75675C]">
                          عند تعطيل هذا الخيار، سيظهر تنبيه لطيف للزبائن بأن المتجر مغلق ولن يتم استقبال طلبات جديدة.
                        </p>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={settingsForm.isStoreOpen !== false}
                        onClick={toggleStoreOpenStatus}
                        className={`relative h-9 w-16 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#C7652D]/40 ${settingsForm.isStoreOpen !== false
                            ? 'bg-[#C7652D] shadow-sm shadow-[#C7652D]/30'
                            : 'bg-slate-300'
                          }`}
                      >
                        <span
                          className={`absolute top-1.5 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-200 ${settingsForm.isStoreOpen !== false ? 'right-9' : 'right-1.5'
                            }`}
                        />
                      </button>
                    </div>

                    {/* Store Fields */}
                    {/* (Backend) API Integration: PUT /api/settings - Validates with Zod schema, updates store_settings table */}
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-[#4A3B32]">
                          اسم المحل التجاري
                        </label>
                        <input
                          className={inputClass}
                          value={settingsForm.storeName}
                          onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                          placeholder="كُومُر كُونافيه"
                        />
                        <span className="mt-1 block text-[11px] text-[#8C7D72]">الاسم المعروض في ترويسة الموقع وفواتير الطلب.</span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#4A3B32]">
                          الوصف التعريفي والشعار اللفظي
                        </label>
                        <input
                          className={inputClass}
                          value={settingsForm.tagline}
                          onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                          placeholder="كنافة تركية وفلسطينية أصيلة على جمر الفحم الطبيعي"
                        />
                        <span className="mt-1 block text-[11px] text-[#8C7D72]">يظهر تحت اسم المتجر في محركات البحث وبطاقات المشاركة.</span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#4A3B32]">
                          عنوان الفرع التفصيلي
                        </label>
                        <input
                          className={inputClass}
                          value={settingsForm.branch}
                          onChange={(e) => setSettingsForm({ ...settingsForm, branch: e.target.value })}
                          placeholder="شارع رافدية الرئيسي، بجانب مجمع الميدان، نابلس"
                        />
                        <span className="mt-1 block text-[11px] text-[#8C7D72]">عنوان استلام الطلبات والتوجيه للزبائن.</span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#4A3B32]">
                          أوقات وساعات العمل اليومية
                        </label>
                        <input
                          className={inputClass}
                          value={settingsForm.hours}
                          onChange={(e) => setSettingsForm({ ...settingsForm, hours: e.target.value })}
                          placeholder="يومياً من 12:00 ظهراً حتى 12:00 منتصف الليل"
                        />
                        <span className="mt-1 block text-[11px] text-[#8C7D72]">تظهر في أسفل الموقع وصفحة معلومات التواصل.</span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#4A3B32]">
                          رقم هاتف المحل للاتصال المباشر
                        </label>
                        <input
                          className={inputClass}
                          dir="ltr"
                          value={settingsForm.phone}
                          onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                          placeholder="+970 59 900 0000"
                        />
                        <span className="mt-1 block text-[11px] text-[#8C7D72]">رقم الاستفسارات المباشرة للزبائن.</span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#4A3B32]">
                          رقم الواتساب لاستقبال الاستفسارات والطلبات
                        </label>
                        <input
                          className={inputClass}
                          dir="ltr"
                          value={settingsForm.whatsapp}
                          onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                          placeholder="0599000000"
                        />
                        <span className="mt-1 block text-[11px] text-[#8C7D72]">لإنشاء رابط محادثة واتساب سريعة بنقرة زر.</span>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="mt-7 flex flex-wrap items-center gap-4 border-t border-[rgba(53,36,26,0.1)] pt-5">
                      <button
                        type="button"
                        onClick={saveStoreSettings}
                        disabled={savingSettings}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#C7652D] px-6 py-3 text-sm font-black text-white shadow-md shadow-[#C7652D]/20 transition-all duration-200 hover:bg-[#A94E20] active:scale-[0.98] disabled:opacity-60"
                      >
                        <Save className="h-4 w-4" />
                        {savingSettings ? 'جارٍ حفظ الإعدادات…' : 'حفظ إعدادات الفرع'}
                      </button>

                      {settingsMessage && (
                        <span role="status" className="flex items-center gap-1.5 text-xs font-bold text-[#C7652D]">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          {settingsMessage}
                        </span>
                      )}
                    </div>
                  </section>
                )}

                {/* Direct Action Hub / Quick Navigation Cards */}
                <section className="grid gap-5 md:grid-cols-3" aria-label="روابط سريعة لأقسام الإدارة">

                  {/* Link to Menu & Pricing */}
                  <button
                    type="button"
                    onClick={() => navigateToAdminTab('products')}
                    className="group flex flex-col justify-between rounded-3xl border border-[rgba(53,36,26,0.1)] bg-white p-6 text-right transition-all duration-200 hover:border-[#C7652D]/50 hover:bg-[#FAF7F2] hover:shadow-md hover:shadow-[#C7652D]/10"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5ECE0] text-[#C7652D] border border-[#C7652D]/20 transition-transform group-hover:scale-110">
                          <Utensils className="h-6 w-6" />
                        </span>
                        <ArrowUpRight className="h-5 w-5 text-[#9E8E81] transition-colors group-hover:text-[#C7652D]" />
                      </div>
                      <h3 className="mt-4 text-base font-black text-[#211814]">إدارة المنيو والأسعار</h3>
                      <p className="mt-1 text-xs text-[#75675C] leading-relaxed">
                        تعديل أسعار الكنافة، إضافة أحجام جديدة، تفعيل أو إيقاف توفر الأصناف في رافدية.
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-[rgba(53,36,26,0.1)] pt-3 text-xs font-bold text-[#C7652D]">
                      <span>{products.length} صنف مسجل في القائمة</span>
                      <span className="group-hover:translate-x-1 transition-transform">فتح المنيو ←</span>
                    </div>
                  </button>

                  {/* Link to Smart Dashboard / Analytics & Reports */}
                  <button
                    type="button"
                    onClick={() => navigateToAdminTab('analytics')}
                    className="group flex flex-col justify-between rounded-3xl border border-[rgba(53,36,26,0.1)] bg-white p-6 text-right transition-all duration-200 hover:border-[#C7652D]/50 hover:bg-[#FAF7F2] hover:shadow-md hover:shadow-[#C7652D]/10"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5ECE0] text-[#C7652D] border border-[#C7652D]/20 transition-transform group-hover:scale-110">
                          <BarChart3 className="h-6 w-6" />
                        </span>
                        <ArrowUpRight className="h-5 w-5 text-[#9E8E81] transition-colors group-hover:text-[#C7652D]" />
                      </div>
                      <h3 className="mt-4 text-base font-black text-[#211814]">الداشبورد الذكي والتقارير</h3>
                      <p className="mt-1 text-xs text-[#75675C] leading-relaxed">
                        متابعة المبيعات اليومية، أوقات الذروة في رافدية، وتحليل الأصناف الأكثر طلباً ومصادر الزبائن.
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-[rgba(53,36,26,0.1)] pt-3 text-xs font-bold text-[#C7652D]">
                      <span>تحليلات ورسوم بيانية مباشرة</span>
                      <span className="group-hover:translate-x-1 transition-transform">عرض التقارير ←</span>
                    </div>
                  </button>

                  {/* Link to Staff Management */}
                  <button
                    type="button"
                    onClick={() => setAdminActiveTab('staff')}
                    className="group flex flex-col justify-between rounded-3xl border border-[rgba(53,36,26,0.1)] bg-white p-6 text-right transition-all duration-200 hover:border-[#C7652D]/50 hover:bg-[#FAF7F2] hover:shadow-md hover:shadow-[#C7652D]/10"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5ECE0] text-[#C7652D] border border-[#C7652D]/20 transition-transform group-hover:scale-110">
                          <Users className="h-6 w-6" />
                        </span>
                        <span className="rounded-full bg-[#DAB775]/20 px-2 py-0.5 text-[10px] font-bold text-[#8C6B28] border border-[#DAB775]/40">
                          قيد التطوير
                        </span>
                      </div>
                      <h3 className="mt-4 text-base font-black text-[#211814]">إدارة طاقم العمل والصلاحيات</h3>
                      <p className="mt-1 text-xs text-[#75675C] leading-relaxed">
                        تحديد صلاحيات كاشير الكاونتر، مشرفي الورديات، والشيف المسؤول عن شاشات التحضير.
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-[rgba(53,36,26,0.1)] pt-3 text-xs font-bold text-[#C7652D]">
                      <span>عرض تفاصيل التطوير والتجهيز</span>
                      <span className="group-hover:translate-x-1 transition-transform">استعراض الواجهة ←</span>
                    </div>
                  </button>
                </section>

                {/* Open Full Dashboard Banner */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-[#C7652D]/25 bg-gradient-to-r from-[#F5ECE0] via-[#FAF7F2] to-white p-6 shadow-sm">
                  <div>
                    <h3 className="text-base font-bold text-[#211814]">لوحة الإدارة الشاملة (Admin Portal)</h3>
                    <p className="mt-1 text-xs text-[#75675C]">
                      الوصول لجميع أقسام كُومُر: الطلبات المباشرة، العروض، مساعد الذكاء الاصطناعي، وطباعة الفواتير.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('admin')}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#C7652D]/40 bg-[#C7652D] px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#A94E20]"
                  >
                    <span>فتح لوحة الإدارة الكاملة</span>
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: STAFF MANAGEMENT (DEDICATED UNDER DEVELOPMENT INTERFACE) */}
            {adminActiveTab === 'staff' && (
              <section className="space-y-6" aria-label="إدارة طاقم العمل">

                {/* Under Development Status Alert Card */}
                <div className="rounded-3xl border border-[#DAB775]/40 bg-gradient-to-br from-[#FAF5EC] via-[#F5ECE0] to-white p-6 sm:p-8 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#DAB775]/20 text-[#8C6B28] border border-[#DAB775]/40">
                        <Wrench className="h-6 w-6" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-black text-[#211814]">إدارة طاقم العمل والصلاحيات</h2>
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#DAB775]/20 border border-[#DAB775]/50 px-2.5 py-0.5 text-xs font-black text-[#8C6B28]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#C7652D] animate-ping" />
                            ميزة قيد التطوير والتجهيز
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[#75675C]">
                          نظام إدارة الطاقم قيد التطوير حالياً لربطه مع قاعدة البيانات وصلاحيات الوصول المخصصة (RBAC).
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAdminActiveTab('general')}
                      className="inline-flex items-center gap-2 rounded-xl border border-[rgba(53,36,26,0.15)] bg-white px-4 py-2.5 text-xs font-bold text-[#4A3B32] hover:text-[#C7652D] hover:border-[#C7652D]/40 transition-colors w-fit"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      العودة للإعدادات العامة
                    </button>
                  </div>
                </div>

                {/* Mock Roster Preview Card */}
                <div className={panelClass}>
                  <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(53,36,26,0.1)] pb-5">
                    <div>
                      <h3 className="text-lg font-black text-[#211814]">معاينة واجهة أعضاء الفريق والورديات</h3>
                      <p className="mt-1 text-xs text-[#75675C]">هيكل الصلاحيات المقترح لطاقم متجر كُومُر في رافدية.</p>
                    </div>

                    {/* Disabled action button with note */}
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center gap-2 rounded-xl bg-[#C7652D]/15 border border-[#C7652D]/30 px-4 py-2.5 text-xs font-bold text-[#C7652D] cursor-not-allowed opacity-80"
                      title="الميزة قيد التطوير وستفعل بعد اكتمال واجهات الـ Backend"
                    >
                      <Plus className="h-4 w-4" />
                      إضافة موظف جديد (قريباً)
                    </button>
                  </div>

                  {/* Staff List Preview */}
                  <div className="space-y-3">
                    {[
                      {
                        name: 'أحمد الشريف',
                        role: 'مدير الفرع (Store Manager)',
                        permissions: 'كامل صلاحيات الإدارة، التقارير، والأسعار',
                        status: 'نشط الآن',
                        statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-300',
                        phone: '059 912 3456',
                      },
                      {
                        name: 'سامي ناصر',
                        role: 'مشرف وردية مسائية (Shift Supervisor)',
                        permissions: 'إدارة الطلبات الحية، تعديل توفر الأصناف',
                        status: 'نشط',
                        statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-300',
                        phone: '059 876 5432',
                      },
                      {
                        name: 'إياد كنعان',
                        role: 'كاشير ومسؤول كاونتر (Cashier)',
                        permissions: 'استلام الطلبات، طباعة الإيصالات، تحصيل الدفعات',
                        status: 'غير متصل',
                        statusColor: 'text-slate-600 bg-slate-100 border-slate-200',
                        phone: '056 901 2345',
                      },
                      {
                        name: 'أبو عمر النتشة',
                        role: 'شيف كنافة رئيسي (Master Chef)',
                        permissions: 'شاشة المطبخ والتحضير (KDS) فقط',
                        status: 'في الوردية',
                        statusColor: 'text-amber-800 bg-amber-50 border-amber-300',
                        phone: '059 555 4433',
                      },
                    ].map((member) => (
                      <div
                        key={member.name}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[rgba(53,36,26,0.1)] bg-[#FAF7F2] p-4 transition-all hover:border-[#C7652D]/40"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F5ECE0] text-[#C7652D] border border-[#C7652D]/20 font-bold">
                            {member.name.slice(0, 1)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <strong className="text-sm font-bold text-[#211814]">{member.name}</strong>
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${member.statusColor}`}>
                                {member.status}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs text-[#C7652D] font-bold">{member.role}</p>
                            <p className="text-[11px] text-[#75675C]">الصلاحيات: {member.permissions}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-[#75675C]">
                          <span className="font-mono text-[#4A3B32] dir-ltr">{member.phone}</span>
                          <span className="rounded-lg bg-white px-2.5 py-1 text-[11px] text-[#75675C] border border-[rgba(53,36,26,0.1)]">
                            عرض فقط
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* (Backend) API Requirements & Architecture Guide Box */}
                <div className="rounded-3xl border border-[#C7652D]/20 bg-white p-6 sm:p-7 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-black text-[#C7652D]">
                    <Layers className="h-5 w-5" />
                    <span>متطلبات الربط البرمجي وقاعدة البيانات (Backend / API Specifications)</span>
                  </div>
                  <p className="mt-2 text-xs text-[#75675C] leading-relaxed">
                    لتفعيل نظام إدارة الموظفين بالكامل، سيتطلب ذلك ربط واجهات برمجة التطبيقات (RESTful API أو GraphQL) التالية مع خادم الـ Node.js / Express وقاعدة البيانات:
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs font-mono text-[#211814]">
                    <div className="rounded-xl border border-[rgba(53,36,26,0.1)] bg-[#FAF7F2] p-3.5">
                      <strong className="block text-emerald-700 font-sans font-bold mb-1">
                        1. جلب قائمة الموظفين (GET /api/staff)
                      </strong>
                      <p className="font-sans text-[#75675C] text-[11px]">
                        استرجاع سجلات الموظفين، الأدوار (Roles)، الورديات النشطة، وسجل آخر تسجيل دخول.
                      </p>
                    </div>

                    <div className="rounded-xl border border-[rgba(53,36,26,0.1)] bg-[#FAF7F2] p-3.5">
                      <strong className="block text-amber-800 font-sans font-bold mb-1">
                        2. تسجيل موظف جديد (POST /api/staff)
                      </strong>
                      <p className="font-sans text-[#75675C] text-[11px]">
                        تشفير كلمة المرور أو رمز الـ PIN باستخدام bcrypt، وتعيين الفرع والدور الوظيفي.
                      </p>
                    </div>

                    <div className="rounded-xl border border-[rgba(53,36,26,0.1)] bg-[#FAF7F2] p-3.5">
                      <strong className="block text-[#C7652D] font-sans font-bold mb-1">
                        3. إدارة الصلاحيات (PUT /api/staff/:id/permissions)
                      </strong>
                      <p className="font-sans text-[#75675C] text-[11px]">
                        تحديث مصفوفة الصلاحيات (canEditMenu, canViewAnalytics, canManageOrders).
                      </p>
                    </div>

                    <div className="rounded-xl border border-[rgba(53,36,26,0.1)] bg-[#FAF7F2] p-3.5">
                      <strong className="block text-rose-700 font-sans font-bold mb-1">
                        4. إيقاف أو حذف حساب (DELETE /api/staff/:id)
                      </strong>
                      <p className="font-sans text-[#75675C] text-[11px]">
                        تعطيل وصول الموظف فوريًا وإلغاء جميع الـ JWT sessions النشطة له.
                      </p>
                    </div>
                  </div>
                </div>

              </section>
            )}

          </div>
        ) : (
          /* Customer Profile & Settings View (Warm Creamy Theme) */
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,.72fr)]">

            <div className="space-y-6">

              {/* Personal Information */}
              <section className={panelClass}>
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5ECE0] text-[#C7652D] border border-[#C7652D]/20">
                    <UserRound className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-black text-[#211814]">المعلومات الشخصية</h2>
                    <p className="mt-0.5 text-xs text-[#75675C]">بيانات التواصل والاسم الخاص بحسابك في كُومُر.</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-xs font-bold text-[#4A3B32]">
                    الاسم الكامل
                    <input
                      className={inputClass}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                    />
                  </label>

                  <label className="text-xs font-bold text-[#4A3B32]">
                    البريد الإلكتروني
                    <input
                      className={inputClass}
                      type="email"
                      dir="ltr"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </label>

                  <label className="text-xs font-bold text-[#4A3B32] sm:col-span-2">
                    رقم الهاتف المحمول (لتتبع الطلبات)
                    <input
                      className={inputClass}
                      type="tel"
                      dir="ltr"
                      placeholder="05X XXX XXXX"
                      value={profile.phone}
                      onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
                    />
                  </label>
                </div>

                {/* (Backend) API Integration: PUT /api/users/profile */}
                <button
                  type="button"
                  onClick={saveCustomerProfile}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#C7652D] px-5 py-3 text-sm font-black text-white shadow-sm shadow-[#C7652D]/20 transition-all hover:bg-[#A94E20] active:scale-[0.98]"
                >
                  <Save className="h-4 w-4" />
                  حفظ البيانات الشخصية
                </button>
                {profileMessage && <p role="status" className="mt-3 text-xs font-bold text-[#C7652D]">{profileMessage}</p>}
              </section>

              {/* Address Book */}
              <section className={panelClass}>
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5ECE0] text-[#C7652D] border border-[#C7652D]/20">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-black text-[#211814]">دفتر العناوين المحفوظة</h2>
                    <p className="mt-0.5 text-xs text-[#75675C]">احفظ عناوين منزلك أو عملك في نابلس لتسهيل الطلب السريع.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {profile.addresses.map((address, index) => (
                    <div
                      key={`${address}-${index}`}
                      className="flex items-center gap-3 rounded-xl border border-[rgba(53,36,26,0.1)] bg-[#FAF7F2] px-4 py-3 transition-colors hover:border-[#C7652D]/40"
                    >
                      <MapPin className="h-4 w-4 shrink-0 text-[#C7652D]" />
                      <span className="flex-1 text-sm text-[#211814]">{address}</span>
                      <button
                        type="button"
                        onClick={() => setProfile({ ...profile, addresses: profile.addresses.filter((_, itemIndex) => itemIndex !== index) })}
                        className="rounded-lg p-2 text-[#9E8E81] hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        aria-label="حذف العنوان"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex gap-2">
                  <input
                    className={`${inputClass} mt-0`}
                    placeholder="مثال: رفيديا - شارع الجامعة - عمارة الشروق ط3"
                    value={newAddress}
                    onChange={(event) => setNewAddress(event.target.value)}
                    onKeyDown={(event) => { if (event.key === 'Enter') addAddress(); }}
                  />
                  <button
                    type="button"
                    onClick={addAddress}
                    className="shrink-0 rounded-xl border border-[#C7652D]/30 bg-[#F5ECE0] px-4 text-[#C7652D] hover:bg-[#C7652D] hover:text-white transition-all"
                    aria-label="إضافة عنوان"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>

                {/* (Backend) API Integration: POST /api/users/addresses */}
                <button
                  type="button"
                  onClick={savePreferences}
                  className="mt-4 text-xs font-bold text-[#C7652D] hover:text-[#A94E20] transition-colors"
                >
                  حفظ دفتر العناوين
                </button>
              </section>

              {/* Order History */}
              <section className={panelClass}>
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5ECE0] text-[#C7652D] border border-[#C7652D]/20">
                    <ShoppingBag className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-black text-[#211814]">سجل طلبات الكنافة</h2>
                    <p className="mt-0.5 text-xs text-[#75675C]">الطلبات المرتبطة برقم هاتفك أو حسابك المسجل.</p>
                  </div>
                </div>

                {orders.length ? (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex flex-col gap-3 rounded-2xl border border-[rgba(53,36,26,0.1)] bg-[#FAF7F2] p-4 sm:flex-row sm:items-center sm:justify-between transition-colors hover:border-[#C7652D]/40"
                      >
                        <div>
                          <strong className="text-sm font-bold text-[#211814]">طلب رقم {order.orderNumber}</strong>
                          <p className="mt-1 text-xs text-[#75675C]">
                            {new Date(order.createdAt).toLocaleDateString('ar')} · {order.items.length} أصناف
                          </p>
                          <span className="mt-2 inline-flex rounded-full bg-[#F5ECE0] border border-[#C7652D]/20 px-2.5 py-1 text-[10px] font-bold text-[#C7652D]">
                            {ORDER_STATUS_LABELS[order.status]}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-base font-black text-[#C7652D]">{order.total} ₪</span>
                          <button
                            type="button"
                            onClick={() => onNavigate('track')}
                            className="rounded-xl border border-[#C7652D]/30 bg-[#F5ECE0] px-3.5 py-2 text-xs font-bold text-[#C7652D] hover:bg-[#C7652D] hover:text-white transition-all"
                          >
                            {order.status === 'completed' ? 'عرض الفاتورة' : 'تتبع الطلب'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[rgba(53,36,26,0.18)] bg-[#FAF7F2]/60 px-4 py-8 text-center">
                    <PackageCheck className="mx-auto h-8 w-8 text-[#9E8E81]" />
                    <p className="mt-3 text-sm font-bold text-[#4A3B32]">لا توجد طلبات سابقة مرتبطة بحسابك بعد</p>
                    <button
                      type="button"
                      onClick={() => onNavigate('menu')}
                      className="mt-3 text-xs font-black text-[#C7652D] hover:text-[#A94E20] transition-colors"
                    >
                      تصفح المنيو واطلب الآن ←
                    </button>
                  </div>
                )}

                {openOrders.length > 0 && (
                  <p className="mt-4 flex items-center gap-2 text-xs font-bold text-[#C7652D]">
                    <Clock3 className="h-4 w-4" />
                    لديك {openOrders.length} طلبات قيد التجهيز أو الاستلام في الفرع.
                  </p>
                )}
              </section>

            </div>

            {/* Sidebar */}
            <aside className="space-y-6">

              {/* Dietary Preferences */}
              <section className={panelClass}>
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5ECE0] text-[#C7652D] border border-[#C7652D]/20">
                    <Utensils className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-black text-[#211814]">التفضيلات الغذائية</h2>
                    <p className="mt-0.5 text-xs text-[#75675C]">ملاحظات مخصصة تهم شيف التحضير.</p>
                  </div>
                </div>

                <label className="text-xs font-bold text-[#4A3B32]">
                  القطر الصحي أو الإضافات المفضلة
                  <textarea
                    className={`${inputClass} min-h-28 resize-y`}
                    placeholder="مثال: قطر صحي خفيف، فستق حلبي إضافي، جبنة زيادة، بدون قطر..."
                    value={profile.dietaryNotes}
                    onChange={(event) => setProfile({ ...profile, dietaryNotes: event.target.value })}
                  />
                </label>
                <p className="mt-2 text-[11px] leading-5 text-[#8C7D72]">
                  تطبق هذه الملاحظات تلقائياً عند طلبك من الموقع.
                </p>

                {/* (Backend) API Integration: PUT /api/users/preferences */}
                <button
                  type="button"
                  onClick={savePreferences}
                  className="mt-4 rounded-xl border border-[#C7652D]/30 bg-[#F5ECE0] px-4 py-2.5 text-xs font-black text-[#C7652D] hover:bg-[#C7652D] hover:text-white transition-all"
                >
                  حفظ التفضيلات
                </button>
              </section>

              {/* Security & Password */}
              <section className={panelClass}>
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5ECE0] text-[#C7652D] border border-[#C7652D]/20">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-black text-[#211814]">أمان الحساب</h2>
                    <p className="mt-0.5 text-xs text-[#75675C]">تحديث كلمة مرور حسابك.</p>
                  </div>
                </div>

                <label className="block text-xs font-bold text-[#4A3B32]">
                  كلمة المرور الحالية
                  <input
                    className={inputClass}
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                  />
                </label>

                <label className="mt-4 block text-xs font-bold text-[#4A3B32]">
                  كلمة المرور الجديدة
                  <input
                    className={inputClass}
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                  />
                </label>

                {/* (Backend) API Integration: POST /api/auth/change-password */}
                <button
                  type="button"
                  onClick={submitPasswordChange}
                  className="mt-5 w-full rounded-xl bg-[#C7652D] px-4 py-3 text-sm font-black text-white shadow-sm shadow-[#C7652D]/20 transition-all hover:bg-[#A94E20] active:scale-[0.98]"
                >
                  تغيير كلمة المرور
                </button>
                {passwordMessage && <p role="status" className="mt-3 text-xs font-bold text-[#C7652D]">{passwordMessage}</p>}
              </section>

              {/* Local Storage & Security Note */}
              <div className="rounded-2xl border border-[rgba(53,36,26,0.1)] bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#C7652D] shrink-0 mt-0.5" />
                  <p className="text-xs leading-6 text-[#75675C]">
                    نحفظ تفضيلاتك وعناوينك في جلسة آمنة لتوفير تجربة طلب سريعة وسلسة لكنافة كُومُر في كل مرة.
                  </p>
                </div>
              </div>

            </aside>
          </div>
        )}

      </div>
    </main>
  );
};
