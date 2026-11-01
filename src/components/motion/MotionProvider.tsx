import type { ReactNode } from 'react';
import { MotionConfig } from 'motion/react';
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user" transition={{ type: 'spring', stiffness: 320, damping: 28 }}>{children}</MotionConfig>;
}
