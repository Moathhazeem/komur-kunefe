import React, { useEffect, useState } from 'react';
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus, MapPin, CheckCircle2, MessageCircle, Printer, User } from 'lucide-react';
import { CartItem, Order, StoreSettings } from '../types';
import { api } from '../services/api';
import { PaymentModal, PaymentResult } from '../components/PaymentModal';
import { ReceiptPrintModal } from '../components/ReceiptPrintModal';
import { useAuth } from '../contexts/AuthContext';

interface CheckoutPageProps {
  cart: CartItem[];
  settings: StoreSettings | null;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onNavigate: (tab: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  cart,
  settings,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onNavigate,
}) => {
  // Signed-in customers use their saved profile name; guests enter their full name.
  const { user } = useAuth();
  const [customerName, setCustomerName] = useState('');
  useEffect(() => {
    if (user?.name) setCustomerName(user.name);
  }, [user?.name]);
  const [customerPhone, setCustomerPhone] = useState('');
  const [pickupTime, setPickupTime] = useState('خلال 20-30 دقيقة');
  const [fulfillment, setFulfillment] = useState<'pickup' | 'delivery'>(() => localStorage.getItem('komur_fulfillment') === 'delivery' ? 'delivery' : 'pickup');
  const [notes, setNotes] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  useEffect(() => {
    localStorage.setItem('komur_fulfillment', fulfillment);
  }, [fulfillment]);
  
  // State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Delivery is a single order-level fee, regardless of the number of delivered items.
  const subtotal = cart.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
  const deliveryFee = fulfillment === 'delivery' ? 15 : 0;
  const total = subtotal + deliveryFee;

  // Detect UTM source from URL query parameter
  const getTrafficSource = (): 'website' | 'instagram' | 'facebook' | 'whatsapp' => {
    const params = new URLSearchParams(window.location.search);
    const utm = (params.get('utm_source') || '').toLowerCase();
    if (utm.includes('insta')) return 'instagram';
    if (utm.includes('face') || utm.includes('fb')) return 'facebook';
    if (utm.includes('wa') || utm.includes('what')) return 'whatsapp';
    return 'website';
  };

  const handleOpenPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!user && customerName.trim().split(/\s+/).filter(Boolean).length < 2) || !customerPhone.trim()) {
      alert(!user && customerName.trim().split(/\s+/).filter(Boolean).length < 2 ? 'يرجى كتابة الاسم الكامل ورقم الهاتف للمتابعة' : 'يرجى كتابة رقم الهاتف للمتابعة');
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentConfirmed = async (result: PaymentResult) => {
    setShowPaymentModal(false);
    setIsSubmitting(true);

    try {
      const newOrder = await api.createOrder({
      
        customerName: customerName.trim(),
        fulfillment,
        deliveryAddress: fulfillment === 'delivery' ? deliveryAddress.trim() : undefined,
        customerPhone: customerPhone.trim(),
        pickupTime,
        notes: notes.trim(),
        items: cart.map((i) => ({
          productId: i.product.id,
          name: i.product.name,
          variantId: i.variant.id,
          variantName: i.variant.name,
          price: i.variant.price,
          quantity: i.quantity,
        })),
        total,
        paymentMethod: result.paymentMethod,
        paymentStatus: result.paymentStatus,
        transactionId: result.transactionId,
        source: getTrafficSource(),
      });

      setPlacedOrder(newOrder);
      setFulfillment('pickup');
      onClearCart();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء حفظ الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppOrderLink = (ord: Order) => {
    const lines = [
      `*طلب جديد من موقع كُومُر كُونافيه — كنافة ع الفحم* 🔥`,
      `*رقم الطلب:* ${ord.orderNumber}`,
      `*الاسم:* ${ord.customerName}`,
      `*الهاتف:* ${ord.customerPhone}`,
      `*موعد الاستلام:* ${ord.pickupTime}`,
      `---------------------`,
      `*الأصناف:*`,
      ...ord.items.map((i) => `• ${i.name} (${i.variantName}) × ${i.quantity} = ${i.price * i.quantity} ₪`),
      `---------------------`,
      `*المجموع النهائي:* ${ord.total} شيكل`,
      `*طريقة الدفع:* عند استلام الطلب`,
      ord.notes ? `*ملاحظات:* ${ord.notes}` : '',
      ord.fulfillment === 'delivery' ? `*عنوان التوصيل:* ${ord.deliveryAddress || ''} · رسوم التوصيل: ${ord.deliveryFee || 0} شيكل` : `\nاستلام من فرع رافدية - الشارع الرئيسي، نابلس`,
    ].filter(Boolean);

    return `https://wa.me/${settings?.whatsapp || '970562606061'}?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  // If order is placed successfully
  if (placedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-right space-y-8 animate-soft-slide-up">
        
        {/* Success Card */}
        <div className="bg-[#F7F0E5] border-2 border-[#DAB775]/50 rounded-[30px] p-6 sm:p-10 shadow-[0_20px_60px_rgba(53,36,26,.1)] space-y-6">
          <div className="text-center space-y-3">
            <div className="w-18 h-18 rounded-full bg-emerald-50 border-2 border-emerald-500 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 font-heading">
              تم استلام طلبك بنجاح!
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              شكراً لاختيارك <span className="text-[#C7652D] font-bold">Kömür Künefe — كنافة ع الفحم</span>.
            </p>
            <div className="pt-2">
              <span className="inline-block bg-[#F0E8DC] text-[#C7652D] border border-[#DAB775]/60 px-5 py-2 rounded-2xl text-xl font-black tracking-wider">
                رقم الطلب: {placedOrder.orderNumber}
              </span>
            </div>
          </div>

          {/* Live Order Tracker */}
          <div className="bg-orange-50/50 p-5 sm:p-6 rounded-2xl border border-orange-100 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              متابعة حالة الطلب المباشرة
            </h3>
            
            {/* Steps visual */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="space-y-1.5">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black mx-auto flex items-center justify-center">
                  ✓
                </div>
                <span className="font-bold text-slate-800 block">جديد</span>
                <span className="text-[10px] text-slate-500">تم التأكيد</span>
              </div>

              <div className="space-y-1.5">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white font-black mx-auto flex items-center justify-center animate-pulse shadow-xs">
                  2
                </div>
                <span className="font-bold text-orange-600 block">قيد التحضير</span>
                <span className="text-[10px] text-slate-500">على جمر الفحم</span>
              </div>

              <div className="space-y-1.5 opacity-60">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-black mx-auto flex items-center justify-center">
                  3
                </div>
                <span className="font-bold text-slate-500 block">جاهز للاستلام</span>
                <span className="text-[10px] text-slate-400">في المحل</span>
              </div>

              <div className="space-y-1.5 opacity-60">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-black mx-auto flex items-center justify-center">
                  4
                </div>
                <span className="font-bold text-slate-500 block">تم التسليم</span>
                <span className="text-[10px] text-slate-400">صحتين وهنا</span>
              </div>
            </div>
          </div>

          {/* Pickup Details & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1.5">
              <span className="text-slate-400 block">طريقة الاستلام:</span>
              <span className="font-bold text-slate-900 text-sm block">{placedOrder.fulfillment === 'delivery' ? 'توصيل' : 'استلام من المحل (فرع رافدية)'}</span>
              {placedOrder.fulfillment === 'delivery' ? <span className="text-slate-600 block">العنوان: {placedOrder.deliveryAddress}</span> : <span className="text-slate-600 block">{settings?.branch || 'رافدية - الشارع الرئيسي، نابلس'}</span>}
              <span className="text-orange-600 font-bold block pt-1">موعد الطلب: {placedOrder.pickupTime}</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1.5">
              <span className="text-slate-400 block">بيانات الدفع والطلب:</span>
              <span className="font-bold text-slate-900 text-sm block">المجموع: {placedOrder.total} شيكل</span>
              <span className="text-slate-600 block">
                طريقة الدفع: الدفع عند استلام الطلب
              </span>
              <span className="text-emerald-700 font-bold block pt-1">الاسم: {placedOrder.customerName} ({placedOrder.customerPhone})</span>
            </div>
          </div>

          {/* Actions: Direct WhatsApp & Print */}
          <div className="space-y-3 pt-2">
            <a
              href={getWhatsAppOrderLink(placedOrder)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <MessageCircle className="w-5 h-5 text-emerald-600" />
              <span>إرسال تفاصيل الطلب عبر واتساب المحل (+970 562 606 061)</span>
            </a>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPrintModal(true)}
                className="flex-1 py-3 px-4 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Printer className="w-4 h-4 text-orange-600" />
                <span>عرض وطباعة إيصال الطلب</span>
              </button>

              <button
                onClick={() => {
                  setPlacedOrder(null);
                  onNavigate('menu');
                }}
                className="py-3 px-6 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-bold transition-colors"
              >
                طلب صنف آخر
              </button>
            </div>
          </div>

        </div>

        {/* Print Modal */}
        <ReceiptPrintModal
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          order={placedOrder}
          settings={settings}
        />
      </div>
    );
  }

  // If cart is empty
  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-orange-50 border border-orange-200 text-orange-500 mx-auto flex items-center justify-center">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 font-heading">
          سلة الطلبات فارغة حالياً
        </h2>
        <p className="text-sm text-slate-500">
          تصفح المنيو واختر ما تشتهيه من أصناف الكنافة النابلسية المخبوزة على الفحم.
        </p>
        <button
          onClick={() => onNavigate('menu')}
          className="mt-4 px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm shadow-md hover:scale-105 transition-all"
        >
          تصفح المنيو الآن
        </button>
      </div>
    );
  }

  return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-right space-y-8 animate-soft-slide-up">
      
      {/* Page Title */}
      <div className="border-b border-orange-100 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 font-heading">
            سلة الطلب والدفع
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            طريقة الاستلام: {fulfillment === 'delivery' ? 'توصيل للعنوان الذي ستدخله أدناه' : 'استلام من الفرع (رافدية)'}
          </p>
        </div>
        <button
          onClick={() => onNavigate('menu')}
          className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1"
        >
          <span>إضافة المزيد من الأصناف</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col (7/12 on LG): Cart items & Customer Form */}
        <div className="lg:col-span-7 space-y-6">
          <fieldset className="rounded-[24px] border border-[#35241A]/10 bg-white p-4 sm:p-5 shadow-[0_12px_35px_rgba(53,36,26,.06)]">
            <legend className="px-2 text-base font-black text-slate-900">طريقة الاستلام للطلب بالكامل</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border-2 p-4 ${fulfillment === 'pickup' ? 'border-[#C7652D] bg-[#F0E8DC]' : 'border-[#35241A]/10 bg-white hover:border-[#C7652D]/35'}`}>
                <span className="flex items-center gap-3"><input type="radio" name="order-fulfillment" value="pickup" checked={fulfillment === 'pickup'} onChange={() => setFulfillment('pickup')} className="h-5 w-5 accent-[#C7652D]" /><span className="text-sm font-black text-[#211814]">استلام من الفرع</span></span>
                <strong className="text-sm font-black text-[#C7652D]">0 ₪</strong>
              </label>
              <label className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border-2 p-4 ${fulfillment === 'delivery' ? 'border-[#C7652D] bg-[#F0E8DC]' : 'border-[#35241A]/10 bg-white hover:border-[#C7652D]/35'}`}>
                <span className="flex items-center gap-3"><input type="radio" name="order-fulfillment" value="delivery" checked={fulfillment === 'delivery'} onChange={() => setFulfillment('delivery')} className="h-5 w-5 accent-[#C7652D]" /><span className="text-sm font-black text-[#211814]">توصيل</span></span>
                <strong className="text-sm font-black text-[#C7652D]">15 ₪ للطلب</strong>
              </label>
            </div>
            <p className="mt-3 text-xs text-slate-500">تُضاف رسوم التوصيل مرة واحدة على الطلب بالكامل.</p>
          </fieldset>
          
          {/* Cart Items List */}
          <div className="bg-white border border-[#35241A]/10 rounded-[24px] p-4 sm:p-6 space-y-4 shadow-[0_12px_35px_rgba(53,36,26,.06)]">
            <h3 className="text-base font-bold text-slate-900 font-heading flex items-center justify-between">
              <span>الأصناف المختارة ({cart.length})</span>
              <button
                onClick={onClearCart}
                className="text-xs text-slate-400 hover:text-red-500 font-normal transition-colors"
              >
                تفريغ السلة
              </button>
            </h3>

            <div className="divide-y divide-slate-100 space-y-3 pt-1">
              {cart.map((item, idx) => (
                <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-slate-800 font-heading">
                      {item.product.name}
                    </h4>
                    <span className="text-xs text-orange-600 font-medium block">
                      {item.variant.name} ({item.variant.price} ₪)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
                      <button
                        onClick={() => onUpdateQuantity(idx, item.quantity - 1)}
                        className="min-w-[36px] min-h-[36px] p-2 flex items-center justify-center hover:text-slate-900 text-slate-500 active:scale-95 transition-all"
                        aria-label="إنقاص"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                        className="min-w-[36px] min-h-[36px] p-2 flex items-center justify-center hover:text-slate-900 text-slate-500 active:scale-95 transition-all"
                        aria-label="زيادة"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-left min-w-[60px]">
                      <span className="text-sm font-bold text-orange-600">
                        {item.variant.price * item.quantity} ₪
                      </span>
                    </div>

                    <button
                      onClick={() => onRemoveItem(idx)}
                      className="min-w-[44px] min-h-[44px] p-2 flex items-center justify-center rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 active:scale-95 transition-colors"
                      title="حذف"
                      aria-label="حذف الصنف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Details Form */}
          <form id="checkout-form" onSubmit={handleOpenPayment} className="bg-white border border-[#35241A]/10 rounded-[24px] p-4 sm:p-6 space-y-4 shadow-[0_12px_35px_rgba(53,36,26,.06)]">
            <h3 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
              <User className="w-4 h-4 text-orange-500" />
              <span>بيانات الاستلام والتواصل</span>
            </h3>

            <div className={`grid grid-cols-1 ${user ? '' : 'sm:grid-cols-2'} gap-4 text-sm`}>
              {!user && <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الاسم الكامل <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أحمد كنعان"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full min-h-[44px] bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
                />
              </div>}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رقم الهاتف أو الواتساب <span className="text-orange-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="059xxxxxxx أو 056xxxxxxx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full min-h-[44px] bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none transition-all dir-ltr text-right"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  موعد الاستلام المفضل
                </label>
                <select
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full min-h-[44px] bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none transition-all"
                >
                  <option value="خلال 20-30 دقيقة">خلال 20-30 دقيقة (أسرع وقت)</option>
                  <option value="خلال 45 دقيقة">خلال 45 دقيقة</option>
                  <option value="خلال ساعة">خلال ساعة</option>
                  <option value="في وقت محدد الليلة (يرجى كتابته بالملاحظات)">في وقت محدد الليلة (اكتبه بالملاحظات)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ملاحظات للتحضير (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="مثال: قطر خفيف، زيادة فستق، تقطيع مربعات..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full min-h-[44px] bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
                />
              </div>
            </div>

            {fulfillment === 'delivery' && <div>
              <label htmlFor="delivery-address" className="mb-1 block text-xs font-bold text-slate-700">عنوان التوصيل <span className="text-orange-500">*</span></label>
              <textarea id="delivery-address" required value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="المدينة، الحي، الشارع، وأقرب معلم" className="w-full min-h-[64px] resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100" rows={2} />
            </div>}
            {/* Pickup Policy Notice */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
              <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">طريقة الاستلام: </strong>
                <span>
                  {fulfillment === 'delivery' ? 'سيتم توصيل الطلب بالكامل، ورسوم التوصيل محسوبة مرة واحدة.' : 'استلام من المحل (فرع رافدية - الشارع الرئيسي). سيتم تحمير الكنافة على الفحم لتكون في أوج سخونتها وقرمشتها عند وصولك.'}
                </span>
              </div>
            </div>

          </form>

        </div>

        {/* Right Col (5/12 on LG): Order Summary & Payment Button */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#17120F] text-[#F7F0E5] border border-[#DAB775]/20 rounded-[24px] p-6 space-y-5 sticky top-24 shadow-xl">
            <h3 className="text-lg font-bold text-[#F7F0E5] font-heading border-b border-white/10 pb-3">
              ملخص الطلب
            </h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-[#BDAFA2]">
                <span>مجموع الأصناف ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
                <span className="font-bold text-[#F7F0E5]">{subtotal} ₪</span>
              </div>
              <div className="flex justify-between text-[#BDAFA2]">
                <span>رسوم التجهيز والتغليف الفاخر</span>
                <span className="text-emerald-600 font-bold">مجاناً</span>
              </div>
              <div className="flex justify-between text-[#BDAFA2]">
                <span>التوصيل</span>
                <span className="text-xs text-orange-600 font-bold">{fulfillment === 'delivery' ? `توصيل (${deliveryFee} ₪ للطلب)` : 'استلام من الفرع (0 ₪)'}</span>
              </div>
              <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
                <span className="text-base font-bold text-[#F7F0E5]">المجموع النهائي:</span>
                <div className="text-left">
                <span className="text-2xl font-black text-[#DAB775] font-heading">{total}</span>
                  <span className="text-xs font-bold text-slate-500 mr-1">شيكل</span>
                </div>
              </div>
            </div>

            {/* Pluggable Payment Provider Button */}
            <div className="pt-2 space-y-3">
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full py-4 rounded-full bg-[#C7652D] hover:bg-[#A94E20] text-white font-black text-base shadow-md shadow-[#C7652D]/20 flex items-center justify-center gap-2"
              >
                <span>متابعة وتأكيد الطلب</span>
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="text-center text-[11px] text-slate-400 space-y-1">
                <p>لا نطلب بيانات بطاقة في النسخة التجريبية</p>
                <p>{fulfillment === 'delivery' ? 'رسوم التوصيل تُحسب مرة واحدة للطلب' : 'الدفع عند الاستلام من فرع رافدية'}</p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Payment Gateway Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        totalAmount={total}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentConfirmed}
      />

    </div>
  );
};
