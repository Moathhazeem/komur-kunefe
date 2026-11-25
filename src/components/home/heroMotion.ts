/** Native-scroll, progressive enhancement. Only the hero owns this lifecycle. */
type DataConnection = EventTarget & { saveData?: boolean };

export function mountHeroMotion(root: HTMLElement): () => void {
  const viewport = root.querySelector<HTMLElement>('.home-hero-viewport');
  const camera = root.querySelector<HTMLElement>('.home-hero-camera');
  if (!viewport || !camera) return () => {};

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 899px)');
  const connection = (navigator as Navigator & { connection?: DataConnection }).connection;
  const lowCore = navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 2;
  let frame = 0;
  let near = true;
  let disposed = false;
  let last = -1;

  const allowed = () => !reduced.matches && !connection?.saveData && !lowCore;
  const reset = () => {
    root.removeAttribute('data-cinema-active');
    camera.style.removeProperty('--hero-camera-scale');
    camera.style.removeProperty('--hero-camera-shift');
    last = -1;
  };
  const cancel = () => {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
  };
  const render = () => {
    frame = 0;
    if (disposed || !allowed()) { reset(); return; }
    if (document.hidden || !near) { root.removeAttribute('data-cinema-active'); return; }
    const rect = viewport.getBoundingClientRect();
    const visible = rect.bottom > 0 && rect.top < window.innerHeight && rect.height > 0;
    if (!visible) { root.removeAttribute('data-cinema-active'); return; }
    const progress = Math.max(0, Math.min(1, -rect.top / Math.max(rect.height, 1)));
    // Quantize tiny changes. No time-based scroll loop, and no layout writes.
    const step = Math.round(progress * 1000) / 1000;
    if (step !== last) {
      const zoom = mobile.matches ? 0.065 : 0.10;
      camera.style.setProperty('--hero-camera-scale', (1 + zoom * step).toFixed(4));
      camera.style.setProperty('--hero-camera-shift', `${(step * (mobile.matches ? 2 : 3)).toFixed(3)}%`);
      last = step;
    }
    if (!root.hasAttribute('data-cinema-active')) root.setAttribute('data-cinema-active', '');
  };
  const schedule = () => {
    if (disposed) return;
    if (!allowed()) { cancel(); reset(); return; }
    if (!near || document.hidden) { cancel(); root.removeAttribute('data-cinema-active'); return; }
    if (!frame) frame = window.requestAnimationFrame(render);
  };
  const refresh = () => { last = -1; schedule(); };
  const observer = typeof IntersectionObserver === 'function'
    ? new IntersectionObserver(([entry]) => {
        if (!entry) return;
        near = entry.isIntersecting;
        schedule();
      }, { rootMargin: '48px 0px' })
    : undefined;
  observer?.observe(viewport);
  const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(refresh) : undefined;
  resizeObserver?.observe(viewport);
  const listenMedia = (query: MediaQueryList, handler: () => void) => {
    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', handler);
      return () => query.removeEventListener('change', handler);
    }
    query.addListener(handler);
    return () => query.removeListener(handler);
  };
  const unlistenReduced = listenMedia(reduced, refresh);
  const unlistenMobile = listenMedia(mobile, refresh);
  connection?.addEventListener?.('change', refresh);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', refresh, { passive: true });
  window.addEventListener('pageshow', refresh);
  document.addEventListener('visibilitychange', schedule);
  schedule();

  return () => {
    disposed = true;
    cancel();
    observer?.disconnect();
    resizeObserver?.disconnect();
    unlistenReduced();
    unlistenMobile();
    connection?.removeEventListener?.('change', refresh);
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', refresh);
    window.removeEventListener('pageshow', refresh);
    document.removeEventListener('visibilitychange', schedule);
    reset();
  };
}
