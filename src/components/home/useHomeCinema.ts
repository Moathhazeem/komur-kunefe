import { useEffect, type RefObject } from 'react';

const desktopCinema = '(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

export function useHomeCinema(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const media = window.matchMedia(desktopCinema);
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData || (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 2)) return;

    let cancelled = false;
    let loading = false;
    let unmount: (() => void) | undefined;
    const enhance = () => {
      if (!media.matches || loading || unmount) return;
      loading = true;
      void import('./homeCinema').then(({ mountHomeCinema }) => {
        if (!cancelled) unmount = mountHomeCinema(element, desktopCinema);
      }).catch(() => {
        // The image, in-page links and ordering are available without this enhancement.
      }).finally(() => { loading = false; });
    };

    const hasIdleCallback = typeof window.requestIdleCallback === 'function';
    const scheduled = hasIdleCallback
      ? window.requestIdleCallback(enhance, { timeout: 1500 })
      : window.setTimeout(enhance, 180);
    media.addEventListener('change', enhance);
    return () => {
      cancelled = true;
      if (hasIdleCallback) window.cancelIdleCallback(scheduled);
      else window.clearTimeout(scheduled);
      media.removeEventListener('change', enhance);
      unmount?.();
    };
  }, [root]);
}
