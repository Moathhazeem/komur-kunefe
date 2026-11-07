import React, { useState, useRef, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Minus, Star, MapPin,
  ThumbsUp, MessageCircle, Share2, Eye, Zap, Award, AlertTriangle,
  Target, Shield, ChevronDown, ChevronUp, Users, Tag, BarChart2,
  CheckCircle, XCircle, Lightbulb, Info, Flame, Layers, Sparkles
} from 'lucide-react';

// ─── Brand Design Tokens ─────────────────────────────────────────────────────
// Theme: Deep Charcoal (#1E293B / #0F172A), Slate Surfaces, Warm Ember Accents (#F97316 / #D97706)
// Strictly ZERO unnecessary blues, purples, or pinks to maintain brand unity.

interface SocialStats {
  avgLikes: number;
  totalLikes: number;
  avgComments: number;
  totalComments: number;
  avgShares: number;
  totalShares: number;
  avgViews: number;
  totalViews: number;
  postCount: number;
  contentStrategy: string;
  topHashtags: string[];
}

interface CompetitorOffer {
  title: string;
  description: string;
  badge: string;
  platform: string;
}

interface CompetitorSWOT {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

interface CompetitorProfile {
  id: string;
  nameAr: string;
  nameEn: string;
  locations: string[];
  rating: number;
  reviewCount: string;
  priceDelta: number; // percentage vs Kömür Künefe
  priceLabel: string;
  priceNote: string;
  equivalentKgPrice: number;
  priceTier: 'اقتصادي تنافسي' | 'متوسط-مرتفع' | 'مرتفع وفاخر';
  offers: CompetitorOffer[];
  swot: CompetitorSWOT;
  differentiators: string[];
  social: SocialStats;
  orderingPlatforms: string[];
}

// ─── Scraped Datasets ────────────────────────────────────────────────────────
const BASELINE_BRAND = {
  id: 'komur-kunefe',
  nameAr: 'كُومُر كُونافيه',
  nameEn: 'Kömür Künefe',
  tagline: 'كنافة على الفحم الطبيعي الحي',
  baselineKgPrice: 38,
  social: {
    avgLikes: 9.55,
    totalLikes: 191,
    avgComments: 1.50,
    totalComments: 15,
    avgShares: 0.30,
    totalShares: 6,
    avgViews: 1817.58,
    totalViews: 21811,
    postCount: 20,
    contentStrategy: 'ريلز التحضير الحي على جمر الفحم + إطلاق بقلاوة برغر بالبوظة + تغطية الفعاليات المدرسية ويوم التراث الفلسطيني',
    topHashtags: ['#كنافة_عالفحم', '#KömürKünefe', '#Nablus', '#بقلاوة_تركية'],
  },
  differentiators: [
    'التحضير الحصري والمباشر على الفحم الطبيعي الحي أمام الزبون في رفيديا',
    'ابتكار "بقلاوة برغر" المحشية بالبوظة التركية الفاخرة (صنف فريد في نابلس)',
    'تطبيق ويب متكامل للطلب المسبق، الاستلام السريع، واستطلاع التوصيل',
    'مساعد ذكي مدعوم بالذكاء الاصطناعي (AI Chatbot) لخدمة الزبائن وتحليل المبيعات',
    'هوية عصرية شبابية تجمع بين التراث النابلسي وأصالة الطريقة التركية'
  ]
};

const COMPETITORS: CompetitorProfile[] = [
  {
    id: 'osmali-sweets',
    nameAr: 'حلويات العصملي',
    nameEn: 'Osmali Sweets',
    locations: ['شارع رفيديا الرئيسي - نابلس'],
    rating: 4.6,
    reviewCount: '290+ تقييم (Wells & Yummy)',
    priceDelta: 5,
    priceLabel: 'متوسط إلى مرتفع (+5%)',
    priceNote: 'حجم L كنافة ناعمة ≈ 40 ₪، ونكهات الترند 55-75 ₪',
    equivalentKgPrice: 40,
    priceTier: 'متوسط-مرتفع',
    orderingPlatforms: ['Wells', 'Yummy'],
    offers: [
      {
        title: 'باقات الكنافة عبر تطبيقات التوصيل',
        description: 'متاح للطلب المباشر على منصتي Wells و Yummy مع مدة توصيل 50-60 دقيقة وإضافات Add-on (بوظة أو قشطة بـ +2 ₪).',
        badge: 'تطبيقات التوصيل',
        platform: 'Wells / Yummy'
      },
      {
        title: 'صواني الأفراح والمناسبات الخاصة',
        description: 'خدمة التحضير الميداني لصواني الكنافة في صالات الأفراح والأعراس مع مقاطع ريلز تسويقية لمشاركة الزبائن.',
        badge: 'أفراح ومناسبات',
        platform: 'مباشر / هاتف'
      },
      {
        title: 'حملة يوم التراث الفلسطيني الترويجية',
        description: 'ريلز احتفالية لترويج الهوية النابلسية وزيادة تفاعل المتابعين عبر مسابقات تفاعلية وترتيب الأصناف.',
        badge: 'موسمي وتراثي',
        platform: 'Facebook'
      }
    ],
    swot: {
      strengths: [
        'تخصص واضح بالكنافة على الفحم وتنوع عالي بالنكهات العصرية (لوتس، نوتيلا، بستاشيو)',
        'نظام أحجام مرن جداً يبدأ من XS (بـ 7 ₪) إلى XL (بـ 60-100 ₪) يناسب كافة الميزانيات',
        'محتوى سوشيال ميديا تفاعلي يحقق أعلى نسبة مشاركات (Shares) بين المنافسين (0.85 مشاركة/منشور)',
        'تواجد مزدوج على منصتي Wells و Yummy للتوصيل في نابلس',
        'منتج علامة فارق ومميز: "عصملية أبو سير" وكنافة الدايت'
      ],
      weaknesses: [
        'فرع وحيد فقط في رفيديا دون تغطية للأحياء الشرقية أو المخفية',
        'وقت توصيل طويل نسبياً عبر التطبيقات (50-60 دقيقة)',
        'رسوم توصيل مرتفعة (23 ₪ على تطبيق Wells)',
        'انخفاض معدل التعليقات التفاعلية المباشرة (1.0 تعليق في المتوسط)'
      ],
      opportunities: [
        'استقطاب جيل الشباب عبر النكهات الإبداعية (اللوتس والبستاشيو)',
        'إطلاق برامج اشتراكات أو ولاء للزبائن المتكررين في رفيديا',
        'التوسع نحو خدمات الكيترينج المتنقلة للمؤتمرات والجامعات'
      ],
      threats: [
        'المنافسة المباشرة في نفس شارع رفيديا مع كُومُر كُونافيه',
        'تفوق حلويات السرايا في معايير الجودة المؤسسية وشهادة ISO 22000',
        'تفوق أبو صالحة في الحضور الجغرافي والأسعار الاقتصادية للصواني الكبيرة'
      ]
    },
    differentiators: [
      'استعراض حي لتحضير صواني الكنافة على الفحم أمام الزبائن بالمحل',
      'ريادة إدخال نكهات الترند: لوتس، نوتيلا، بستاشيو، كيندر، وكنافة دايت',
      'ابتكار صنف "عصملية أبو سير" الشهير الغني بالقشطة والبوظة والمكسرات',
      'مرونة الأحجام الدقيقة من الحصة الفردية (XS) حتى الصواني العائلية (XL)'
    ],
    social: {
      avgLikes: 8.35,
      totalLikes: 167,
      avgComments: 1.00,
      totalComments: 3,
      avgShares: 0.85,
      totalShares: 17,
      avgViews: 2600.00,
      totalViews: 10400,
      postCount: 20,
      contentStrategy: 'أسئلة تفاعلية ومسابقات ومقارنات بين الأصناف + إبراز تنوع النكهات ولقطات تحضير الفحم',
      topHashtags: ['#عصملي', '#osmanli', '#كنافة_على_الفحم', '#حلويات_عربية_شرقية']
    }
  },
  {
    id: 'abu-salha-rafidia',
    nameAr: 'حلويات أبو صالحة',
    nameEn: 'Abu Salha Sweets',
    locations: ['فرع رفيديا', 'فرع المخفية', 'فرع دوار الحسين (وسط البلد)'],
    rating: 4.1,
    reviewCount: '417 تقييم Google',
    priceDelta: -8,
    priceLabel: 'اقتصادي وتنافسي (-8%)',
    priceNote: '35 ₪ / كيلو كنافة تقليدية، 18 ₪ لنصف الكيلو',
    equivalentKgPrice: 35,
    priceTier: 'اقتصادي تنافسي',
    orderingPlatforms: ['Wells', 'الطلب المباشر'],
    offers: [
      {
        title: 'خدمة التوصيل السريع عبر تطبيق Wells',
        description: 'توصيل في 30-45 دقيقة مع رسوم 20 ₪ فقط (الأقل تكلفة بين المنافسين)، مع تقييم 4.4 على التطبيق.',
        badge: 'توصيل اقتصادي',
        platform: 'Wells'
      },
      {
        title: 'عروض صواني الأفراح والضيافة الكبرى',
        description: 'باقات مخصصة لصواني الكنافة والحلويات الشرقية المشكلة بأسعار جملة تنافسية للأعراس والمناسبات العائلية.',
        badge: 'مناسبات وضيافة',
        platform: 'الفروع / هاتف'
      },
      {
        title: 'تشكيلة الشعبيات والنثريات اليومية',
        description: 'أسعار تبدأ من 10-12 ₪ لوقية أصابع الجوز، الوربات الشامية، الحلبة، العوامة، والقراريش المقرمشة.',
        badge: 'شعبيات يومية',
        platform: 'كافة الفروع'
      }
    ],
    swot: {
      strengths: [
        'الانتشار الجغرافي الأوسع في نابلس (3 فروع تغطي رفيديا، المخفية، ودوار الحسين)',
        'الأسعار الأكثر اقتصادية وتنافسية للكنافة التقليدية (35 ₪ للكيلو)',
        'تنوع ضخم في الحلويات الشرقية والشعبية النادرة (أكثر من 25 صنفاً مدرجاً)',
        'قاعدة زبائن شعبية وتاريخ ثقة عريق مع 417+ تقييم على Google',
        'أسرع مدة توصيل وأقل رسوم توصيل (30-45 دقيقة / 20 ₪)'
      ],
      weaknesses: [
        'التقييم العام الأدنى بين المنافسين (4.1 من 5 نجوم على Google)',
        'عدم التخصص في تجربة الشواء المباشر على الفحم (طرق تحضير تقليدية على الغاز)',
        'غياب الابتكارات الحديثة في نكهات الحلويات (التركيز الحصري على التقليدي)',
        'هوية بصرية ورقمية غير موحدة بين الفروع الثلاثة'
      ],
      opportunities: [
        'إطلاق خط كنافة مميز على الفحم لمواكبة التوجه الحالي للزبائن',
        'تطوير نظام طلب وتوصيل رقمي موحد خاص بالفروع',
        'استثمار كثافة الفروع في تقديم عروض اشتراكات للشركات والجامعات'
      ],
      threats: [
        'سحب حصة الكنافة الفاخرة من قبل كُومُر كُونافيه وعصملي بفضل تجربة الفحم الحي',
        'توجه فئة الشباب والطلاب نحو العلامات التجارية الأكثر عصرية وحداثة',
        'ضغوط ارتفاع أسعار المواد الخام مع التمسك بأسعار بيع شعبية منخفضة'
      ]
    },
    differentiators: [
      'أكبر شبكة فروع في نابلس (3 مواقع رئيسية في رفيديا والمخفية ودوار الحسين)',
      'الأسعار الأكثر تنافسية للكنافة النابلسية والصواني الكبرى في السوق المحلي',
      'حصرية تقديم أصناف شعبية تراثية نادرة: قراريش، أصابع زينب، حلبة، خدود الست',
      'الخيار الأول للضيافة الاجتماعية الكبرى وصواني الأعراس التقليدية'
    ],
    social: {
      avgLikes: 19.55,
      totalLikes: 391,
      avgComments: 1.73,
      totalComments: 19,
      avgShares: 0.25,
      totalShares: 5,
      avgViews: 5523.58,
      totalViews: 66283,
      postCount: 20,
      contentStrategy: 'مقاطع ريلز احترافية لتجهيز الصواني الكبيرة والمناسبات + استعراض التشكيلة التركية الفاخرة',
      topHashtags: ['#حلويات_أبو_صالحة', '#كنافة_نابلسية', '#حلويات_شرقية', '#نابلس']
    }
  },
  {
    id: 'al-saraya-sweets',
    nameAr: 'حلويات السرايا',
    nameEn: 'Al-Saraya Sweets',
    locations: ['فرع رفيديا - نابلس', 'فرع حوارة'],
    rating: 4.7,
    reviewCount: '500+ تقييم (أعلى تقييم)',
    priceDelta: 12,
    priceLabel: 'متوسط إلى مرتفع (+12%)',
    priceNote: '35 ₪ للكنافة الأساسية، وترتفع أصناف الفستق والملوكي حتى 100-150 ₪',
    equivalentKgPrice: 38,
    priceTier: 'مرتفع وفاخر',
    orderingPlatforms: ['Wells', 'متجر إلكتروني رسمي'],
    offers: [
      {
        title: 'خصومات حصرية عبر المتجر الإلكتروني',
        description: 'خصومات موسمية وخدمة طلب رقمي متكاملة عبر موقع المتجر الإلكتروني الرسمي لحلويات السرايا.',
        badge: 'أونلاين رسمي',
        platform: 'المتجر الإلكتروني'
      },
      {
        title: 'المشاركة في أسبوع الغذاء العالمي - أبوظبي 2026',
        description: 'تمثيل الحلويات الفلسطينية في Global Food Week بأبوظبي للترويج للمنتج الوطني في الأسواق الخليجية والدولية.',
        badge: 'حضور دولي 🌍',
        platform: 'معارض دولية'
      },
      {
        title: 'رعاية وتغطية معارض جامعة النجاح (إكسبو)',
        description: 'حضور رسمي وتوزيع عينات وضيافة في الفعاليات الجامعية والأكاديمية لتعزيز الحصة السوقية لدى الطلبة والأكاديميين.',
        badge: 'فعاليات محلية',
        platform: 'جامعة النجاح'
      }
    ],
    swot: {
      strengths: [
        'أعلى تقييم زبائن في السوق (4.7 من 5 نجوم على Google) وقاعدة مراجعات تتجاوز 500+ تقييم',
        'حيازة شهادة سلامة الغذاء العالمية المعتمدة ISO 22000:2018 (الوحيدة بين المنافسين)',
        'أعلى أداء تفاعل على فيسبوك: متوسط 49.80 إعجاب و13.78 تعليق و6,734 مشاهدة ريلز',
        'تواجد وتسويق دولي (المشاركة في معارض الإمارات 2026)',
        'موقع ومتجر إلكتروني احترافي وهوية بصرية مؤسسية فاخرة'
      ],
      weaknesses: [
        'أطول وقت توصيل مسجل على التطبيقات (55 إلى 70 دقيقة)',
        'أعلى رسوم توصيل (22 ₪) وأسعار مرتفعة للأصناف الفاخرة (تصل 150 ₪ للمشكل الملوكي)',
        'اقتصار الفروع على فرع رفيديا وفرع حوارة خارج المدينة',
        'عدم إبراز الكنافة على الفحم كعنصر هوية أساسي مقارنة بكُومُر وعصملي'
      ],
      opportunities: [
        'توسيع التصدير والشحن الخارجي لفلسطينيي الشتات والخليج اعتماداً على شهادة ISO',
        'عقد شراكات توريد مع فنادق نابلس والمطاعم السياحية الفاخرة',
        'إطلاق باقات هدايا وضيافة دبلوماسية للوفود الرسمية'
      ],
      threats: [
        'جذب كُومُر كُونافيه لشريحة الزبائن الباحثين عن تجربة الفحم الحي والابتكارات العصرية',
        'حساسية المستهلكين للأسعار في ظل الظروف الاقتصادية المحلية',
        'تأخر وقت التوصيل قد يدفع الزبائن لاختيار بدائل أسرع مثل أبو صالحة وكُومُر'
      ]
    },
    differentiators: [
      'المنشأة الوحيدة الحاصلة على شهادة الجودة والسلامة الغذائية ISO 22000:2018',
      'حضور دولي رسمي في معارض الأغذية العالمية (Global Food Week 2026)',
      'التقييم الأعلى والأكثر ثباتاً بين زبائن نابلس (4.7/5 من 500+ مراجعة)',
      'تكامل المنيو بين الأصناف التراثية والأصناف الغربية (تريليتشا، بيتي فور، كاتمر بالشوكولاتة)'
    ],
    social: {
      avgLikes: 49.80,
      totalLikes: 996,
      avgComments: 13.78,
      totalComments: 124,
      avgShares: 0.25,
      totalShares: 5,
      avgViews: 6734.86,
      totalViews: 47144,
      postCount: 20,
      contentStrategy: 'إنتاج مرئي سينمائي عالي الجودة للكلاج بالجبنة والمبرومة + تغطية المعارض الدولية وإبراز شهادات الجودة والمسابقات',
      topHashtags: ['#حلويات_السرايا', '#أصالة_الحلويات', '#كلاج_بالجبنة', '#نابلس']
    }
  }
];

// Combine all 4 for comprehensive Facebook comparison
const ALL_COMPETITORS_FOR_SOCIAL = [
  {
    id: BASELINE_BRAND.id,
    nameAr: BASELINE_BRAND.nameAr,
    nameEn: BASELINE_BRAND.nameEn,
    isBaseline: true,
    social: BASELINE_BRAND.social
  },
  ...COMPETITORS.map(c => ({
    id: c.id,
    nameAr: c.nameAr,
    nameEn: c.nameEn,
    isBaseline: false,
    social: c.social
  }))
];

export const CompetitorIntelligence: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'pricing' | 'offers' | 'social' | 'swot' | 'edge'>('overview');
  const [selectedSwotId, setSelectedSwotId] = useState<string>('osmali-sweets');
  const [socialMetric, setSocialMetric] = useState<'likes' | 'comments' | 'shares' | 'views'>('likes');
  const [expandedEdgeId, setExpandedEdgeId] = useState<string | null>('osmali-sweets');

  // Sub-tabs smooth scroll & drag state
  const subTabsContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);

  useEffect(() => {
    // Auto-scroll selected sub-tab into visible area
    const el = subTabsContainerRef.current;
    if (!el) return;
    const activeEl = el.querySelector('[data-active="true"]') as HTMLElement | null;
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeTab]);

  // Mouse drag handlers for desktop smooth dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = subTabsContainerRef.current;
    if (!el) return;
    setIsDragging(true);
    setStartX(e.pageX - el.offsetLeft);
    setScrollStart(el.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const el = subTabsContainerRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag sensitivity
    el.scrollLeft = scrollStart - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const selectedSwotCompetitor = COMPETITORS.find(c => c.id === selectedSwotId) || COMPETITORS[0];

  return (
    <div className="space-y-6 animate-fadeIn text-right" dir="rtl">

      {/* ─── Hero Banner (Warm Cream & Terracotta/Amber Brand Theme) ─── */}
      <div className="bg-white border border-amber-100 rounded-3xl p-6 sm:p-8 shadow-sm text-slate-900 relative overflow-hidden">
        <div className="absolute -left-12 -top-12 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-orange-500/15 text-orange-600 border border-orange-300/40 flex items-center justify-center">
                <Flame className="w-4 h-4 text-orange-600" />
              </span>
              <span className="text-xs font-bold text-orange-700 tracking-wider">
                ذكاء السوق والمنافسة المحلية | فرع رفيديا - نابلس
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight">
              تحليل المنافسين ومؤشرات السوق المحلي
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              دراسة مقارنة معمقة تعتمد على بيانات ميدانية وبيانات تطبيقات التوصيل (Wells, Yummy) وسجلات التفاعل الفعلي على Facebook لنوفمبر 2026 لمنافسينا الرئيسيين في نابلس.
            </p>
          </div>

          {/* Quick Snapshot KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/90 p-3.5 rounded-2xl border border-amber-200 shadow-sm shrink-0">
            <div className="px-3 py-2 text-center border-l border-amber-100 last:border-0">
              <span className="text-[10px] text-slate-500 block font-bold">المنافسون المشمولون</span>
              <span className="text-lg font-black text-slate-900 font-mono">3 رئيسيين</span>
            </div>
            <div className="px-3 py-2 text-center border-l border-amber-100 last:border-0">
              <span className="text-[10px] text-slate-500 block font-bold">خطنا المرجعي للكنافة</span>
              <span className="text-lg font-black text-orange-600 font-mono">38 ₪/كيلو</span>
            </div>
            <div className="px-3 py-2 text-center border-l border-amber-100 last:border-0">
              <span className="text-[10px] text-slate-500 block font-bold">منشورات فيسبوك المحللة</span>
              <span className="text-lg font-black text-amber-700 font-mono">80 منشور</span>
            </div>
            <div className="px-3 py-2 text-center">
              <span className="text-[10px] text-slate-500 block font-bold">أعلى تقييم بالسوق</span>
              <span className="text-lg font-black text-emerald-700 font-mono">4.7 / 5</span>
            </div>
          </div>
        </div>

        {/* ─── Scrollable & Interactive Sub-tabs Navigation Bar (Native Touch/Drag, Arrowless) ─── */}
        <div className="mt-6 pt-5 border-t border-amber-200/80 w-full">
          {/* Horizontal Scrollable Container (Touch, Wheel & Drag without side buttons) */}
          <div
            ref={subTabsContainerRef}
            onWheel={(e) => {
              if (subTabsContainerRef.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                subTabsContainerRef.current.scrollLeft += e.deltaY;
              }
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className={`flex items-center gap-2.5 overflow-x-auto flex-nowrap py-1.5 px-1 scrollbar-none touch-pan-x select-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            {[
              { id: 'overview', label: '1. البطاقات والمعلومات', icon: Users },
              { id: 'pricing', label: '2. تحليل الأسعار والمستويات', icon: BarChart2 },
              { id: 'offers', label: '3. شبكة العروض النشطة', icon: Tag },
    { id: 'social', label: '4. تحليلات وسائل التواصل الاجتماعي', icon: ThumbsUp },
              { id: 'swot', label: '5. مصفوفة SWOT المحلية', icon: Target },
              { id: 'edge', label: '6. متتبع نقاط التميز والفرادة', icon: Zap },
            ].map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  data-tab={tab.id}
                  data-active={active}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`shrink-0 flex min-h-[44px] items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border whitespace-nowrap cursor-pointer active:scale-95 ${
                    active
                    ? 'bg-orange-500 text-white border-orange-500 shadow-sm font-black'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:text-orange-600'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#DAB775]' : 'text-[#75675C]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── MODULE 1: Competitors Header & Info Card ─── */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {COMPETITORS.map(comp => (
              <div
                key={comp.id}
                className="bg-white border border-amber-100 hover:border-amber-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-4">
                  {/* Top Bar: Name & Platforms */}
                  <div className="flex items-start justify-between gap-2 border-b border-amber-100 pb-3">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 font-heading">
                        {comp.nameAr}
                      </h3>
                      <span className="text-[11px] text-slate-400 font-mono block">
                        {comp.nameEn}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#F7F0E5] text-slate-800 border border-amber-200 shrink-0">
                      {comp.priceTier}
                    </span>
                  </div>

                  {/* Public Ratings Card */}
                  <div className="bg-[#F7F0E5]/70 p-3.5 rounded-2xl border border-amber-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black">
                        <Star className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-base font-black text-slate-900 font-mono">
                            {comp.rating.toFixed(1)}
                          </span>
                          <span className="text-xs text-slate-500">/ 5.0</span>
                        </div>
                        <span className="text-[10px] text-slate-600 block font-medium">
                          {comp.reviewCount}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-amber-200">
                      {comp.rating >= 4.6 ? 'ممتاز جداً ★' : 'جيد جداً'}
                    </span>
                  </div>

                  {/* Locations & Branches */}
                  <div className="space-y-1.5 text-xs">
                    <span className="text-slate-500 font-bold block text-[11px]">الفروع والمواقع في نابلس:</span>
                    {comp.locations.map((loc, i) => (
                      <div key={i} className="flex items-center gap-2 text-slate-800 font-medium bg-[#F7F0E5]/50 p-2 rounded-xl border border-amber-100/60">
                        <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                        <span>{loc}</span>
                      </div>
                    ))}
                  </div>

                  {/* Ordering Channels */}
                  <div className="space-y-1.5 text-xs">
                    <span className="text-slate-500 font-bold block text-[11px]">قنوات الطلب والتوصيل:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {comp.orderingPlatforms.map((plat, idx) => (
                        <span key={idx} className="bg-white text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-amber-200/80">
                          {plat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Price baseline note */}
                <div className="pt-3 border-t border-amber-100 flex items-center justify-between text-xs text-slate-600">
                  <span>سعر كيلو الكنافة المقدر:</span>
                  <span className="font-mono font-black text-slate-900">{comp.equivalentKgPrice} ₪</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── MODULE 2: Relative Pricing Analysis ─── */}
      {activeTab === 'pricing' && (
        <div className="bg-white border border-amber-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">
                مؤشر ومقياس الأسعار النسبي (مقارنة بـ كُومُر كُونافيه)
              </h3>
              <p className="text-xs text-slate-500">
                مقارنة سعر كيلو الكنافة الكلاسيكية وتوزيع الفئات السعرية بالنسبة لخطنا المرجعي (38 ₪/كيلو)
              </p>
            </div>
            <span className="px-3 py-1.5 rounded-xl bg-[#F7F0E5] text-orange-800 border border-amber-200 font-bold text-xs self-start sm:self-auto">
              خط الأساس: 38 ₪ (كُومُر ع الفحم)
            </span>
          </div>

          {/* Pricing Comparison Bars */}
          <div className="space-y-5">
            {/* Our Baseline Bar */}
            <div className="p-4 rounded-2xl bg-[#F7F0E5] text-slate-900 border-2 border-amber-300 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                  <span className="font-black font-heading text-slate-900">{BASELINE_BRAND.nameAr} (خط الأساس المرجعي)</span>
                  <span className="text-[10px] bg-orange-600 text-white px-2 py-0.5 rounded-md font-bold">فرعنا</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-mono">0% (Baseline)</span>
                  <span className="font-black font-mono text-orange-700 text-base">{BASELINE_BRAND.baselineKgPrice} ₪ / كيلو</span>
                </div>
              </div>
              <div className="w-full bg-amber-200/60 h-3 rounded-full overflow-hidden">
                <div className="bg-[#C7652D] h-full rounded-full w-[70%]" />
              </div>
            </div>

            {/* Competitors Bars */}
            {COMPETITORS.map(c => {
              const isHigher = c.priceDelta > 0;
              const isLower = c.priceDelta < 0;
              // Bar width relative to baseline (70% = 38 NIS)
              const barWidth = Math.min(100, Math.max(20, 70 + (c.priceDelta * 1.5)));

              return (
                <div key={c.id} className="p-4 rounded-2xl bg-white border border-amber-200/70 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{c.nameAr}</span>
                      <span className="text-xs text-slate-500">({c.priceTier})</span>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <span className={`inline-flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-md border ${
                        isHigher
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : isLower
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}>
                        {isHigher && <TrendingUp className="w-3 h-3" />}
                        {isLower && <TrendingDown className="w-3 h-3" />}
                        {!isHigher && !isLower && <Minus className="w-3 h-3" />}
                        {isHigher ? `+${c.priceDelta}% أغلـى` : isLower ? `${c.priceDelta}% أرخـص` : 'مماثل'}
                      </span>
                      <span className="font-black font-mono text-slate-900 text-base">
                        {c.equivalentKgPrice} ₪ / كيلو
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-[#F7F0E5] h-2.5 rounded-full overflow-hidden border border-amber-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHigher ? 'bg-[#C7652D]' : 'bg-[#DAB775]'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 pt-1">
                    {c.priceNote}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Pricing Strategy Insights */}
          <div className="p-4 rounded-2xl bg-[#F7F0E5]/80 border border-amber-200 text-xs text-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Info className="w-4 h-4 text-amber-700" />
              <span>الاستنتاج التسعيري للمحل:</span>
            </div>
            <p className="leading-relaxed">
              • سعر كُومُر كُونافيه (38 ₪) يتمركز في النقطة المثالية بين سعر أبو صالحة الشعبي (35 ₪) وجودة السرايا المرتفعة.
              نظراً لأننا نقدم الكنافة مشوية على <strong>الفحم الطبيعي الحي</strong>، فإن فارق الـ 3 شواكل عن السعر الشعبي يمثل قيمة مضافة حقيقية ومبررة بالكامل لدى الزبون، بينما نبقى أقل تكلفة من الأصناف الخاصة لدى عصملي والسرايا التي تصل لـ 55-75 ₪.
            </p>
          </div>
        </div>
      )}

      {/* ─── MODULE 3: Active Offers & Promotions Cards Grid ─── */}
      {activeTab === 'offers' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COMPETITORS.map(comp => (
                <div key={comp.id} className="bg-white border border-amber-100 rounded-3xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                      <h4 className="font-black text-slate-900 text-base font-heading">
                        {comp.nameAr}
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-600 font-mono bg-[#F7F0E5] px-2 py-0.5 rounded-md border border-amber-100">
                      {comp.offers.length} عروض مرصودة
                    </span>
                  </div>

                  {/* Offers List */}
                  <div className="space-y-3">
                    {comp.offers.map((offer, idx) => (
                      <div key={idx} className="bg-white border border-amber-200/70 rounded-2xl p-3.5 space-y-2 hover:bg-[#F7F0E5]/30 transition-colors shadow-2xs">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-slate-900 text-xs font-heading leading-tight">
                            {offer.title}
                          </span>
                          <span className="bg-[#F7F0E5] text-orange-900 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0">
                            {offer.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {offer.description}
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-amber-100 text-[10px] text-slate-400">
                          <span>المنصة / القناة:</span>
                          <span className="font-bold text-slate-700">{offer.platform}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-400 text-center">
                  المصدر: رصد الحملات الرقمية وتطبيقات Wells و Yummy
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── MODULE 4: Social Media Analytics Dashboard ─── */}
      {activeTab === 'social' && (
        <div className="bg-white border border-amber-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">
                تحليلات وسائل التواصل الاجتماعي
              </h3>
              <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="منصات التواصل الاجتماعي">
                <span className="rounded-lg border border-orange-600 bg-orange-600 px-3 py-1.5 text-xs font-bold text-white">Facebook</span>
                <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500">Instagram · قريباً</span>
                <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500">TikTok · قريباً</span>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-amber-200 bg-[#F7F0E5] p-4"><p className="text-xs font-bold text-slate-600">معدل التفاعل من المشاهدات</p><p className="mt-2 text-2xl font-black text-[#17120F]">{(((BASELINE_BRAND.social.avgLikes + BASELINE_BRAND.social.avgComments + BASELINE_BRAND.social.avgShares) / BASELINE_BRAND.social.avgViews) * 100).toFixed(2)}%</p><p className="mt-1 text-[11px] text-slate-500">إعجابات وتعليقات ومشاركات لكل مشاهدة</p></div>
                <div className="rounded-2xl border border-amber-200 bg-[#F7F0E5] p-4"><p className="text-xs font-bold text-slate-600">نمو المتابعين</p><p className="mt-2 text-lg font-black text-slate-700">بانتظار ربط بيانات المنصة</p><p className="mt-1 text-[11px] text-slate-500">سيظهر هنا عند توصيل Instagram أو TikTok</p></div>
                <div className="rounded-2xl border border-amber-200 bg-[#F7F0E5] p-4"><p className="text-xs font-bold text-slate-600">أداء المنشورات</p><p className="mt-2 text-2xl font-black text-[#17120F]">{BASELINE_BRAND.social.postCount}</p><p className="mt-1 text-[11px] text-slate-500">منشوراً · متوسط {BASELINE_BRAND.social.avgViews.toLocaleString('ar-EG-u-nu-latn', { maximumFractionDigits: 0 })} مشاهدة</p></div>
              </div>
              <p className="text-xs text-slate-500">
                مقارنة شاملة لـ 20 منشور مرصود لكل منشأة (إجمالي 80 منشور مسحوب من فيسبوك)
              </p>
            </div>

            {/* Metric Switcher Tabs */}
            <div className="flex flex-nowrap items-center gap-2.5 overflow-x-auto border-b border-amber-200/60 px-1 pb-3 pt-1 scrollbar-none touch-pan-x">
              {[
                { id: 'likes', label: 'متوسط الإعجابات', icon: ThumbsUp },
                { id: 'comments', label: 'متوسط التعليقات', icon: MessageCircle },
                { id: 'shares', label: 'متوسط المشاركات', icon: Share2 },
                { id: 'views', label: 'مشاهدات الريلز', icon: Eye },
              ].map(m => {
                const Icon = m.icon;
                const active = socialMetric === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSocialMetric(m.id as any)}
                    className={`group flex shrink-0 min-h-[44px] items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border cursor-pointer active:scale-95 ${
                      active
                    ? 'bg-orange-500 text-white border-orange-500 shadow-sm font-black'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:text-orange-600'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#DAB775]' : 'text-slate-500'}`} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Social Chart Visualization (Comparing all 4) */}
          <div className="space-y-4">
            {ALL_COMPETITORS_FOR_SOCIAL.map(entity => {
              // Calculate value based on selected metric
              let metricValue = 0;
              let metricSuffix = '';
              let totalValue = 0;

              if (socialMetric === 'likes') {
                metricValue = entity.social.avgLikes;
                totalValue = entity.social.totalLikes;
                metricSuffix = 'إعجاب / منشور';
              } else if (socialMetric === 'comments') {
                metricValue = entity.social.avgComments;
                totalValue = entity.social.totalComments;
                metricSuffix = 'تعليق / منشور';
              } else if (socialMetric === 'shares') {
                metricValue = entity.social.avgShares;
                totalValue = entity.social.totalShares;
                metricSuffix = 'مشاركة / منشور';
              } else {
                metricValue = entity.social.avgViews;
                totalValue = entity.social.totalViews;
                metricSuffix = 'مشاهدة فيديو';
              }

              // Determine max for bar width calculation
              const allValues = ALL_COMPETITORS_FOR_SOCIAL.map(e => {
                if (socialMetric === 'likes') return e.social.avgLikes;
                if (socialMetric === 'comments') return e.social.avgComments;
                if (socialMetric === 'shares') return e.social.avgShares;
                return e.social.avgViews;
              });
              const maxVal = Math.max(...allValues, 1);
              const barPercent = Math.max(8, Math.round((metricValue / maxVal) * 100));

              return (
                <div
                  key={entity.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    entity.isBaseline
                      ? 'bg-[#F4DFD0] text-[#35241A] border-[#E6A16F] shadow-sm'
                      : 'bg-white text-slate-800 border-amber-100'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
                    <div className="flex items-center gap-2">
                      {entity.isBaseline && (
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                      )}
                      <span className="font-bold font-heading">{entity.nameAr}</span>
                      {entity.isBaseline && (
                        <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          علامتنا
                        </span>
                      )}
                      <span className={`text-[11px] font-mono ${entity.isBaseline ? 'text-amber-900' : 'text-slate-500'}`}>
                        (20 منشور مسحوب)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] opacity-75 font-mono hidden sm:inline">
                         إجمالي: {totalValue.toLocaleString('ar-EG-u-nu-latn')}
                      </span>
                      <span className={`font-mono font-black text-base ${entity.isBaseline ? 'text-orange-700' : 'text-slate-900'}`}>
                        {metricValue.toFixed(socialMetric === 'shares' || socialMetric === 'comments' ? 2 : 1)}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {metricSuffix}
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full h-3 rounded-full overflow-hidden bg-[#FBF8F2]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        entity.isBaseline
                          ? 'bg-[#C7652D]'
                          : 'bg-[#DAB775]'
                      }`}
                      style={{ width: `${barPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Side-by-Side Comparison Table */}
          <div className="overflow-x-auto rounded-2xl border border-amber-200">
            <table className="w-full text-xs text-right divide-y divide-amber-200">
              <thead className="bg-[#F7F0E5] text-slate-800 font-bold font-heading">
                <tr>
                  <th className="py-3 px-4">المنشأة</th>
                  <th className="py-3 px-3 text-center">المنشورات</th>
                  <th className="py-3 px-3 text-center">متوسط الإعجابات</th>
                  <th className="py-3 px-3 text-center">متوسط التعليقات</th>
                  <th className="py-3 px-3 text-center">متوسط المشاركات</th>
                  <th className="py-3 px-3 text-center">مشاهدات الريلز</th>
                  <th className="py-3 px-4">استراتيجية المحتوى الرئيسية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100 text-slate-700 bg-white">
                {ALL_COMPETITORS_FOR_SOCIAL.map(e => (
                  <tr key={e.id} className={e.isBaseline ? 'bg-[#F7F0E5]/40 font-bold' : 'hover:bg-[#FDFBF7]'}>
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                      {e.isBaseline && <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0" />}
                      <span>{e.nameAr}</span>
                      {e.isBaseline && (
                        <span className="text-[10px] bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">نحن</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono">{e.social.postCount}</td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-900">{e.social.avgLikes.toFixed(1)}</td>
                    <td className="py-3.5 px-3 text-center font-mono text-slate-800">{e.social.avgComments.toFixed(2)}</td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-900">
                      {e.social.avgShares.toFixed(2)}
                      {e.social.avgShares >= 0.8 && (
                        <span className="text-[9px] block text-amber-700 font-bold">الأعلى مشاركة</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-slate-800">
                       {e.social.avgViews.toLocaleString('ar-EG-u-nu-latn', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-600 leading-relaxed max-w-xs">
                      {e.social.contentStrategy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Social Insights Callout */}
          <div className="p-4 rounded-2xl bg-[#F7F0E5]/80 text-slate-800 text-xs space-y-2 border-2 border-amber-200 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>خلاصة ذكاء السوشيال ميديا للمحل:</span>
            </div>
            <p className="leading-relaxed text-slate-700">
              1. <strong>المشاركات (Shares):</strong> حلويات العصملي يتصدر في معدل المشاركات (0.85 مشاركة للمنشور) بفضل أسلوب المنشورات التفاعلية (مثل: "اعمل منشن للي بيعرف يختار"، ومسابقات الاختيار). يُنصح بتبني هذا النمط في حساب كُومُر.
            </p>
            <p className="leading-relaxed text-slate-700">
              2. <strong>المشاهدات والتعليقات:</strong> حلويات السرايا تحقق أعلى تفاعل بفضل الإنتاج المرئي عالي الدقة وتغطية المعارض. في المقابل، حققت مقاطع كُومُر التراثية في مدرسة الراهبات 82 إعجاباً وأكثر من 4,900 مشاهدة، مما يثبت أن ريلز "الكنافة عالفحم" المباشرة تملك جاذبية انتشار عالية جداً في مجتمع نابلس.
            </p>
          </div>
        </div>
      )}

      {/* ─── MODULE 5: SWOT Analysis Grid for Competitors ─── */}
      {activeTab === 'swot' && (
        <div className="bg-white border border-amber-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
          {/* Header & Competitor Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">
                مصفوفة SWOT التحليلية للمنافسين في سوق نابلس
              </h3>
              <p className="text-xs text-slate-500">
                اختر المنافس لاستعراض نقاط القوة والضعف والفرص والتهديدات الخاصة به
              </p>
            </div>

            {/* Competitor Selector Pills */}
            <div className="flex flex-nowrap items-center gap-2 overflow-x-auto border-b border-amber-200/60 px-1 pb-3 pt-1 scrollbar-none touch-pan-x">
              {COMPETITORS.map(comp => (
                <button
                  key={comp.id}
                  onClick={() => setSelectedSwotId(comp.id)}
                  className={`group shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border cursor-pointer ${
                    selectedSwotId === comp.id
                      ? 'bg-orange-500 text-white border-orange-500 shadow-sm font-black'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:text-orange-600'
                  }`}
                >
                  {comp.nameAr}
                </button>
              ))}
            </div>
          </div>

          {/* 2x2 SWOT Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Strengths */}
            <div className="bg-white border border-emerald-200/80 rounded-2xl p-5 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-900 font-bold font-heading border-b border-emerald-100 pb-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span>نقاط القوة (Strengths)</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                {selectedSwotCompetitor.swot.strengths.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-white border border-rose-200/80 rounded-2xl p-5 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-900 font-bold font-heading border-b border-rose-100 pb-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-700 flex items-center justify-center">
                  <XCircle className="w-4 h-4" />
                </div>
                <span>نقاط الضعف (Weaknesses)</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                {selectedSwotCompetitor.swot.weaknesses.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Opportunities */}
            <div className="bg-white border border-amber-200/80 rounded-2xl p-5 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-900 font-bold font-heading border-b border-amber-100 pb-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <span>الفرص (Opportunities)</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                {selectedSwotCompetitor.swot.opportunities.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Threats */}
            <div className="bg-white border border-amber-200/80 rounded-2xl p-5 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-900 font-bold font-heading border-b border-amber-100 pb-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-slate-700 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <span>التهديدات (Threats)</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                {selectedSwotCompetitor.swot.threats.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODULE 6: Competitive Edge / Differentiation Tracker ─── */}
      {activeTab === 'edge' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Our Core Edge (Kömür Künefe) */}
          <div className="bg-gradient-to-br from-amber-50 via-[#F7F0E5] to-orange-50/70 text-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/15 text-orange-600 border border-orange-300/40 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black font-heading text-slate-900">
                    ميزاتنا التنافسية الحصرية (Kömür Künefe Edge)
                  </h3>
                  <p className="text-xs text-slate-600">
                    عناصر التميز الفريدة التي لا يملكها أي منافس في نابلس
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-orange-600 text-white text-xs font-black shadow-sm">
                مركز قوتنا
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {BASELINE_BRAND.differentiators.map((diff, idx) => (
                <div key={idx} className="bg-white/95 border border-amber-200/90 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                  <span className="w-6 h-6 rounded-lg bg-orange-500/15 text-orange-700 text-xs font-black flex items-center justify-center shrink-0 border border-orange-200">
                    {idx + 1}
                  </span>
                  <span className="text-xs text-slate-800 leading-relaxed font-bold">
                    {diff}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Competitor Differentiation Profiles */}
          <div className="space-y-3">
            {COMPETITORS.map(comp => {
              const isOpen = expandedEdgeId === comp.id;
              return (
                <div
                  key={comp.id}
                className="bg-white border border-amber-100 rounded-3xl overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setExpandedEdgeId(isOpen ? null : comp.id)}
                    className="w-full flex items-center justify-between p-5 text-right hover:bg-[#F7F0E5]/60 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#F7F0E5] text-slate-800 flex items-center justify-center font-bold border border-amber-200/60">
                        <Zap className="w-4 h-4 text-amber-700" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-base font-heading">
                            {comp.nameAr}
                          </h4>
                          <span className="text-xs text-slate-400">({comp.differentiators.length} ركائز تميز)</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          بماذا ينفرد هذا المنافس وما هو المحور التسويقي الذي يرتكز عليه؟
                        </p>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-white text-slate-600 border border-amber-200/60">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 border-t border-amber-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                        {comp.differentiators.map((item, i) => (
                          <div key={i} className="p-3.5 rounded-2xl bg-white border border-amber-200/70 flex items-start gap-2.5 text-xs text-slate-800 shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                            <span className="leading-relaxed font-medium">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Strategic Decision Recommendation Card */}
          <div className="bg-[#F7F0E5]/80 border-2 border-amber-300 rounded-3xl p-6 text-slate-800 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-amber-900 font-bold font-heading text-sm">
              <Shield className="w-5 h-5 text-orange-600" />
              <span>التوجيه الاستراتيجي لصاحب المحل وطاقم الإدارة:</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
              <div className="bg-white/95 p-3.5 rounded-2xl border border-amber-200/90 space-y-1 shadow-sm">
                <span className="font-bold text-slate-900 block">ضد حلويات العصملي:</span>
                <p className="text-slate-600 leading-relaxed">
                  التركيز على تفوق "الفحم الطبيعي الصافي" الخاص بنا ونظافة التحضير، ومنافسة نكهات الترند بإدخال باقة بستاشيو ولوتس حصرية للكنافة المحيرة.
                </p>
              </div>
              <div className="bg-white/95 p-3.5 rounded-2xl border border-amber-200/90 space-y-1 shadow-sm">
                <span className="font-bold text-slate-900 block">ضد حلويات أبو صالحة:</span>
                <p className="text-slate-600 leading-relaxed">
                  عدم الدخول في حرب أسعار للصواني الكبرى؛ الحفاظ على فارق الـ 3 شواكل كتعبير عن "فحم فاخر" مع التركيز على راحة وسرعة خدمة الاستلام بالمحل.
                </p>
              </div>
              <div className="bg-white/95 p-3.5 rounded-2xl border border-amber-200/90 space-y-1 shadow-sm">
                <span className="font-bold text-slate-900 block">ضد حلويات السرايا:</span>
                <p className="text-slate-600 leading-relaxed">
                  استغلال بطء التوصيل لديهم (55-70 دقيقة) بالترويج لسرعة التحضير على الفحم في 15 دقيقة وسرعة تسليم الطلبات للزبائن المتواجدين في رفيديا.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
