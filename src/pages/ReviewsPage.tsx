import React, { useState } from 'react';
import { Star, MessageSquarePlus, CheckCircle, ShieldCheck, Heart } from 'lucide-react';
import { Review } from '../types';
import { api } from '../services/api';

interface ReviewsPageProps {
  reviews: Review[];
  onRefreshReviews: () => void;
}

export const ReviewsPage: React.FC<ReviewsPageProps> = ({ reviews, onRefreshReviews }) => {
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !comment.trim()) return;

    setIsSubmitting(true);
    try {
      const msg = await api.submitReview({
        customerName: customerName.trim(),
        rating,
        comment: comment.trim(),
      });
      setSubmittedMessage(msg);
      setCustomerName('');
      setComment('');
      setRating(5);
      onRefreshReviews();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء إرسال التقييم');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 text-right space-y-12">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 bg-white text-orange-700 border border-orange-200 px-4 py-1.5 rounded-full text-xs font-bold shadow-xs">
          <Heart className="w-4 h-4 text-rose-500" />
          <span>تجارب حقيقية لزبائننا في نابلس</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 font-heading">
          آراء زوار كُومُر كُونافيه
        </h1>
        <p className="text-sm sm:text-base text-slate-500">
          كل تقييم يمر على مراجعة الإدارة لضمان المصداقية وتوثيق تجربة حقيقية خالية من التقييمات المزيفة.
        </p>
      </div>

      {/* Submit Review Card */}
      <div className="bg-white border-2 border-orange-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shrink-0">
            <MessageSquarePlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              شاركنا تجربتك ورأيك
            </h3>
            <p className="text-xs text-slate-500">
              جربت الكنافة ع الفحم في رافدية؟ اكتب رأيك وشارك محبي الكنافة انطباعك
            </p>
          </div>
        </div>

        {submittedMessage ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-sm flex items-center gap-3 animate-fadeIn">
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>{submittedMessage}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                التقييم بالنجوم:
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none transition-transform hover:scale-125"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-orange-600 mr-2">
                  ({rating} من 5 نجوم)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسمك الكريم <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: رنا التميمي أو إبراهيم من نابلس"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none transition-all text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رأيك وانطباعك عن الطعم والخدمة <span className="text-orange-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="كيف كانت قرمشة الكنافة ع الفحم ومطة الجبنة؟ وسرعة استلام الطلب في رافدية؟"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl px-3.5 py-2 text-slate-800 placeholder-slate-400 focus:outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
                <span>سيتم مراجعة التقييم واعتماده من قبل الإدارة قبل ظهوره علناً بالموقع.</span>
              </span>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-md transition-all"
              >
                {isSubmitting ? 'جارٍ الإرسال...' : 'إرسال التقييم'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 font-heading">
          التقييمات المعتمدة ({reviews.length})
        </h3>

        {reviews.length === 0 ? (
          <div className="bg-white border border-orange-100 rounded-3xl p-12 text-center space-y-3 shadow-xs">
            <Star className="w-12 h-12 text-orange-300 mx-auto opacity-50" />
            <h4 className="text-lg font-bold text-slate-900 font-heading">
              كن أول من يشاركنا رأيه
            </h4>
            <p className="text-xs text-slate-500">
              لا توجد تقييمات منشورة حالياً بعد مراجعة الإدارة. شاركنا رأيك أعلاه ليظهر هنا!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white border border-orange-100 rounded-2xl p-6 space-y-3 shadow-xs relative flex flex-col justify-between"
              >
                {rev.isDemo && (
                  <span className="absolute top-3 left-3 text-[9px] bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded font-medium">
                    تجريبي للمعاينة
                  </span>
                )}
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rev.rating ? 'fill-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold text-slate-800">{rev.customerName}</span>
                  <span>{new Date(rev.createdAt).toLocaleDateString('ar-EG')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
