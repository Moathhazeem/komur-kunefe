import React, { useState, useEffect } from 'react';
import { Star, MessageSquarePlus, User, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Review } from '../types';
import { StarRating } from './StarRating';
import {
  getReviewsByProductId,
  addReview as saveNewReview,
} from '../utils/reviewsStorage';

interface ProductReviewsSectionProps {
  productId: string;
  productName?: string;
  reviews?: Review[];
  onAddReview?: (reviewData: { userName: string; rating: number; comment: string }) => void;
  initiallyOpenForm?: boolean;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  productId,
  productName: _productName,
  reviews: externalReviews,
  onAddReview: externalOnAddReview,
  initiallyOpenForm = true, // Open by default for maximum visibility on full page
}) => {
  const [internalReviews, setInternalReviews] = useState<Review[]>([]);
  const [userName, setUserName] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(initiallyOpenForm);

  // Sync internal reviews if external reviews are not provided
  useEffect(() => {
    if (!externalReviews) {
      setInternalReviews(getReviewsByProductId(productId));
    }
  }, [productId, externalReviews]);

  const activeReviews = externalReviews !== undefined ? externalReviews : internalReviews;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation: Require rating and comment
    if (rating === 0) {
      setError('يرجى تحديد تقييم بالنجوم من 1 إلى 5.');
      return;
    }

    if (!comment.trim()) {
      setError('يرجى كتابة تعليقك أو تجربتك مع هذا الصنف.');
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewPayload = {
        userName: userName.trim() || 'زبون مميز',
        rating,
        comment: comment.trim(),
      };

      if (externalOnAddReview) {
        externalOnAddReview(reviewPayload);
      } else {
        const created = saveNewReview({
          productId,
          ...reviewPayload,
        });
        setInternalReviews((prev) => [created, ...prev]);
      }

      setSuccess(true);
      setUserName('');
      setRating(0);
      setComment('');
      setTimeout(() => {
        setSuccess(false);
      }, 3500);
    } catch (err) {
      setError('حدث خطأ أثناء حفظ التقييم. حاول مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('ar-EG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(date);
    } catch {
      return 'مؤخراً';
    }
  };

  return (
    <div id="product-reviews-section" className="space-y-6 pt-6 border-t border-stone-200">
      {/* Reviews Header & Action Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>آراء وتجارب الزبائن</span>
            <span className="text-xs font-bold text-slate-500 bg-stone-100 px-2.5 py-0.5 rounded-full">
              {activeReviews.length}
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            تقييمات حقيقية وموثوقة من زبائن Kömür Künefe
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-stone-900 hover:bg-stone-800 text-white transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <MessageSquarePlus className="w-4 h-4 text-amber-400" />
          <span>{showForm ? 'إخفاء نموذج التقييم' : 'أضف تقييمك الآن'}</span>
        </button>
      </div>

      {/* Review Submission Form - Visible and clearly styled */}
      {showForm && (
        <form
          id="review-form"
          onSubmit={handleSubmit}
          className="bg-stone-50 border border-stone-200 rounded-3xl p-5 sm:p-6 space-y-4.5 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-stone-200/70">
            <div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <span>أضف رأيك وتجربتك عن هذا الصنف</span>
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">مشاركتك تساعدنا على تقديم الأفضل دائماً</p>
            </div>
            <span className="text-[11px] text-stone-400 font-medium hidden sm:inline">* مطلوب التقييم والتعليق</span>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 p-3.5 text-xs sm:text-sm font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2.5 p-3.5 text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>شكرًا لك! تم حفظ ونشر تقييمك بنجاح.</span>
            </div>
          )}

          {/* 1. Rating Selection */}
          <div className="space-y-2">
            <label className="block text-xs sm:text-sm font-bold text-slate-700">
              تقييمك للصنف بالنجوم: <span className="text-amber-500">*</span>
            </label>
            <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-2xl border border-stone-200/80">
              <StarRating
                rating={rating}
                interactive={true}
                size="lg"
                onChange={(newRating) => setRating(newRating)}
              />
              <span className="text-xs sm:text-sm font-bold text-slate-700">
                {rating === 5 && 'ممتاز جداً 🌟 (5 نجوم)'}
                {rating === 4 && 'جيد جداً 👍 (4 نجوم)'}
                {rating === 3 && 'جيد 🙂 (3 نجوم)'}
                {rating === 2 && 'مقبول 😐 (نجمتان)'}
                {rating === 1 && 'سيء 😞 (نجمة واحدة)'}
                {rating === 0 && 'انقر على النجوم لتحديد التقييم'}
              </span>
            </div>
          </div>

          {/* 2. User Name Input */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-bold text-slate-700">
              الاسم الكريم (اختياري):
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-stone-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="مثال: أبو خالد / زائر مميز"
                className="w-full pr-10 pl-3 py-2.5 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#DD6B20]/30 focus:border-[#DD6B20] outline-hidden transition"
              />
            </div>
          </div>

          {/* 3. Comment Textarea */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-bold text-slate-700">
              رأيك وتعليقك: <span className="text-amber-500">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="اكتب تفاصيل تجربتك، القرمشة، طعم الفحم، والسمن البلدي..."
              className="w-full p-3.5 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#DD6B20]/30 focus:border-[#DD6B20] outline-hidden transition resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-stone-200/60 transition cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold bg-[#DD6B20] hover:bg-[#C2410C] text-white rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>إرسال ونشر التقييم</span>
            </button>
          </div>
        </form>
      )}

      {/* Reviews List Display */}
      <div className="space-y-3">
        {activeReviews.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-3xl bg-stone-50 border border-dashed border-stone-200">
            <Star className="w-9 h-9 text-amber-300 mx-auto mb-2.5 opacity-60" />
            <p className="text-sm sm:text-base font-bold text-slate-700">لا توجد تقييمات لهذا الصنف حتى الآن</p>
            <p className="text-xs text-slate-500 mt-1">كن أول من يشارك رأيه وتجربته مع كنافة الفحم!</p>
          </div>
        ) : (
          activeReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 sm:p-5 rounded-2xl bg-stone-50/80 hover:bg-stone-50 border border-stone-200/80 transition-all space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0">
                    {rev.userName ? rev.userName.charAt(0) : 'ز'}
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-black text-slate-900 leading-none">
                      {rev.userName || 'زبون مميز'}
                    </h5>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {formatDate(rev.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <StarRating rating={rev.rating} size="sm" />
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60">
                    {rev.rating}.0
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal pr-12">
                {rev.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
