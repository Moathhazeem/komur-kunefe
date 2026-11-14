import { BadgeCheck, ChevronDown, CirclePlay, Flame, Leaf, ShoppingBag, Truck } from 'lucide-react';

const benefits = [
  { Icon: Flame, label: 'كنافة على الجمر' },
  { Icon: Leaf, label: 'مكونات طبيعية' },
  { Icon: Truck, label: 'توصيل سريع' },
  { Icon: BadgeCheck, label: 'جودة عالية' },
];


interface HomeHeroProps {
  onNavigate: (tab: string) => void;
}

export function HomeHero({ onNavigate }: HomeHeroProps) {
  return (
    <section className="home-hero" aria-labelledby="home-title">
      <div className="home-hero-scene" aria-hidden="true">
        <picture>
          <source media="(max-width: 899px)" srcSet="/komur-hero-mobile.webp" />
          <img
            className="home-hero-photo"
            src="/komur-hero.webp"
            alt=""
            width={1672}
            height={941}
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        <div className="home-hero-shade" />
      </div>

      <div className="home-hero-inner">
        <div className="home-hero-copy">
          <p className="home-hero-eyebrow"><bdi lang="tr">KÖMÜR KÜNEFE</bdi></p>
          <h1 id="home-title">
            تجربة كنافة
            <strong>على الجمر</strong>
          </h1>
          <p className="home-hero-description">
            من قلب المذاق الأصيل، نقدّم لك كنافة نابلسية فاخرة محضّرة على الجمر بطريقتنا الخاصة.
          </p>
          <div className="home-hero-actions">
            <button type="button" className="home-order" onClick={() => onNavigate('menu')}>
              <ShoppingBag size={21} aria-hidden="true" />
              اطلب الآن
            </button>
            <button type="button" className="home-story" onClick={() => onNavigate('story')}>
              <CirclePlay size={21} aria-hidden="true" />
              اكتشف حكايتنا
            </button>
          </div>
          <ul className="home-benefits">
            {benefits.map(({ Icon, label }) => (
              <li key={label}><Icon aria-hidden="true" /><span>{label}</span></li>
            ))}
          </ul>
        </div>
      </div>

      <a className="home-hero-scroll" href="#home-featured" aria-label="عرض المنتجات المختارة">
        <ChevronDown size={23} aria-hidden="true" />
      </a>
    </section>
  );
}
