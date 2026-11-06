import React, { useState } from 'react';
import { Banknote, CheckCircle2, Lock, MapPin } from 'lucide-react';

export interface PaymentResult {
  success: boolean;
  paymentMethod: 'mock_online' | 'cash_on_pickup';
  paymentStatus: 'paid' | 'pending';
  transactionId?: string;
}

interface PaymentModalProps {
  totalAmount: number;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (result: PaymentResult) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ totalAmount, isOpen, onClose, onPaymentSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (!isOpen) return null;

  const confirmCashOrder = () => {
    setIsSubmitting(true);
    window.setTimeout(() => {
      onPaymentSuccess({ success: true, paymentMethod: 'cash_on_pickup', paymentStatus: 'pending' });
      setIsSubmitting(false);
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#17120F]/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="payment-title">
      <div className="w-full max-w-md rounded-[28px] border border-[#DAB775]/25 bg-[#F7F0E5] p-6 text-right shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4"><div><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#35241A] text-[#DAB775]"><Lock className="h-5 w-5" /></span><h2 id="payment-title" className="mt-4 text-2xl font-black text-[#211814]">تأكيد الاستلام</h2><p className="mt-2 text-sm leading-7 text-[#75675C]">الدفع الإلكتروني غير مفعّل في هذه النسخة التجريبية. نثبت طلبك الآن، والدفع يكون عند الاستلام من الفرع.</p></div><button type="button" onClick={onClose} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-sm font-bold text-[#75675C] hover:text-[#C7652D]">إغلاق</button></div>
        <div className="mt-6 rounded-2xl border border-[#DAB775]/35 bg-white p-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E3F3EA] text-[#1B7C4B]"><Banknote className="h-5 w-5" /></span><div><h3 className="text-sm font-black text-[#211814]">كاش عند الاستلام</h3><p className="mt-1 text-xs text-[#75675C]">جهّز المبلغ عند وصولك إلى رافدية</p></div></div><div className="mt-4 flex items-center justify-between border-t border-[#35241A]/10 pt-4"><span className="text-xs font-bold text-[#75675C]">المجموع</span><strong className="text-xl font-black text-[#C7652D]">{totalAmount} ₪</strong></div></div>
        <div className="mt-4 flex items-start gap-2 rounded-2xl bg-[#F0E8DC] p-4 text-xs leading-6 text-[#75675C]"><MapPin className="mt-1 h-4 w-4 shrink-0 text-[#C7652D]" /><span>الاستلام من فرع رافدية - الشارع الرئيسي. سيبقى الطلب بحالة “قيد الانتظار” حتى يؤكده فريق الفرع.</span></div>
        <div className="mt-6 flex gap-3"><button type="button" onClick={confirmCashOrder} disabled={isSubmitting} className="flex-1 min-h-[48px] rounded-full bg-[#C7652D] px-5 py-3.5 text-sm font-black text-white hover:bg-[#A94E20] disabled:opacity-60 active:scale-95 transition-all">{isSubmitting ? 'جارٍ تثبيت الطلب...' : 'تأكيد الطلب'}</button><button type="button" onClick={onClose} disabled={isSubmitting} className="min-h-[48px] rounded-full border border-[#35241A]/15 px-5 py-3.5 text-sm font-bold text-[#75675C] active:scale-95 transition-all">رجوع</button></div>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-[#75675C]"><CheckCircle2 className="h-3.5 w-3.5 text-[#1B7C4B]" /> لا يتم طلب أو تخزين بيانات بطاقة</p>
      </div>
    </div>
  );
};
