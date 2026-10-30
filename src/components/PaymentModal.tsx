import React, { useState } from 'react';
import { CreditCard, Banknote, ShieldCheck, Lock, CheckCircle, AlertCircle } from 'lucide-react';

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

export const PaymentModal: React.FC<PaymentModalProps> = ({
  totalAmount,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const [method, setMethod] = useState<'mock_online' | 'cash_on_pickup'>('mock_online');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardHolder, setCardHolder] = useState('زبون كُومُر كُونافيه');
  const [expiry, setExpiry] = useState('12/28');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePay = () => {
    setIsProcessing(true);
    setError(null);

    // Simulate realistic payment provider gateway interaction (e.g., Arab Bank / Jawwal Pay / PalPay / Visa)
    setTimeout(() => {
      setIsProcessing(false);
      if (method === 'mock_online') {
        onPaymentSuccess({
          success: true,
          paymentMethod: 'mock_online',
          paymentStatus: 'paid',
          transactionId: `TX-PAL-${Math.floor(100000 + Math.random() * 900000)}`,
        });
      } else {
        onPaymentSuccess({
          success: true,
          paymentMethod: 'cash_on_pickup',
          paymentStatus: 'pending',
        });
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white border border-orange-200 rounded-3xl p-6 sm:p-8 shadow-2xl text-right animate-fadeIn">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-black">
              <Lock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">
                بوابة الدفع الآمن
              </h3>
              <span className="text-xs text-slate-400">
                طبقة دفع قابلة للربط ببنوك ومحافظ فلسطين
              </span>
            </div>
          </div>
          <div className="text-left">
            <span className="text-xs text-slate-400 block">المبلغ المطلوب</span>
            <span className="text-xl font-black text-orange-600 font-heading">{totalAmount} ₪</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Method Selection Tabs */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <button
            type="button"
            onClick={() => setMethod('mock_online')}
            className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between ${
              method === 'mock_online'
                ? 'bg-orange-50 border-orange-400 text-orange-950 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:border-orange-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="w-5 h-5 text-orange-600" />
              {method === 'mock_online' && <CheckCircle className="w-4 h-4 text-orange-600" />}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">دفع إلكتروني</div>
              <div className="text-[11px] text-slate-500">بطاقة بنكية / محفظة</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMethod('cash_on_pickup')}
            className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between ${
              method === 'cash_on_pickup'
                ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Banknote className="w-5 h-5 text-emerald-600" />
              {method === 'cash_on_pickup' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">عند الاستلام</div>
              <div className="text-[11px] text-slate-500">كاش أو بطاقة بالمحل</div>
            </div>
          </button>
        </div>

        {/* Online Card Details Form (Mock Provider) */}
        {method === 'mock_online' ? (
          <div className="space-y-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200">
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>مزود دفع تجريبي آمن (Sandbox Ready)</span>
              </span>
              <span>Visa / MC / PalPay</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                رقم البطاقة
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full bg-white border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl px-3 py-2 text-slate-800 text-sm font-mono dir-ltr text-right focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  تاريخ الانتهاء
                </label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl px-3 py-2 text-slate-800 text-sm font-mono dir-ltr text-right focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  رمز الأمان (CVV)
                </label>
                <input
                  type="password"
                  defaultValue="•••"
                  maxLength={3}
                  className="w-full bg-white border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl px-3 py-2 text-slate-800 text-sm font-mono dir-ltr text-right focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                اسم حامل البطاقة
              </label>
              <input
                type="text"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                className="w-full bg-white border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none"
              />
            </div>
            
            <p className="text-[10px] text-slate-400 leading-normal pt-1">
              * ملاحظة الأمان: بيانات البطاقات لا تُحفظ في قاعدة البيانات أبداً، ويتم تمرير المعاملة عبر طبقة المزود (Payment Provider Interface).
            </p>
          </div>
        ) : (
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6 space-y-2">
            <h4 className="text-sm font-bold text-slate-900 font-heading">
              الدفع عند الاستلام في رافدية
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              سيكون طلبك جاهزاً ومسخناً على الفحم فور وصولك إلى المحل في رافدية - الشارع الرئيسي. يمكنك الدفع نقداً (كاش بالشيكل) أو عبر نقاط البيع بالبطاقة البنكية.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePay}
            disabled={isProcessing}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-[1.01]"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>جارٍ معالجة الدفع الآمن...</span>
              </span>
            ) : method === 'mock_online' ? (
              <span>تأكيد الدفع الفوري ({totalAmount} ₪)</span>
            ) : (
              <span>تأكيد الطلب والدفع عند الاستلام</span>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="py-3 px-4 rounded-xl text-xs text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            رجوع
          </button>
        </div>

      </div>
    </div>
  );
};
