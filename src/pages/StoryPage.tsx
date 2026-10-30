import React from 'react';
import { Flame, Heart, MapPin, Award } from 'lucide-react';
import { StoreSettings } from '../types';

interface StoryPageProps {
  settings: StoreSettings | null;
  onNavigate: (tab: string) => void;
}

export const StoryPage: React.FC<StoryPageProps> = ({ settings, onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 text-right space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 bg-white text-orange-700 border border-orange-200 px-4 py-1.5 rounded-full text-xs font-bold shadow-xs">
          <Flame className="w-4 h-4 text-orange-500" />
          <span>أصالة نابلسية برائحة الفحم الطبيعي</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 font-heading">
          حكاية كُومُر كُونافيه — كنافة ع الفحم
        </h1>
        <p className="text-sm sm:text-base text-slate-500">
          قصة شغف عائلي بإحياء الطريقة الكلاسيكية العريقة في قلب رافدية
        </p>
      </div>

      {/* Main Narrative Card */}
      <div className="bg-white border border-orange-100 rounded-3xl p-6 sm:p-12 shadow-sm space-y-8 relative overflow-hidden">
        
        {settings?.isStoryDraft && (
          <div className="bg-orange-50 border border-orange-200 text-orange-800 text-xs font-medium px-4 py-2 rounded-xl flex items-center justify-between">
            <span>📌 نص مؤقت - يمكن لصاحب المحل تعديله وتحديثه في أي وقت من لوحة التحكم</span>
            <span className="text-[10px] text-orange-600 font-bold">الإعدادات ← قصة المحل</span>
          </div>
        )}

        <div className="space-y-6 text-slate-600 leading-relaxed text-sm sm:text-base">
          <p className="text-lg sm:text-xl font-bold text-slate-900 font-heading">
            {settings?.ourStory ||
              'بدأت قصة "كُومُر كُونافيه" من إيماننا بأن سر الكنافة النابلسية الحقيقي لا يكتمل إلا مع حرارة جمر الفحم الهادئة.'}
          </p>

          <p>
            في مدينة نابلس عاصمة الحلويات الشرقية، توارثت العائلة أسرار صناعة الكنافة النابلسية أباً عن جد. وحين قررنا افتتاح فرعنا في <strong>شارع رافدية الرئيسي</strong>، اتخذنا قراراً حاسماً: لن نعتمد على أفران الغاز السريعة التجارية، بل سنصنع كل صنف وكل سدر بالطريقة البطيئة الأصيلة على جمر الفحم الطبيعي المشتعل بحرارة متوازنة.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
            <div className="bg-orange-50/60 p-5 rounded-2xl border border-orange-100 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 font-heading">جمر الفحم الطبيعي</h4>
              <p className="text-xs text-slate-500">
                يمنح قاع الكنافة قرمشة ذهبية عميقة ونكهة مدخنة فريدة لا يمكن لأي فرن حديث محاكاتها.
              </p>
            </div>

            <div className="bg-orange-50/60 p-5 rounded-2xl border border-orange-100 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                <Award className="w-5 h-5 text-orange-600" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 font-heading">الجبنة البلدية النابلسية</h4>
              <p className="text-xs text-slate-500">
                جبنة بلدية طازجة محلاة يدوياً يومياً لتعطي مطة سخية وتوازناً مثالياً مع القطر الخفيف.
              </p>
            </div>

            <div className="bg-orange-50/60 p-5 rounded-2xl border border-orange-100 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <Heart className="w-5 h-5 text-emerald-600" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 font-heading">التحضير الفوري</h4>
              <p className="text-xs text-slate-500">
                كل صحن يُخبز لحظة طلبه أمام الزبون ليصله في قمة سخونته ولذته.
              </p>
            </div>
          </div>

          <p className="pt-2">
            واليوم، أصبح محل كُومُر كُونافيه في رافدية محطة لعشاق الكنافة الأصلية الباحثين عن الطعم الحقيقي دون تصنّع، إلى جانب ابتكاراتنا المحبوبة مثل <strong>كنافة النوتيلا ع الفحم</strong> و<strong>نواشف العيد الموسمية</strong> المصنوعة بالسمن البلدي الصافي.
          </p>
        </div>

        {/* CTA */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-orange-600 font-bold">
            <MapPin className="w-4 h-4 text-orange-500" />
            <span>رافِدية - الشارع الرئيسي، نابلس، فلسطين</span>
          </div>

          <button
            onClick={() => onNavigate('menu')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-md hover:scale-105 transition-transform"
          >
            تذوق الكنافة ع الفحم اليوم
          </button>
        </div>

      </div>

    </div>
  );
};
