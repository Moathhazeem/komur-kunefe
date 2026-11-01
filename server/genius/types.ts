export type Preference = 'balanced' | 'crispy' | 'creamy';
export interface GeniusInput { people: number; budget: number; preference: Preference; }
export interface SelectionLine { productId: string; variantId: string; quantity: number; price: number; name: string; variantName: string; }
export interface Recommendation { id: string; title: string; items: SelectionLine[]; total: number; remainingBudget: number; servings: number | null; flavorTags: string[]; explanation: string; }
export interface GeniusResponse {
 recommendations: Recommendation[];
 constraints: GeniusInput & { pricingContext: 'website_pickup'; coverageGuaranteed: boolean };
 metadata: { warning: string; searchLimit: number; catalog: SelectionLine[] };
}
