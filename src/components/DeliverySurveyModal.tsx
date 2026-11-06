import React, { useState } from 'react';
import { Bike, Send, CheckCircle2, X } from 'lucide-react';
import { api } from '../services/api';

interface DeliverySurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeliverySurveyModal: React.FC<DeliverySurveyModalProps> = ({ isOpen, onClose }) => {
  const [area, setArea] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!area.trim()) return;

    setLoading(true);
    try {
      await api.submitDeliveryInterest({
        area: area.trim(),
        customerPhone: phone.trim(),
        notes: notes.trim(),
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
        setArea('');
        setPhone('');
        setNotes('');
      }, 2500);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء إرسال طلبك');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-modal-backdrop">
      <div className="relative w-full max-w-md my-auto bg-white border border-orange-200 rounded-3xl p-6 sm:p-8 shadow-2xl text-right animate-modal-enter">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 left-3 text-slate-400 hover:text-slate-700 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors active:scale-95 cursor-pointer"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3 animate-soft-slide-up">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-heading">
              شكراً لمشاركتك معنا!
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              سجّلنا منطقتك في خطتنا القادمة. سنبلغك فور إطلاق خدمة التوصيل في حيك بنابلس!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shrink-0">
                <Bike className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-heading">
                  تحب نوفر توصيل لعندك؟
                </h3>
                <p className="text-xs text-slate-500">
                  حالياً نوفر الاستلام من رافدية فقط، ونقيس رغبة الزبائن لتفعيل التوصيل قريباً!
                </p>
              </div>
            </div>

            <div className="pt-2 space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  منطقتك أو حيّك في نابلس <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: رفيديا، المخفية، المعاجين، شارع فيصل، الجبل الشمالي..."
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full min-h-[44px] bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رقم هاتفك أو الواتساب (اختياري، لنبلغك أول ما نبدأ)
                </label>
                <input
                  type="tel"
                  placeholder="059xxxxxxx أو 056xxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full min-h-[44px] bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ملاحظة إضافية
                </label>
                <textarea
                  rows={2}
                  placeholder="مثال: يا ريت تفتحوا توصيل مسائي، أو لسكنات الجامعة..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full min-h-[64px] bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl px-3.5 py-2 text-slate-800 placeholder-slate-400 focus:outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 min-h-[48px] py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'جارٍ الإرسال...' : 'سجل رغبتك بالتوصيل'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="min-h-[48px] px-5 py-3 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors active:scale-95 cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
