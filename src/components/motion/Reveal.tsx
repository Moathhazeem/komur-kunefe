import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export const cinematicEase = [.22, 1, .36, 1] as const;

export function Reveal({ children, className = '', delay = 0 }: {
  children: ReactNode; className?: string; delay?: number;
}) {
  const reduced = useReducedMotion();
  return <motion.div className={className}
    initial={reduced ? false : { opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: .12 }}
    transition={{ duration: reduced ? 0 : .7, delay: reduced ? 0 : delay, ease: cinematicEase }}>
    {children}
  </motion.div>;
}

export function RevealLine({ children, delay = 0, className = '' }: {
  children: ReactNode; delay?: number; className?: string;
}) {
  const reduced = useReducedMotion();
  return <span className={`text-reveal-mask ${className}`}>
    <motion.span initial={reduced ? false : { y: '110%', opacity: 0 }}
      animate={{ y: '0%', opacity: 1 }}
      transition={{ duration: reduced ? 0 : .85, delay: reduced ? 0 : delay, ease: cinematicEase }}>
      {children}
    </motion.span>
  </span>;
}
