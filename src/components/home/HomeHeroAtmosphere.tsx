import { useId } from 'react';

type Variant = 'mobile' | 'desktop';

// Artwork coordinates are authored against the existing responsive hero photos.
const composition = {
  mobile: {
    viewBox: '0 0 900 682',
    steam: 'translate(258 292) scale(.88)',
    syrup: 'translate(665 198) scale(.77)',
    glow: { cx: 748, cy: 273, rx: 180, ry: 110 },
  },
  desktop: {
    viewBox: '0 0 1648 928',
    steam: 'translate(982 411) scale(1.12)',
    syrup: 'translate(1401 328) scale(1.02)',
    glow: { cx: 1514, cy: 428, rx: 205, ry: 132 },
  },
} as const;

export function HomeHeroAtmosphere({ variant }: { variant: Variant }) {
  const id = `komur-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const art = composition[variant];
  const steam = `${id}-steam`;
  const amber = `${id}-amber`;
  const glow = `${id}-glow`;
  return (
    <svg className={`home-hero-atmosphere home-hero-atmosphere--${variant}`}
      viewBox={art.viewBox} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={steam} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ffddbb" stopOpacity="0" />
          <stop offset=".28" stopColor="#f0d9c6" stopOpacity=".38" />
          <stop offset=".68" stopColor="#e7d8ce" stopOpacity=".24" />
          <stop offset="1" stopColor="#e7d8ce" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={amber} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#a74d0b" stopOpacity=".75" />
          <stop offset=".38" stopColor="#ffe7a0" />
          <stop offset=".67" stopColor="#e6a132" />
          <stop offset="1" stopColor="#a44c0b" stopOpacity=".8" />
        </linearGradient>
        <radialGradient id={glow}>
          <stop stopColor="#ff9c40" stopOpacity=".16" />
          <stop offset="1" stopColor="#ff9c40" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse className="home-hero-fire-glow" {...art.glow} fill={`url(#${glow})`} />
      <g transform={art.steam} fill="none" stroke={`url(#${steam})`} strokeLinecap="round">
        <g className="home-hero-vapor home-hero-vapor--one">
          <path d="M-12 0 C-29 -30 22 -45 2 -80 S-24 -122 8 -151 S31 -192 6 -220" strokeWidth="13" />
          <path d="M-12 0 C-29 -30 22 -45 2 -80 S-24 -122 8 -151 S31 -192 6 -220" strokeWidth="3" opacity=".65" />
        </g>
        <g className="home-hero-vapor home-hero-vapor--two">
          <path d="M26 2 C47 -24 12 -57 39 -86 S22 -130 38 -158" strokeWidth="9" opacity=".66" />
        </g>
      </g>
      <g transform={art.syrup}>
        {/* A small syrup drip from the lifted bite, not a simulated liquid pour. */}
        <path className="home-hero-syrup-thread" d="M0 0 C3 7 0 14 -2 24" fill="none"
          stroke={`url(#${amber})`} strokeWidth="2.7" strokeLinecap="round" />
        <g className="home-hero-syrup-drop">
          <path d="M0 0 C-1.6 5 -4.8 7 -4.8 11 A4.8 5 0 0 0 4.8 11 C4.8 7 1.6 5 0 0Z" fill={`url(#${amber})`} />
          <path d="M-1.7 7 L-2.1 10" stroke="#fff3c6" strokeWidth=".9" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}
