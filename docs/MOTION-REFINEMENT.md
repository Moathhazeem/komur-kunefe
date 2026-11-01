# Motion and interaction redesign

## Customer-facing changes
- Shared PremiumButton: rounded sculpted surface, inset icon well, hover light sweep, spring lift and press feedback, dark/light/ghost/success appearances, busy state and native button semantics.
- Rebuilt product cards: inset rounded photography, framed surface, compact metadata and pricing, full image detail action, share feedback and matching order CTA.
- Cards reveal in sequence when entering the viewport. Fine mouse pointers get a small spring tilt plus hover lift; touch users retain press feedback and full-size touch controls.
- Hero uses clipped staggered text entrances, staged action reveal, manual cross-fading photo gallery, scroll-linked image movement and a spring stamp entrance.
- Craft photo reveals once through a soft clip; Genius receipt settles into view and reacts to hover.
- Menu active-category pill moves between choices. Filtering animates item exit, entry and grid positions. Empty results enter without blocking input.
- Genius steps cross-fade horizontally; taste tiles respond on press; totals animate when the price changes.
- ProductConfigurator provides matching variant tiles, quantity controls, animated totals and an animated cart follow-up. Related products reuse ProductCard instead of wrapping attributed image links in buttons.
- Header cart responds to hover/press; mobile menu expands and collapses. Route entrances fade in without transforming the whole page.

## Architecture
MotionProvider configures reducedMotion=user globally. Components also consult useReducedMotion to suppress parallax, tilt and entrances when requested.
Pointer movement updates motion values directly, not React state. Motion controls transforms; CSS transitions are limited to surfaces. No dependency or price-model changes.
The previous competing editorial override layer was removed from index.css. The replacement lives in src/styles/experience.css with shared primitives and responsive rules.

## Verification
Static Babel syntax parsing passed for all changed TS/TSX files; PostCSS parsing passed for both changed stylesheets. Relative local import paths resolve. git diff --check passes.
These parsers read syntax only: no application compilation, bundling, type-checking, dev server or runtime execution occurred. Browser rendering, actual animation feel, remote image loading, viewport layouts and interaction behavior remain unverified.
Manually check 320/375/430/768/1024/1440px; hover/press; gallery arrows and keyboard; active menu filters; form Enter/Back; cart feedback; native checkout dialog; and reduced motion.
