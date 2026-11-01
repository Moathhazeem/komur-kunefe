# Editorial visual refinement

Continues on feat/komur-signature-ui-genius. Images copied from origin/main a3ce1a7, including the Nabulsi kunafa Wikimedia image and the pistachio, assorted sweets and chocolate images. Data IDs, variants, prices and server ordering contracts are unchanged.

## Changes
- New asymmetric charcoal hero: arched kunafa photography, Arabic display title, warm gold seal, immediate order CTA and compact branch metadata.
- Separate BrandHero, CraftSection and GeniusInvitation components.
- Editorial product grid with large photos, lighter borders, image detail action, clear prices and native sharing.
- Dedicated menu cover, category counts, search, adaptive sticky tools and empty state.
- Receipt-inspired Genius invitation and consistent forms, buttons, checkout and product details.
- Mobile compositions at 700px and 1023px breakpoints; reduced-motion fallbacks preserved.
- ProductImage now restores main imagery for legacy seed images, retains uploaded images, handles errors per URL, and shows illustration captions. Wikimedia attribution stays linked and visible.
- Header ResizeObserver communicates its actual height to the sticky menu tools.

## Validation
git diff --check passed. Source and route props reviewed. Build, compilation, type-check, development server, browser screenshots and viewport tests were not run, preserving the user's earlier restriction. External image availability and actual visual rendering remain unverified. Remote images fail gracefully.
