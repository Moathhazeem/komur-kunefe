import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

export function mountHomeCinema(root: HTMLElement, desktopCinema: string) {
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();

  media.add(desktopCinema, () => {
    const hero = root.querySelector<HTMLElement>('.brand-hero');
    const art = root.querySelector<HTMLElement>('.hero-art');
    const depth = root.querySelector<HTMLElement>('.hero-image-depth');
    const light = root.querySelector<HTMLElement>('.hero-light');
    const heroImage = root.querySelector<HTMLElement>('.hero-image');
    if (!hero || !art || !depth || !light || !heroImage) return;
    const craft = root.querySelector<HTMLElement>('.craft-photo');
    const craftImage = craft?.querySelector<HTMLImageElement>('img');

    gsap.to(heroImage, {
      '--hero-pan': '4%',
      '--hero-zoom': 1.13,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
    if (craft && craftImage) {
      gsap.fromTo(craftImage, { yPercent: -4, scale: 1.12 }, {
        yPercent: 4,
        scale: 1.12,
        ease: 'none',
        scrollTrigger: { trigger: craft, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }
    gsap.fromTo(light, { xPercent: -12, opacity: 0.65 }, {
      xPercent: 10,
      opacity: 0.2,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });

    const moveX = gsap.quickTo(depth, 'x', { duration: 0.65, ease: 'power3.out' });
    const moveY = gsap.quickTo(depth, 'y', { duration: 0.65, ease: 'power3.out' });
    let artBounds: DOMRect | undefined;
    const measureArt = () => { artBounds = art.getBoundingClientRect(); };
    const moveArt = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const bounds = artBounds ??= art.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      moveX(((event.clientX - bounds.left) / bounds.width - 0.5) * 12);
      moveY(((event.clientY - bounds.top) / bounds.height - 0.5) * 10);
    };
    const resetArt = () => { moveX(0); moveY(0); };
    art.addEventListener('pointerenter', measureArt);
    art.addEventListener('pointermove', moveArt, { passive: true });
    art.addEventListener('pointerleave', resetArt);

    const lenis = new Lenis({
      autoRaf: false,
      anchors: false,
      smoothWheel: true,
      syncTouch: false,
      lerp: 0.15,
      stopInertiaOnNavigate: true,
      prevent: (node) => node.matches('[role="dialog"], [data-lenis-prevent]'),
    });

    let disposed = false;
    let ticking = false;
    const stopTicker = () => {
      ticking = false;
      gsap.ticker.remove(tick);
    };
    function tick() {
      lenis.raf(performance.now());
      if (lenis.isScrolling !== 'smooth') stopTicker();
    }

    const releaseScroll = lenis.on('scroll', () => {
      artBounds = undefined;
      ScrollTrigger.update();
    });
    const releaseWheel = lenis.on('virtual-scroll', () => {
      if (ticking || document.hidden) return;
      // Reset the time delta after idle. Lenis handles the wheel event before the microtask.
      lenis.raf(performance.now());
      queueMicrotask(() => {
        if (disposed || ticking || document.hidden || lenis.isScrolling !== 'smooth') return;
        ticking = true;
        gsap.ticker.add(tick);
      });
    });
    const handleVisibility = () => {
      if (document.hidden) {
        stopTicker();
        lenis.stop();
      } else {
        lenis.start();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    ScrollTrigger.addEventListener('refresh', measureArt);

    return () => {
      disposed = true;
      document.removeEventListener('visibilitychange', handleVisibility);
      ScrollTrigger.removeEventListener('refresh', measureArt);
      art.removeEventListener('pointerenter', measureArt);
      art.removeEventListener('pointermove', moveArt);
      art.removeEventListener('pointerleave', resetArt);
      stopTicker();
      releaseWheel();
      releaseScroll();
      lenis.destroy();
    };
  }, root);

  return () => media.revert();
}
