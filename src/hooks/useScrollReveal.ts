import { useEffect, useRef, useState } from 'react';

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  /** Delay in ms before the element animates in — useful for staggering cards */
  delay?: number;
}

/**
 * Lightweight IntersectionObserver-based scroll reveal hook.
 * Returns a ref to attach to the target element and a boolean `isVisible`.
 * Once visible the element stays visible (no re-hide on scroll out).
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.12,
  rootMargin = '0px 0px -40px 0px',
  delay = 0,
}: UseScrollRevealOptions = {}) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Respect prefers-reduced-motion — reveal immediately
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (delay > 0) {
              const timer = setTimeout(() => setIsVisible(true), delay);
              // Clean up timer if component unmounts before it fires
              node.dataset['revealTimer'] = String(timer);
            } else {
              setIsVisible(true);
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      const timerId = node.dataset['revealTimer'];
      if (timerId) clearTimeout(Number(timerId));
    };
  }, [threshold, rootMargin, delay]);

  return { ref, isVisible };
}

