import React, { useState } from 'react';
import { Search, Clock, Flame, MessageCircle } from 'lucide-react';
import { Order, StoreSettings } from '../types';
import { api } from '../services/api';

interface OrderTrackingPageProps {
  settings: StoreSettings | null;
  onNavigate: (tab: string) => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ settings }) => {
  const [orderQuery, setOrderQuery] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const lookupSequence = React.useRef(0);

  const findOrder = React.useCallback(async (query: string) => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return;
    const sequence = ++lookupSequence.current;
    setLoading(true);
    setHasSearched(true);
    try {
      const found = await api.getOrder(normalizedQuery);
      if (sequence === lookupSequence.current) setOrder(found);
    } catch {
      if (sequence === lookupSequence.current) setOrder(null);
    } finally {
      if (sequence === lookupSequence.current) setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    try {
      const savedQuery = sessionStorage.getItem('komur_track_query');
      if (savedQuery) {
        sessionStorage.removeItem('komur_track_query');
        setOrderQuery(savedQuery);
      }
    } catch {}
  }, []);

  React.useEffect(() => {
    const normalized = orderQuery.trim();
    const isOrderNumber = /^KM-\d{4,}$/i.test(normalized);
    const isOrderId = /^ord-[\w-]{8,}$/i.test(normalized);
    if (!isOrderNumber && !isOrderId) return;
    const timeout = window.setTimeout(() => { void findOrder(normalized); }, 350);
    return () => window.clearTimeout(timeout);
  }, [orderQuery, findOrder]);

  React.useEffect(() => {
    if (!order) return;
    const liveOrderId = order.id;
    const unsubscribe = api.subscribeToOrderUpdates((updatedOrder) => {
      if (updatedOrder.id === liveOrderId) setOrder(updatedOrder);
    });
    const refresh = async () => {
      try {
        const current = await api.getOrder(order.orderNumber);
        if (current?.id === liveOrderId) setOrder(current);
      } catch {}
    };
    const interval = window.setInterval(refresh, 10000);
    return () => { unsubscribe(); window.clearInterval(interval); };
  }, [order?.id, order?.orderNumber]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;

    await findOrder(orderQuery);
  };

  const getStatusStep = (status: Order['status']) => {
    switch (status) {
      case 'new': return 1;
      case 'preparing': return 2;
      case 'ready': return 3;
      case 'completed': return 4;
      default: return 1;
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'new': return 'جديد - تم استلام الطلب وتأكيده';
      case 'preparing': return 'قيد التحضير - الكنافة تخبز الآن على جمر الفحم';
      case 'ready': return 'جاهز للاستلام - تفضل لفرع رافدية لاستلام طلبك ساخناً!';
      case 'completed': return 'تم التسليم - صحتين وألف عافية';
      case 'cancelled': return 'تم الإلغاء';
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 text-right space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 mx-auto flex items-center justify-center">
          <Clock className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
          تتبع حالة طلبك
        </h1>
        <p className="text-sm text-slate-500">
          أدخل رقم الطلب (مثال: KM-8042) لمعرفة مرحلة تحضير الكنافة على الفحم
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="bg-white border border-orange-100 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            required
            placeholder="اكتب رقم الطلب هنا (مثل KM-8012)"
            value={orderQuery}
            onChange={(e) => { setOrderQuery(e.target.value); setOrder(null); setHasSearched(false); }}
            className="w-full min-h-[44px] bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl pr-11 pl-4 py-3 text-slate-800 text-sm placeholder-slate-400 focus:outline-none transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-8 py-3.5 min-h-[48px] rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-md transition-all active:scale-95"
        >
          {loading ? 'جارٍ البحث...' : 'تتبع الطلب'}
        </button>
      </form>

      {/* Result View */}
      {hasSearched && !order && !loading && (
        <div className="bg-white border border-orange-100 rounded-2xl p-8 text-center space-y-3 shadow-xs">
          <Flame className="w-10 h-10 text-orange-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 font-heading">
            لم نتمكن من العثور على هذا الطلب
          </h3>
          <p className="text-xs text-slate-500">
            تأكد من كتابة رقم الطلب كما ظهر لك عند إتمام العملية (مثل KM-xxxx). أو تواصل معنا مباشرة عبر واتساب.
          </p>
          <a
            href="https://wa.me/970562606061"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-2 text-xs font-bold text-emerald-600 pt-2 hover:underline"
          >
            <MessageCircle className="w-4 h-4" />
            <span>الاستفسار عبر واتساب رافدية</span>
          </a>
        </div>
      )}

      {order && (
        <div className="bg-white border-2 border-orange-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs text-slate-400 block">رقم الطلب</span>
              <span className="text-2xl font-black text-orange-600 font-heading">{order.orderNumber}</span>
            </div>
            <div className="text-left">
              <span className="text-xs text-slate-400 block">تاريخ الطلب</span>
              <span className="text-xs text-slate-600 font-mono">
                {new Date(order.createdAt).toLocaleDateString('ar-EG')} - {new Date(order.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Status Tracker */}
          <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">الحالة الحالية:</span>
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full border border-orange-200 font-bold">
                {getStatusLabel(order.status)}
              </span>
            </div>

            {/* Visual step bar */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs pt-3">
              {[
                { step: 1, label: 'جديد' },
                { step: 2, label: 'قيد التحضير' },
                { step: 3, label: 'جاهز للاستلام' },
                { step: 4, label: 'تم التسليم' },
              ].map((s) => {
                const currentStep = getStatusStep(order.status);
                const isPassed = currentStep >= s.step;
                const isCurrent = currentStep === s.step;
                return (
                  <div key={s.step} className="space-y-1">
                    <div
                      className={`w-7 h-7 rounded-full text-xs font-black mx-auto flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-orange-500 text-white ring-4 ring-orange-100 scale-110 shadow-xs'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isPassed ? '✓' : s.step}
                    </div>
                    <span className={`text-[11px] block font-bold ${isCurrent ? 'text-orange-600' : 'text-slate-500'}`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1.5">
              <span className="text-slate-400 block">مكان الاستلام:</span>
              <span className="font-bold text-slate-900 block">محل كُومُر كُونافيه</span>
              <span className="text-slate-600 block">{settings?.branch || 'رافدية - الشارع الرئيسي، نابلس'}</span>
              <span className="text-orange-600 font-bold block pt-1">موعد الاستلام المطلوب: {order.pickupTime}</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1.5">
              <span className="text-slate-400 block">الأصناف المطلوبة:</span>
              <div className="space-y-1 pt-1">
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-slate-800">
                    <span>{it.name} ({it.variantName}) × {it.quantity}</span>
                    <span className="font-bold text-orange-600">{it.price * it.quantity} ₪</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                <span>المجموع:</span>
                <span className="text-orange-600">{order.total} شيكل</span>
              </div>
            </div>
          </div>

          {/* Quick WhatsApp Action */}
          <a
            href={`https://wa.me/970562606061?text=${encodeURIComponent(`مرحباً كُومُر كُونافيه، أستفسر عن طلبي رقم ${order.orderNumber}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[48px] py-3.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>تواصل مباشرة عبر واتساب بخصوص هذا الطلب</span>
          </a>

        </div>
      )}

    </div>
  );
};
