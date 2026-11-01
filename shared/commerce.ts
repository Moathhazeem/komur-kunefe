/** Website pickup uses the published variant.price tariff, not takeaway/dine-in overrides.
 * Alternate tariffs remain informational until the restaurant enables a service-mode selector. */
export const PRICING_CONTEXT = 'website_pickup' as const;
export interface VariantMetadata { servings?: number; servingsApproved?: boolean; maxQuantity?: number; }
export interface GeniusMetadata { flavorTags: string[]; textureTags: string[]; approved?: boolean; priority?: number; }
export function priceInCents(variant: { price: number }) {
  if (!Number.isFinite(variant.price) || variant.price <= 0 || variant.price > 10000) throw new Error('سعر الصنف غير صالح');
  return Math.round(variant.price * 100);
}
export function quantityLimit(variant: VariantMetadata) {
  return Number.isInteger(variant.maxQuantity) && variant.maxQuantity! > 0 ? Math.min(variant.maxQuantity!, 20) : 10;
}
