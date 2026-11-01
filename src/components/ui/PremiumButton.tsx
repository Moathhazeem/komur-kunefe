import type { ReactNode } from 'react';
import { ArrowUpLeft, LoaderCircle } from 'lucide-react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react';

type PremiumButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  children: ReactNode;
  variant?: 'primary' | 'dark' | 'light' | 'ghost';
  icon?: ReactNode;
  busy?: boolean;
};

export function PremiumButton({
  children, variant = 'primary', icon = <ArrowUpLeft size={19} />,
  busy = false, disabled, className = '', type = 'button', ...props
}: PremiumButtonProps) {
  const reduced = useReducedMotion();
  const inactive = disabled || busy;
  return <motion.button
    {...props}
    type={type}
    disabled={inactive}
    aria-busy={busy || undefined}
    className={`premium-button premium-button--${variant} ${className}`}
    initial="rest"
    whileHover={inactive || reduced ? undefined : 'hover'}
    whileTap={inactive || reduced ? undefined : { scale: .97 }}
    variants={{ rest: { y: 0 }, hover: { y: -3 } }}
    transition={{ type: 'spring', stiffness: 360, damping: 25 }}
  >
    <span className="premium-button-label">{children}</span>
    <motion.span aria-hidden="true" className="premium-button-icon"
      variants={{ rest: { rotate: 0, x: 0 }, hover: { rotate: -10, x: -2 } }}
      transition={{ type: 'spring', stiffness: 360, damping: 22 }}>
      {busy ? <LoaderCircle size={18} className="premium-spinner" /> : icon}
    </motion.span>
  </motion.button>;
}
