import type { ReactNode } from 'react';
export function SectionHeading({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return <header className="section-heading"><span className="eyebrow">{kicker}</span><h2>{title}</h2>{children && <p>{children}</p>}</header>;
}
