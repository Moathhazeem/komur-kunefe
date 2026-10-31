import React from 'react';
import { Clock3, Facebook, Flame, Instagram, MapPin, Phone, Share2 } from 'lucide-react';
import { StoreSettings } from '../types';

interface FooterProps { settings: StoreSettings | null; onNavigate: (tab: string) => void; }

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate }) => {
  const shareWebsite = () => {
    if (navigator.share) navigator.share({ title: 'كُومُر كُونافيه', text: 'كنافة نابلسية على جمر الفحم في رافدية', url: window.location.origin }).catch(() => {});
    else { navigator.clipboard?.writeText(window.location.origin); alert('تم نسخ رابط الموقع'); }
  };
  return (
    <footer className="border-t border-[#DAB775]/15 bg-[#17120F] pb-24 pt-14 text-[#D5C7B9] md:pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C7652D] text-white"><Flame className="h-5 w-5" /></span><span className="text-xl font-black text-[#F7F0E5]">كُومُر كُونافيه</span></div><p className="mt-5 text-sm leading-8 text-[#A99B90]">المذاق النابلسي الأصيل مخبوز على جمر الفحم الطبيعي لحظة بلحظة.</p><button type="button" onClick={shareWebsite} className="mt-4 flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-[#DAB775] hover:border-[#DAB775]/50"><Share2 className="h-3.5 w-3.5" /> شارك الموقع</button></div>
          <div><h3 className="text-sm font-black text-[#F7F0E5]">الموقع والتواصل</h3><div className="mt-5 space-y-4 text-sm"><div className="flex items-start gap-3"><MapPin className="mt-1 h-4 w-4 shrink-0 text-[#DAB775]" /><span>{settings?.branch || 'رافدية - الشارع الرئيسي، نابلس، فلسطين'}</span></div><div className="flex items-center gap-3"><Phone className="h-4 w-4 shrink-0 text-[#DAB775]" /><a href={`tel:${settings?.phone || '+970562606061'}`} className="hover:text-[#DAB775]">{settings?.phone || '+970 562 606 061'}</a></div><div className="flex items-start gap-3"><Clock3 className="mt-1 h-4 w-4 shrink-0 text-[#DAB775]" /><span className="text-xs leading-6">{settings?.hours || 'يوميًا: 11:00 صباحًا – 12:00 منتصف الليل'}</span></div></div></div>
          <div><h3 className="text-sm font-black text-[#F7F0E5]">روابط سريعة</h3><div className="mt-5 space-y-3 text-sm">{[['menu', 'المنيو'], ['offers', 'العروض'], ['story', 'حكاية الجمر'], ['reviews', 'آراء الزبائن'], ['contact', 'زورونا']].map(([id, label]) => <button key={id} type="button" onClick={() => onNavigate(id)} className="block text-[#A99B90] hover:text-[#DAB775]">{label}</button>)}</div></div>
          <div><h3 className="text-sm font-black text-[#F7F0E5]">خلّيك قريب</h3><p className="mt-5 text-sm leading-7 text-[#A99B90]">تابعوا تحمير الكنافة والعروض اليومية عبر حساباتنا.</p><div className="mt-4 flex gap-2"><a href={settings?.instagramUrl || 'https://www.instagram.com/komurkunefe'} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-[#DAB775] hover:border-[#DAB775]/50"><Instagram className="h-4 w-4" /></a><a href={settings?.facebookUrl || 'https://www.facebook.com/Komurkunefe/'} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-[#DAB775] hover:border-[#DAB775]/50"><Facebook className="h-4 w-4" /></a><a href={`https://wa.me/${settings?.whatsapp || '970562606061'}`} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-[#77D6A6] hover:border-[#77D6A6]/50"><Phone className="h-4 w-4" /></a></div></div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-[#75675C] sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} Kömür Künefe — رافدية، نابلس</span><span className="flex items-center gap-1">من الجمر، إلى قلبك <Flame className="h-3.5 w-3.5 text-[#C7652D]" /></span></div>
      </div>
    </footer>
  );
};
