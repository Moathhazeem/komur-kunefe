import React from 'react';
import { Flame, Phone, MapPin, Clock, Facebook, Instagram, Share2, Shield } from 'lucide-react';
import { StoreSettings } from '../types';

interface FooterProps {
  settings: StoreSettings | null;
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate }) => {
  const shareWebsite = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Kömür Künefe — كنافة ع الفحم في رافدية',
        text: 'أطيب كنافة نابلسية مخبوزة على جمر الفحم الطبيعي في رافدية، نابلس!',
        url: window.location.origin + '?utm_source=share_button',
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.origin + '?utm_source=direct_copy');
      alert('تم نسخ رابط الموقع لمشاركته مع أصدقائك!');
    }
  };

  return (
    <footer className="bg-white border-t border-orange-100 text-slate-600 pt-12 pb-24 md:pb-12 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          
          {/* Col 1: Brand & Coal Philosophy */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-sm text-white">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-orange-600 font-heading">
                Kömür Künefe
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              المذاق النابلسي الأصيل مخبوز على جمر الفحم الطبيعي لحظة بلحظة. نستخدم أجود أنواع الجبنة البلدية النابلسية لنقدم لكم قرمشة ذهبية وطعمًا لا يُنسى.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={shareWebsite}
                className="flex items-center gap-1.5 text-xs bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 px-3 py-1.5 rounded-lg transition-colors font-semibold"
              >
                <Share2 className="w-3.5 h-3.5 text-orange-500" />
                <span>مشاركة الموقع مع الأصدقاء</span>
              </button>
            </div>
          </div>

          {/* Col 2: Location & Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-heading border-b border-orange-100 pb-2">
              الموقع والتواصل
            </h4>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <span className="text-slate-600">{settings?.branch || 'رافِدية - الشارع الرئيسي، نابلس، فلسطين'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-orange-500 shrink-0" />
                <a href={`tel:${settings?.phone || '+970562606061'}`} className="hover:text-orange-600 dir-ltr text-right font-medium text-slate-700">
                  {settings?.phone || '+970 562 606 061'}
                </a>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <span className="text-xs leading-relaxed text-slate-500">
                  {settings?.hours || 'يوميًا: 11:00 صباحًا – 12:00 منتصف الليل'}
                </span>
              </div>
            </div>
          </div>

          {/* Col 3: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-heading border-b border-orange-100 pb-2">
              روابط سريعة
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate('menu')} className="text-slate-600 hover:text-orange-600 transition-colors">
                  منيو الكنافة ع الفحم
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('offers')} className="text-slate-600 hover:text-orange-600 transition-colors">
                  عروض العيد ونهاية الأسبوع
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('story')} className="text-slate-600 hover:text-orange-600 transition-colors">
                  حكاية الفحم وسر الجبنة
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('reviews')} className="text-slate-600 hover:text-orange-600 transition-colors">
                  آراء وتجارب الزبائن
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="text-slate-600 hover:text-orange-600 transition-colors">
                  خريطة الموقع في رافدية
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Social & Follow */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-heading border-b border-orange-100 pb-2">
              تابعونا على السوشال ميديا
            </h4>
            <p className="text-xs text-slate-500">
              شاهدوا فيديوهات تحمير الكنافة المباشرة على الفحم والعروض اليومية عبر حساباتنا:
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href={settings?.instagramUrl || 'https://www.instagram.com/komurkunefe'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 hover:border-pink-500 flex items-center justify-center text-pink-600 hover:scale-110 transition-all shadow-xs"
                title="إنستغرام كُومُر كُونافيه"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={settings?.facebookUrl || 'https://www.facebook.com/Komurkunefe/'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 hover:border-blue-600 flex items-center justify-center text-blue-600 hover:scale-110 transition-all shadow-xs"
                title="فيسبوك كُومُر كُونافيه"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/970562606061"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 hover:border-emerald-500 flex items-center justify-center text-emerald-600 hover:scale-110 transition-all shadow-xs"
                title="واتساب مباشر"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('admin')}
                className="text-xs text-slate-400 hover:text-orange-600 flex items-center gap-1.5 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>دخول الإدارة وصاحب المحل</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>
            جميع الحقوق محفوظة © {new Date().getFullYear()} Kömür Künefe — كنافة ع الفحم | رافدية، نابلس.
          </p>
          <p className="flex items-center gap-1">
            <span>صُنع بحب لأهل نابلس وعشاق الكنافة الأصيلة</span>
            <Flame className="w-3.5 h-3.5 text-orange-500" />
          </p>
        </div>

      </div>
    </footer>
  );
};
