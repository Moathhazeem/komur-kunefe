import { useId } from 'react';

type Variant = 'mobile' | 'desktop';

// Coordinates correspond to the actual existing WebP plates, not the viewport.
const plates = {
  mobile: { viewBox: '0 0 900 682', vapor: 'translate(265 296) scale(.92)', pour: 'translate(680 190) scale(.85)', oven: { cx: 773, cy: 267, rx: 165, ry: 133 }, coals: { cx: 412, cy: 547, rx: 226, ry: 29 }, copper: 'translate(396 459) scale(.83)' },
  desktop: { viewBox: '0 0 1648 928', vapor: 'translate(984 419) scale(1.25)', pour: 'translate(1404 321) scale(1.03)', oven: { cx: 1519, cy: 390, rx: 175, ry: 140 }, coals: { cx: 1081, cy: 692, rx: 260, ry: 37 }, copper: 'translate(1090 598) scale(1.1)' },
} as const;

export function HomeHeroAtmosphere({ variant }: { variant: Variant }) {
  const uid = `komur-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const plate = plates[variant];
  const ref = (name: string) => `url(#${uid}-${name})`;
  return (
    <svg className={`home-hero-atmosphere home-hero-atmosphere--${variant}`}
      viewBox={plate.viewBox} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${uid}-heat`}>
          <stop stopColor="#ffb35e" stopOpacity=".32" />
          <stop offset=".48" stopColor="#ee681a" stopOpacity=".13" />
          <stop offset="1" stopColor="#c23c0b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-vapor`} x1="0%" y1="100%" x2="12%" y2="0%">
          <stop stopColor="#ffe0bf" stopOpacity="0" />
          <stop offset=".24" stopColor="#e8d5bd" stopOpacity=".32" />
          <stop offset=".6" stopColor="#e9e0d6" stopOpacity=".28" />
          <stop offset="1" stopColor="#e9e0d6" stopOpacity="0" />
        </linearGradient>
        <filter id={`${uid}-diffuse`} x="-35%" y="-20%" width="170%" height="140%">
          <feGaussianBlur stdDeviation="3.2" />
        </filter>
        <linearGradient id={`${uid}-syrup`} x1="0%" x2="100%" y1="0%" y2="0%">
          <stop stopColor="#934008" stopOpacity=".78" />
          <stop offset=".27" stopColor="#e89a38" />
          <stop offset=".43" stopColor="#fff1be" />
          <stop offset=".66" stopColor="#ffc56b" />
          <stop offset="1" stopColor="#ac570d" />
        </linearGradient>
        <radialGradient id={`${uid}-impact`}>
          <stop stopColor="#ffe1a2" stopOpacity=".5" />
          <stop offset="1" stopColor="#f1aa46" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-copper`}>
          <stop stopColor="#ffd394" stopOpacity="0" />
          <stop offset=".5" stopColor="#ffd394" stopOpacity=".55" />
          <stop offset="1" stopColor="#ffd394" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g className="komur-heat">
        <ellipse {...plate.oven} fill={ref('heat')} />
        <ellipse {...plate.coals} fill={ref('heat')} />
      </g>
      <g transform={plate.copper}>
        <path className="komur-copper-glint" d="M-110 0 Q0 19 110 -3" fill="none" stroke={ref('copper')} strokeWidth="2.6" />
      </g>
      <g transform={plate.vapor} fill="none" stroke={ref('vapor')} strokeLinecap="round">
        <g className="komur-vapor komur-vapor-a">
          <path d="M-8 0 C-31 -36 25 -51 5 -88 S-22 -130 11 -163 S25 -208 -2 -245" strokeWidth="20" filter={ref('diffuse')} />
          <path d="M-8 0 C-31 -36 25 -51 5 -88 S-22 -130 11 -163 S25 -208 -2 -245" strokeWidth="4" opacity=".36" />
        </g>
        <g className="komur-vapor komur-vapor-b">
          <path d="M29 5 C47 -32 7 -58 35 -91 S49 -137 23 -173 S39 -213 50 -226" strokeWidth="15" filter={ref('diffuse')} />
        </g>
        <g className="komur-vapor komur-vapor-c">
          <path d="M-32 -3 C-54 -41 -8 -73 -36 -109 S-58 -151 -31 -188" strokeWidth="11" filter={ref('diffuse')} />
        </g>
      </g>
      <g transform={plate.pour}>
        <path className="komur-syrup-neck" d="M0 0 C1.5 7 1 15 -1 25" fill="none" stroke={ref('syrup')} strokeWidth="3.2" strokeLinecap="round" />
        <g className="komur-syrup-drop komur-syrup-drop-a">
          <path d="M0 0 C-.7 6 -4.4 9 -4.4 13 A4.4 4.4 0 0 0 4.4 13 C4.4 9 .7 6 0 0Z" fill={ref('syrup')} />
          <path d="M-1.8 9 Q-2.7 12 -1.8 13.6" stroke="#fff4d5" strokeWidth="1" fill="none" strokeLinecap="round" />
        </g>
        <g className="komur-syrup-drop komur-syrup-drop-b">
          <path d="M0 0 C-1 4 -3.2 7 -3.2 9 A3.2 3.2 0 0 0 3.2 9 C3.2 7 1 4 0 0Z" fill={ref('syrup')} />
        </g>
        <g transform="translate(-8 186)">
          <ellipse className="komur-syrup-impact" rx="19" ry="5" fill={ref('impact')} />
        </g>
      </g>
    </svg>
  );
}
