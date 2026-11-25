import { useEffect, type RefObject } from 'react';
import { mountHeroMotion } from './heroMotion';

export function useHomeCinema(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    return mountHeroMotion(element);
  }, [root]);
}
