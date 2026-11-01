import React, { useState } from 'react';
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus, MapPin, CheckCircle2, MessageCircle, Printer, User } from 'lucide-react';
import { CartItem, Order, StoreSettings } from '../types';
import { api } from '../services/api';
import { PaymentModal, PaymentResult } from '../components/PaymentModal';
import { ReceiptPrintModal } from '../components/ReceiptPrintModal';

interface CheckoutPageProps {
  cart: CartItem[];
  onRefreshCart: ()=>Promise<void>;
  settings: StoreSettings | null;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onNavigate: (tab: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  cart,
  onRefreshCart,
  settings,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onNavigate,
}) => {
  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [pickupTime, setPickupTime] = useState('خلال 20-30 دقيقة');
  const [notes, setNotes] = useState('');

  // State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Subtotal
  const subtotal = cart.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);

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
    if (!customerName.trim() || !customerPhone.trim()) {
      setError('يرجى كتابة الاسم ورقم الهاتف للمتابعة');
      return;
    }
    setError('');
    setShowPaymentModal(true);
  };

  const handlePaymentConfirmed = async (result: PaymentResult) => {
    setShowPaymentModal(false);
    setIsSubmitting(true);

    try {
      const newOrder = await api.createOrder({
        customerName: customerName.trim(),
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
        total: subtotal,
        paymentMethod: result.paymentMethod,
        paymentStatus: result.paymentStatus,
        transactionId: result.transactionId,
        source: getTrafficSource(),
      });

      setPlacedOrder(newOrder);
      onClearCart();
    } catch (err: any) {
      setError(err.message || 'تعذر حفظ الطلب. حاول مجدداً.');
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
      `*طريقة الدفع:* عند الاستلام في المحل`,
      ord.notes ? `*ملاحظات:* ${ord.notes}` : '',
      `\nاستلام من فرع رافدية - الشارع الرئيسي، نابلس`,
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
            <h1 className="text-2xl sm:text-4xl font-black text-[#211814] font-heading">
              تم استلام طلبك بنجاح!
            </h1>
            <p className="text-sm sm:text-base text-[#75675C]">
              شكراً لاختيارك <span className="text-[#C7652D] font-bold">Kömür Künefe — كنافة ع الفحم</span>.
            </p>
            <div className="pt-2">
              <span className="inline-block bg-[#F0E8DC] text-[#C7652D] border border-[#DAB775]/60 px-5 py-2 rounded-2xl text-xl font-black tracking-wider">
                رقم الطلب: {placedOrder.orderNumber}
              </span>
            </div>
          </div>

          <div className="status-notice"><p>حالة الطلب: {placedOrder.status === 'new' ? 'تم تسجيل الطلب — بانتظار بدء التحضير' : placedOrder.status}</p><button className="signature-button secondary mt-4" onClick={() => { window.history.replaceState(null, '', '/track?order=' + encodeURIComponent(placedOrder.orderNumber)); onNavigate('track'); }}>متابعة الطلب</button></div>
          <ul className="divide-y divide-stone-200">{placedOrder.items.map(item => <li key={item.productId + item.variantId} className="py-3">{item.name} · {item.variantName} × {item.quantity} <strong>{item.price * item.quantity} ₪</strong></li>)}</ul>
          {/* Pickup Details & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1.5">
              <span className="text-slate-400 block">طريقة ومكان الاستلام:</span>
              <span className="font-bold text-[#211814] text-sm block">استلام من المحل (فرع رافدية)</span>
              <span className="text-[#75675C] block">{settings?.branch || 'رافدية - الشارع الرئيسي، نابلس'}</span>
              <span className="text-[#C7652D] font-bold block pt-1">موعد الاستلام المطلوب: {placedOrder.pickupTime}</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1.5">
              <span className="text-slate-400 block">بيانات الدفع والطلب:</span>
              <span className="font-bold text-[#211814] text-sm block">المجموع: {placedOrder.total} شيكل</span>
              <span className="text-[#75675C] block">
                طريقة الدفع: كاش عند الاستلام
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
                className="flex-1 py-3 px-4 rounded-xl bg-[#F0E8DC] hover:bg-orange-100 text-orange-800 border border-[#DAB775]/40 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Printer className="w-4 h-4 text-[#C7652D]" />
                <span>عرض وطباعة إيصال الطلب</span>
              </button>

              <button
                onClick={() => {
                  setPlacedOrder(null);
                  onNavigate('menu');
                }}
                className="py-3 px-6 rounded-xl bg-slate-100 text-[#75675C] hover:text-[#211814] text-xs font-bold transition-colors"
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
        <div className="w-20 h-20 rounded-full bg-[#F0E8DC] border border-[#DAB775]/40 text-[#C7652D] mx-auto flex items-center justify-center">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-[#211814] font-heading">
          سلة الطلبات فارغة حالياً
        </h2>
        <p className="text-sm text-[#75675C]">
          تصفح المنيو واختر ما تشتهيه من أصناف الكنافة النابلسية المخبوزة على الفحم.
        </p>
        <button
          onClick={() => onNavigate('menu')}
          className="mt-4 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#C7652D] to-[#A94E20] text-white font-bold text-sm shadow-md hover:scale-105 transition-all"
        >
          تصفح المنيو الآن
        </button>
      </div>
    );
  }

  return (
      <div className="checkout-editorial max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-right space-y-8 animate-soft-slide-up">

      {error && <div className="status-notice"><p role="alert">{error}</p><button type="button" className="signature-button secondary mt-3" onClick={async()=>{try{await onRefreshCart();setError('تم تحديث الأسعار والكميات وإزالة غير المتوفر. راجع السلة ثم أكد الطلب.');}catch{setError('تعذر تحديث السلة');}}}>تحديث السلة من المنيو</button></div>}
      {/* Page Title */}
      <div className="border-b border-[#35241A]/10 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#211814] font-heading">
            سلة الطلب والدفع
          </h1>
          <p className="text-xs sm:text-sm text-[#75675C]">
            طريقة الاستلام: استلام مباشر من المحل (رافدية - الشارع الرئيسي)
          </p>
        </div>
        <button
          onClick={() => onNavigate('menu')}
          className="text-xs font-bold text-[#C7652D] hover:underline flex items-center gap-1"
        >
          <span>إضافة المزيد من الأصناف</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Col (7/12 on LG): Cart items & Customer Form */}
        <div className="lg:col-span-7 space-y-6">

          {/* Cart Items List */}
          <div className="bg-white border border-[#35241A]/10 rounded-[24px] p-4 sm:p-6 space-y-4 shadow-[0_12px_35px_rgba(53,36,26,.06)]">
            <h3 className="text-base font-bold text-[#211814] font-heading flex items-center justify-between">
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
                <div key={idx} className="pt-3 first:pt-0 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-slate-800 font-heading">
                      {item.product.name}
                    </h4>
                    <span className="text-xs text-[#C7652D] font-medium block">
                      {item.variant.name} ({item.variant.price} ₪)
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1">
                      <button
                        onClick={() => onUpdateQuantity(idx, item.quantity - 1)}
                        className="min-h-11 min-w-11 flex items-center justify-center hover:text-[#211814] text-[#75675C]"
                        aria-label="إنقاص"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                        className="min-h-11 min-w-11 flex items-center justify-center hover:text-[#211814] text-[#75675C]"
                        aria-label="زيادة"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-left min-w-[60px]">
                      <span className="text-sm font-bold text-[#C7652D]">
                        {item.variant.price * item.quantity} ₪
                      </span>
                    </div>

                    <button
                      onClick={() => onRemoveItem(idx)}
                      aria-label="حذف الصنف من السلة" className="text-slate-400 hover:text-red-500 min-h-11 min-w-11 flex items-center justify-center transition-colors"
                      title="حذف"
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
            <h3 className="text-base font-bold text-[#211814] font-heading flex items-center gap-2">
              <User className="w-4 h-4 text-[#C7652D]" />
              <span>بيانات الاستلام والتواصل</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الاسم الكريم <span className="text-[#C7652D]">*</span>

              <input
                  type="text"
                  required
                  placeholder="مثال: أحمد كنعان"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
                /></label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رقم الهاتف أو الواتساب <span className="text-[#C7652D]">*</span>

              <input
                  type="tel"
                  required
                  placeholder="059xxxxxxx أو 056xxxxxxx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none transition-all dir-ltr text-right"
                /></label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  موعد الاستلام المفضل

              <select
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none transition-all"
                >
                  <option value="خلال 20-30 دقيقة">خلال 20-30 دقيقة (أسرع وقت)</option>
                  <option value="خلال 45 دقيقة">خلال 45 دقيقة</option>
                  <option value="خلال ساعة">خلال ساعة</option>
                  <option value="في وقت محدد الليلة (يرجى كتابته بالملاحظات)">في وقت محدد الليلة (اكتبه بالملاحظات)</option>
                </select></label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ملاحظات للتحضير (اختياري)

              <input
                  type="text"
                  placeholder="مثال: قطر خفيف، زيادة فستق، تقطيع مربعات..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
                /></label>
              </div>
            </div>

            {/* Pickup Policy Notice */}
            <div className="bg-[#F0E8DC] border border-[#DAB775]/40 rounded-xl p-3 flex items-start gap-2.5 text-xs text-[#75675C] leading-relaxed">
              <MapPin className="w-4 h-4 text-[#C7652D] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#211814]">طريقة الاستلام: </strong>
                <span>
                  استلام من المحل فقط (فرع رافدية - الشارع الرئيسي). سيتم تحمير الكنافة على الفحم لتكون في أوج سخونتها وقرمشتها عند وصولك.
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
                <span className="text-xs text-[#C7652D] font-bold">استلام من الفرع (0 ₪)</span>
              </div>
              <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
                <span className="text-base font-bold text-[#F7F0E5]">المجموع النهائي:</span>
                <div className="text-left">
                <span className="text-2xl font-black text-[#DAB775] font-heading">{subtotal}</span>
                  <span className="text-xs font-bold text-[#75675C] mr-1">شيكل</span>
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
                <p>الدفع عند الاستلام من فرع رافدية</p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Payment Gateway Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        totalAmount={subtotal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentConfirmed}
      />

    </div>
  );
};
