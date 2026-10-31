import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, BarChart3, Check, Clock3, MapPin, PackageCheck, Plus, Save,
  ShieldCheck, ShoppingBag, Store, Trash2, UserRound, Users, Utensils,
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
  } catch {}
  return { phone, addresses: [], dietaryNotes: '' };
};

const panelClass = 'rounded-3xl border border-[rgba(255,123,0,0.16)] bg-[#1a1614] p-5 shadow-xl shadow-black/10 sm:p-7';
const inputClass = 'mt-2 w-full rounded-xl border border-white/10 bg-[#14110f] px-4 py-3 text-sm text-[#F7F0E5] outline-none transition placeholder:text-[#75675c] focus:border-[#ff7b00]/60 focus:ring-2 focus:ring-[#ff7b00]/10';
const ORDER_STATUS_LABELS: Record<Order['status'], string> = {
  new: 'تم الاستلام', preparing: 'قيد التحضير', ready: 'جاهز للاستلام', completed: 'مكتمل', cancelled: 'ملغي',
};

export const AccountSettingsPage: React.FC<AccountSettingsPageProps> = ({
  user, isAdmin, settings, products, onNavigate, onSaveSettings,
}) => {
  const { updateProfile, changePassword } = useAuth();
  const [profile, setProfile] = useState(() => loadProfile(user.email, user.phone));
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [newAddress, setNewAddress] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');
  const [settingsForm, setSettingsForm] = useState<StoreSettings | null>(settings);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<{ totalSales: number; totalOrders: number; activeOrders: number } | null>(null);

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setProfile(loadProfile(user.email, user.phone));
  }, [user.email, user.name, user.phone]);

  useEffect(() => setSettingsForm(settings), [settings]);

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

  const saveCustomerProfile = () => {
    const result = updateProfile({ name, email, phone: profile.phone.trim() });
    if (!result.ok) {
      setProfileMessage(result.error || 'تعذر حفظ البيانات.');
      return;
    }
    try { localStorage.setItem(profileKey(email), JSON.stringify(profile)); } catch {}
    setProfileMessage('تم حفظ معلومات الحساب بنجاح.');
  };

  const savePreferences = () => {
    try {
      localStorage.setItem(profileKey(user.email), JSON.stringify(profile));
      setProfileMessage('تم حفظ العناوين والتفضيلات.');
    } catch {
      setProfileMessage('تعذر الحفظ على هذا الجهاز.');
    }
  };

  const submitPasswordChange = () => {
    const result = changePassword(currentPassword, newPassword);
    setPasswordMessage(result.ok ? 'تم تغيير كلمة المرور.' : result.error || 'تعذر تغيير كلمة المرور.');
    if (result.ok) { setCurrentPassword(''); setNewPassword(''); }
  };

  const saveStoreSettings = async () => {
    if (!settingsForm) return;
    setSavingSettings(true);
    setSettingsMessage('');
    try {
      await onSaveSettings(settingsForm);
      setSettingsMessage('تم حفظ إعدادات الفرع.');
    } catch {
      setSettingsMessage('تعذر الحفظ. حاول مرة أخرى.');
    } finally {
      setSavingSettings(false);
    }
  };

  const addAddress = () => {
    const address = newAddress.trim();
    if (!address) return;
    setProfile((current) => ({ ...current, addresses: [...current.addresses, address] }));
    setNewAddress('');
  };

  return (
    <main className="min-h-screen bg-[#14110f] px-4 py-8 text-[#F7F0E5] sm:px-6 sm:py-12" dir="rtl">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black tracking-wide text-[#ff9a2f]">كُومُر كُونافيه · الحساب</p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">{isAdmin ? 'إعدادات المحل' : 'إعدادات حسابي'}</h1>
            <p className="mt-2 text-sm text-[#a99b90]">{isAdmin ? 'إدارة الفرع ومتابعة أداء المتجر من مكان واحد.' : `أهلاً ${user.name}، حدّث بياناتك وتابع طلباتك.`}</p>
          </div>
          {isAdmin && <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#ff7b00]/25 bg-[#ff7b00]/10 px-4 py-2 text-xs font-black text-[#ff9a2f]"><ShieldCheck className="h-4 w-4" /> حساب المالك</span>}
        </header>

        {isAdmin ? (
          <div className="space-y-6">
            <section className="grid gap-4 sm:grid-cols-3" aria-label="ملخص المتجر">
              {[
                { label: 'إجمالي الطلبات', value: analytics?.totalOrders ?? '—', icon: ShoppingBag },
                { label: 'طلبات قيد التنفيذ', value: analytics?.activeOrders ?? '—', icon: PackageCheck },
                { label: 'المبيعات المدفوعة', value: analytics ? `${analytics.totalSales} ₪` : '—', icon: BarChart3 },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-2xl border border-[rgba(255,123,0,0.15)] bg-[#221d19] p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff7b00]/10 text-[#ff9a2f]"><Icon className="h-5 w-5" /></span>
                  <p className="mt-4 text-xs text-[#a99b90]">{label}</p>
                  <strong className="mt-1 block text-2xl font-black">{value}</strong>
                </div>
              ))}
            </section>

            {settingsForm && <section className={panelClass}>
              <div className="mb-6 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ff7b00]/10 text-[#ff9a2f]"><Store className="h-5 w-5" /></span><div><h2 className="text-lg font-black">الفرع والتشغيل</h2><p className="mt-1 text-xs text-[#a99b90]">معلومات التواصل وحالة استقبال الطلبات.</p></div></div>
              <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#221d19] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div><strong className="text-sm">استقبال الطلبات</strong><p className="mt-1 text-xs text-[#a99b90]">عطّل الاستقبال مؤقتاً عند إغلاق الفرع.</p></div>
                <button type="button" role="switch" aria-checked={settingsForm.isStoreOpen !== false} onClick={() => setSettingsForm({ ...settingsForm, isStoreOpen: settingsForm.isStoreOpen === false })} className={`relative h-8 w-14 rounded-full transition ${settingsForm.isStoreOpen === false ? 'bg-white/15' : 'bg-[#ff7b00]'}`}><span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${settingsForm.isStoreOpen === false ? 'right-1' : 'right-7'}`} /></button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {([
                  ['storeName', 'اسم المحل'], ['tagline', 'وصف المحل'], ['branch', 'عنوان الفرع'], ['hours', 'أوقات العمل'], ['phone', 'رقم الهاتف'], ['whatsapp', 'واتساب'],
                ] as const).map(([key, label]) => <label key={key} className="block text-xs font-bold text-[#c7b9ae]">{label}<input className={inputClass} value={settingsForm[key]} onChange={(event) => setSettingsForm({ ...settingsForm, [key]: event.target.value })} /></label>)}
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3"><button type="button" onClick={saveStoreSettings} disabled={savingSettings} className="inline-flex items-center gap-2 rounded-xl bg-[#ff7b00] px-5 py-3 text-sm font-black text-white transition hover:bg-[#ea6a00] disabled:opacity-60"><Save className="h-4 w-4" />{savingSettings ? 'جارٍ الحفظ…' : 'حفظ الإعدادات'}</button>{settingsMessage && <span role="status" className="text-xs text-[#ffbd73]">{settingsMessage}</span>}</div>
            </section>}

            <section className="grid gap-4 md:grid-cols-3">
              {[
                { title: 'المنيو والأسعار', detail: `${products.length} صنف في القائمة`, icon: Utensils },
                { title: 'التحليلات والتقارير', detail: 'المبيعات والطلبات ومصادرها', icon: BarChart3 },
                { title: 'دخول الموظفين', detail: 'لوحة المالك وموظف الكاونتر', icon: Users },
              ].map(({ title, detail, icon: Icon }) => <button key={title} type="button" onClick={() => onNavigate('admin')} className="group flex items-center gap-4 rounded-2xl border border-[rgba(255,123,0,0.15)] bg-[#221d19] p-5 text-right transition hover:border-[#ff7b00]/50 hover:bg-[#26201b]"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ff7b00]/10 text-[#ff9a2f]"><Icon className="h-5 w-5" /></span><span className="min-w-0 flex-1"><strong className="block text-sm font-black">{title}</strong><small className="mt-1 block text-xs text-[#a99b90]">{detail}</small></span><ArrowLeft className="h-4 w-4 text-[#8d7e73] transition group-hover:text-[#ff9a2f]" /></button>)}
            </section>
            <button type="button" onClick={() => onNavigate('admin')} className="inline-flex items-center gap-2 rounded-xl border border-[#ff7b00]/30 px-4 py-3 text-sm font-bold text-[#ff9a2f] transition hover:bg-[#ff7b00]/10">فتح لوحة الإدارة الكاملة <ArrowLeft className="h-4 w-4" /></button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,.72fr)]">
            <div className="space-y-6">
              <section className={panelClass}>
                <div className="mb-5 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff7b00]/10 text-[#ff9a2f]"><UserRound className="h-5 w-5" /></span><div><h2 className="font-black">المعلومات الشخصية</h2><p className="mt-1 text-xs text-[#a99b90]">بيانات التواصل لحسابك.</p></div></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-xs font-bold text-[#c7b9ae]">الاسم<input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} /></label>
                  <label className="text-xs font-bold text-[#c7b9ae]">البريد الإلكتروني<input className={inputClass} type="email" dir="ltr" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
                  <label className="text-xs font-bold text-[#c7b9ae] sm:col-span-2">رقم الهاتف<input className={inputClass} type="tel" dir="ltr" placeholder="05X XXX XXXX" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} /></label>
                </div>
                <button type="button" onClick={saveCustomerProfile} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#ff7b00] px-5 py-3 text-sm font-black text-white transition hover:bg-[#ea6a00]"><Save className="h-4 w-4" /> حفظ البيانات</button>
                {profileMessage && <p role="status" className="mt-3 text-xs text-[#ffbd73]">{profileMessage}</p>}
              </section>

              <section className={panelClass}>
                <div className="mb-5 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff7b00]/10 text-[#ff9a2f]"><MapPin className="h-5 w-5" /></span><div><h2 className="font-black">دفتر العناوين</h2><p className="mt-1 text-xs text-[#a99b90]">احفظ عناوينك لاستخدامها لاحقاً.</p></div></div>
                <div className="space-y-2">{profile.addresses.map((address, index) => <div key={`${address}-${index}`} className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#221d19] px-4 py-3"><MapPin className="h-4 w-4 shrink-0 text-[#ff9a2f]" /><span className="flex-1 text-sm">{address}</span><button type="button" onClick={() => setProfile({ ...profile, addresses: profile.addresses.filter((_, itemIndex) => itemIndex !== index) })} className="rounded-lg p-2 text-[#a99b90] hover:bg-red-500/10 hover:text-red-400" aria-label="حذف العنوان"><Trash2 className="h-4 w-4" /></button></div>)}</div>
                <div className="mt-3 flex gap-2"><input className={`${inputClass} mt-0`} placeholder="أدخل عنواناً جديداً" value={newAddress} onChange={(event) => setNewAddress(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') addAddress(); }} /><button type="button" onClick={addAddress} className="shrink-0 rounded-xl border border-[#ff7b00]/30 px-4 text-[#ff9a2f] hover:bg-[#ff7b00]/10" aria-label="إضافة عنوان"><Plus className="h-5 w-5" /></button></div>
                <button type="button" onClick={savePreferences} className="mt-4 text-xs font-bold text-[#ff9a2f] hover:text-[#ffc078]">حفظ دفتر العناوين</button>
              </section>

              <section className={panelClass}>
                <div className="mb-5 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff7b00]/10 text-[#ff9a2f]"><ShoppingBag className="h-5 w-5" /></span><div><h2 className="font-black">سجل الطلبات</h2><p className="mt-1 text-xs text-[#a99b90]">الطلبات المرتبطة برقم هاتفك أو اسم حسابك.</p></div></div>
                {orders.length ? <div className="space-y-3">{orders.map((order) => <div key={order.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#221d19] p-4 sm:flex-row sm:items-center sm:justify-between"><div><strong className="text-sm">طلب {order.orderNumber}</strong><p className="mt-1 text-xs text-[#a99b90]">{new Date(order.createdAt).toLocaleDateString('ar')} · {order.items.length} أصناف</p><span className="mt-2 inline-flex rounded-full bg-[#ff7b00]/10 px-2.5 py-1 text-[10px] font-bold text-[#ffbd73]">{ORDER_STATUS_LABELS[order.status]}</span></div><div className="flex items-center gap-3"><span className="text-sm font-black text-[#ff9a2f]">{order.total} ₪</span><button type="button" onClick={() => onNavigate('track')} className="rounded-lg border border-[#ff7b00]/25 px-3 py-2 text-xs font-bold text-[#ff9a2f] hover:bg-[#ff7b00]/10">{order.status === 'completed' ? 'عرض الحالة' : 'تتبع الطلب'}</button></div></div>)}</div> : <div className="rounded-2xl border border-dashed border-white/10 bg-[#221d19]/60 px-4 py-8 text-center"><PackageCheck className="mx-auto h-7 w-7 text-[#8d7e73]" /><p className="mt-3 text-sm font-bold">لا توجد طلبات مرتبطة بحسابك بعد</p><button type="button" onClick={() => onNavigate('menu')} className="mt-3 text-xs font-black text-[#ff9a2f]">تصفح المنيو</button></div>}
                {openOrders.length > 0 && <p className="mt-4 flex items-center gap-2 text-xs text-[#ffbd73]"><Clock3 className="h-4 w-4" /> لديك {openOrders.length} طلبات قيد التجهيز أو الاستلام.</p>}
              </section>
            </div>

            <aside className="space-y-6">
              <section className={panelClass}>
                <div className="mb-4 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff7b00]/10 text-[#ff9a2f]"><Utensils className="h-5 w-5" /></span><div><h2 className="font-black">التفضيلات الغذائية</h2><p className="mt-1 text-xs text-[#a99b90]">ملاحظات تهم فريق التحضير.</p></div></div>
                <label className="text-xs font-bold text-[#c7b9ae]">القطر الصحي أو الإضافات المفضلة<textarea className={`${inputClass} min-h-32 resize-y`} placeholder="مثال: قطر صحي، قطر خفيف، فستق إضافي…" value={profile.dietaryNotes} onChange={(event) => setProfile({ ...profile, dietaryNotes: event.target.value })} /></label>
                <p className="mt-3 text-[11px] leading-5 text-[#8d7e73]">ملاحظة الطلب النهائية تضاف عند إتمام الشراء.</p>
                <button type="button" onClick={savePreferences} className="mt-4 rounded-xl border border-[#ff7b00]/30 px-4 py-2.5 text-xs font-black text-[#ff9a2f] hover:bg-[#ff7b00]/10">حفظ التفضيلات</button>
              </section>

              <section className={panelClass}>
                <div className="mb-4 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff7b00]/10 text-[#ff9a2f]"><ShieldCheck className="h-5 w-5" /></span><div><h2 className="font-black">الأمان</h2><p className="mt-1 text-xs text-[#a99b90]">تحديث كلمة مرور هذا الحساب.</p></div></div>
                <label className="block text-xs font-bold text-[#c7b9ae]">كلمة المرور الحالية<input className={inputClass} type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></label>
                <label className="mt-4 block text-xs font-bold text-[#c7b9ae]">كلمة المرور الجديدة<input className={inputClass} type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></label>
                <button type="button" onClick={submitPasswordChange} className="mt-4 w-full rounded-xl bg-[#ff7b00] px-4 py-3 text-sm font-black text-white transition hover:bg-[#ea6a00]">تغيير كلمة المرور</button>
                {passwordMessage && <p role="status" className="mt-3 text-xs text-[#ffbd73]">{passwordMessage}</p>}
              </section>

              <div className="rounded-2xl border border-[#ff7b00]/15 bg-[#221d19] p-5"><div className="flex items-center gap-3"><Check className="h-5 w-5 text-[#ff9a2f]" /><p className="text-xs leading-6 text-[#c7b9ae]">نحفظ دفتر العناوين والتفضيلات على هذا الجهاز لتسهيل طلباتك القادمة.</p></div></div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};
