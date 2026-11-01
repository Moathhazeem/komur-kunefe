# Kömür signature experience

## Delivery and scope
Based on feat/komur-premium-experience (9675db8). The checkout was clean before creating feat/komur-signature-ui-genius. No dependency changes were made. No build, compilation, type-check, dev server or browser execution was performed, per the brief. Runtime, API flows, responsive widths and accessibility need hands-on verification. git diff --check is the whitespace check, not runtime validation.

## Design changes
Shared cream/charcoal surfaces, Arabic Noto Naskh display typography and Tajawal body, editorial headings, responsive spacing, honest photography fallbacks, secondary page consistency, approved public reviews, real offer dates in Asia/Hebron, inline checkout errors, actual confirmation state and native payment dialog.
Generic Unsplash URLs remain in source data for compatibility but are blocked by ProductImage in customer product presentations. Restaurant-uploaded replacements render normally. The old unused ProductDetailsModal remains intact.

Photography needed: portrait hero of charcoal kunafa preparation; one consistently lit 4:3 image of each of the eight menu products; cheese/cream detail; charcoal preparation; exterior and pickup counter. Obtain rights and restaurant approval. No stock photograph is represented as an authentic product.

## Genius architecture
shared/commerce.ts holds the authoritative website_pickup tariff: variant.price rounded to integer agorot. dineInPrice and takeawayPrice are not mixed into orders. Existing tariff fields remain unchanged.
server/genius contains input validation, normalization, scoring and a deterministic bounded beam search (400 candidates per option). Up to three alternatives are selected with different product sets; duplicates and near-identical quantity-only alternatives are suppressed.
Weights: diversity .40, preference .30, affordability .20, excess quantity penalty .10. These are configurable heuristics, not validated taste measurements. Prices, stock and variants come from the backend database at request time.
Search is approximate: failure to find a candidate does not prove mathematical infeasibility. At most 20 units per selection and 10 per variant by default are software limits, not restaurant serving claims.
GET public menu -> POST /api/genius/recommend -> editable selection -> POST /api/cart/quote -> atomic cart merge -> POST /api/orders.
Budget applies only to the new selection. Existing cart contents can make the combined order exceed that budget. Duplicate lines merge; limits apply to combined cart quantities.
Modifications immediately recalculate totals; invalid budget/quantity blocks addition. Server rechecks stale prices and availability. Stale checkout totals return 409 and customer can refresh the cart before resubmitting.

## Metadata configuration
Both frontend and backend types support optional product.genius:
- flavorTags: string[]
- textureTags: string[] (use crispy / creamy where supported)
- approved: boolean
- priority: optional future metadata (not currently used by scoring)

Variants support optional servings, servingsApproved and maxQuantity.
Set these through the existing product update API or database administration only after restaurant confirmation. Existing Admin editors preserve untouched product fields on update; dedicated metadata editing controls are not included.
No serving counts or taste tags were invented or seeded. Without trusted servings, number of people controls search quantity bounds only; UI explicitly says coverage cannot be guaranteed. When any affordable approved servings exist, search uses only those variants and requires coverage >= people. Editing a result invalidates its original coverage statement. Unapproved taste data does not influence matching.

## Server validation
New quotes and orders resolve product/variant IDs from the database, enforce availability and aggregate quantity limits, compute canonical names and integer-cent totals, and save canonical items. Client prices/names are ignored. A stale total returns 409. Cash-on-pickup stays pending.
Existing public privileged API routes, hardcoded credentials/static tokens, customer order lookup/enumeration, missing rate limits, JSON-file concurrency and missing idempotency remain production blockers. This change does not claim production authentication or payment readiness.

## Static review / manual acceptance
Reviewed route wiring, promise errors, cart merge semantics, dialog focus handling, approved-review filtering, price drift rejection and metadata fallback paths. React checklist used: stable state updates, effect cleanup, async cancellation, semantic forms and explicit busy/error states.
Before launch, run separately authorized build/type checks and exercise:
- 320/375/430/768/1024/1440px layout and keyboard dialog flow.
- people=4, budget=80, balanced; repeated identical requests must return identical results.
- empty catalog, low budget, invalid input, all unavailable, approved coverage and missing metadata.
- modify/swaps above budget, duplicate variants, existing cart limits, price/availability changes.
- quote and order tampering, successful cash pickup, confirmation/tracking and WhatsApp opening.
