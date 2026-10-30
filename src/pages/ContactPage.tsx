import React from 'react';
import { MapPin, Phone, Clock, MessageSquare, Facebook, Instagram, Flame, ExternalLink } from 'lucide-react';
import { StoreSettings } from '../types';

interface ContactPageProps {
  settings: StoreSettings | null;
  onNavigate: (tab: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ settings, onNavigate }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 text-right space-y-12">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 bg-white text-orange-700 border border-orange-200 px-4 py-1.5 rounded-full text-xs font-bold shadow-xs">
          <MapPin className="w-4 h-4 text-orange-500" />
          <span>فرع واحد رئيسي في نابلس</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 font-heading">
          تواصل معنا وزُرنا في رافدية
        </h1>
        <p className="text-sm sm:text-base text-slate-500">
          يسعدنا استقبالكم في محلنا لتناول الكنافة مباشرة من فوق جمر الفحم، أو استلام طلباتكم أونلاين.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Contact Info Cards (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Location */}
          <div className="bg-white border border-orange-100 rounded-2xl p-5 space-y-2 shadow-xs">
            <div className="flex items-center gap-2.5 text-orange-600">
              <MapPin className="w-5 h-5 text-orange-500" />
              <h3 className="text-base font-bold text-slate-900 font-heading">عنوان المحل</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {settings?.branch || 'رافِدية - الشارع الرئيسي (نابلس، فلسطين)'}
            </p>
            <span className="text-xs text-slate-400 block">
              بجانب المحلات التجارية الرئيسية والمطاعم في رافدية.
            </span>
          </div>

          {/* Phone & WhatsApp */}
          <div className="bg-white border border-orange-100 rounded-2xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center gap-2.5 text-emerald-600">
              <Phone className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900 font-heading">الهاتف والواتساب</h3>
            </div>
            <div className="space-y-1">
              <span className="text-xl font-black text-slate-900 dir-ltr block text-right font-mono">
                {settings?.phone || '+970 562 606 061'}
              </span>
              <p className="text-xs text-slate-400">
                متاح يومياً للمكالمات والرسائل وحجز السدور.
              </p>
            </div>
            <div className="pt-1">
              <a
                href="https://wa.me/970562606061?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D9%88%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D9%83%D9%86%D8%A7%D9%81%D8%A9%20%D8%B9%20%D8%A7%D9%84%D9%81%D8%AD%D9%85"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>مراسلة واتساب فورية</span>
              </a>
            </div>
          </div>

          {/* Hours */}
          <div className="bg-white border border-orange-100 rounded-2xl p-5 space-y-2 shadow-xs">
            <div className="flex items-center gap-2.5 text-orange-600">
              <Clock className="w-5 h-5 text-orange-500" />
              <h3 className="text-base font-bold text-slate-900 font-heading">ساعات العمل والدوام</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {settings?.hours || 'يوميًا: 11:00 صباحًا – 12:00 منتصف الليل'}
            </p>
            <span className="text-xs text-slate-400 block">
              نستمر حتى ساعات متأخرة في عطلات نهاية الأسبوع ومواسم الأعياد ورمضان المبارك حتى السحور.
            </span>
          </div>

          {/* Social Links */}
          <div className="bg-white border border-orange-100 rounded-2xl p-5 space-y-3 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 font-heading">حسابات السوشال ميديا الرسمية</h3>
            <div className="grid grid-cols-2 gap-3">
              <a
                href={settings?.instagramUrl || 'https://www.instagram.com/komurkunefe'}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-pink-50 border border-pink-200 hover:border-pink-300 text-pink-700 flex items-center gap-2 text-xs font-bold transition-all"
              >
                <Instagram className="w-4 h-4 text-pink-600" />
                <span>إنستغرام المحل</span>
              </a>

              <a
                href={settings?.facebookUrl || 'https://www.facebook.com/Komurkunefe/'}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-blue-50 border border-blue-200 hover:border-blue-300 text-blue-700 flex items-center gap-2 text-xs font-bold transition-all"
              >
                <Facebook className="w-4 h-4 text-blue-600" />
                <span>فيسبوك المحل</span>
              </a>
            </div>
          </div>

        </div>

        {/* Embedded Interactive Map & Directions (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-orange-100 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-bold text-slate-900 font-heading">
                خريطة الموقع في رافدية - نابلس
              </h3>
            </div>
            <a
              href="https://maps.google.com/?q=Rafidia+Nablus+Palestine"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-orange-600 flex items-center gap-1 hover:underline font-bold"
            >
              <span>فتح في خرائط Google</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Embedded Google Map Iframe */}
          <div className="aspect-16/10 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 relative">
            <iframe
              title="موقع كُومُر كُونافيه في رافدية - نابلس"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src="https://maps.google.com/maps?q=32.2227,35.2345&hl=ar&z=15&output=embed"
            />
          </div>

          <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-0.5 text-xs text-slate-600">
              <strong className="text-slate-900 block font-bold">طلبك جاهز قبل وصولك!</strong>
              <span>يمكنك الطلب أونلاين عبر الموقع وتحديد موعد وصولك لنجهز سدر الكنافة ساخناً من على الفحم مباشرة.</span>
            </div>
            <button
              onClick={() => onNavigate('menu')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs shrink-0 shadow-md hover:scale-105 transition-transform"
            >
              اطلب أونلاين الآن
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
