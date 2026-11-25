# Kömür mobile cinematic hero

Base reviewed: `0a06bc445cfec9e0cabb7cff1dda0f54f1698048` (origin/main at review).

Uses existing responsive WebP artwork, with separate artwork-coordinate SVG overlays
for steam, an amber syrup drip and a subtle oven glow. The camera moves with native
scroll, with a smaller range on phones. No new dependencies, requests, video, canvas,
WebGL, forced smooth scroll or pinned section. The existing Arabic copy, header layout,
CTA callbacks and featured-product link remain intact. The previous desktop-only
GSAP/Lenis module is deliberately retained in source but no longer mounted by this hero.

References reviewed for patterns (no third-party code or assets copied):
- https://github.com/tangyistudio/scroll-frame-sequence — MIT; responsive framing, RAF coalescing.
- https://github.com/Remilya/scroll-hero — MIT; reduced motion, Save-Data, offscreen lifecycle.
- https://github.com/yug1204/burger- — scroll-scrubbed food presentation; no declared license found.
- https://github.com/zaxel/cinematic-coffee-drink-experience — food/drink art direction; no declared license found.
- https://github.com/Nayanika-Acharjee/CafeBloom — pouring concept; no declared license found.
- https://github.com/ShahramShakiba/Coffee-Smoke-p21 — steam concept; no declared license found.

The effects are intentionally a stylized overlay rather than photorealistic liquid
simulation. Automatic atmospheric effects finish within 4.5 seconds per entry; they
can replay when returning to the hero. Camera motion is scroll-driven. Reduced-motion,
Save-Data and low-core devices get static artwork. Motion is detached on unmount and
stops outside the viewport or when the tab is hidden.

Manual QA checklist (not executed; no compile/build requested):
- Compare 320, 360, 390, 430, 768, 899, 900 and 1440 px widths, portrait and landscape.
- Confirm syrup alignment, smoke scale, photo crop, Arabic text contrast and buttons.
- Test Android Chrome, iOS Safari and Instagram in-app browser: native touch scroll,
  address-bar collapse, back navigation, opening menu/story, and featured link.
- Toggle reduced motion and Save-Data, leave/return to homepage and hide/show tab.
- Verify no new network downloads beyond existing photo/bundle; measure LCP, INP,
  CLS and frame stability on a representative low/midrange phone before merging.
