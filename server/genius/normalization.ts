import type { Product } from '../db';
import { priceInCents, quantityLimit } from '../../shared/commerce';
import type { SelectionLine } from './types';
export interface Option extends SelectionLine { cents: number; limit: number; servings: number | null; flavors: string[]; textures: string[]; }
export function normalize(products: Product[]): Option[] {
 return products.filter(p => p.isAvailable && !p.isInitialPrice).sort((a,b)=>a.id.localeCompare(b.id)).flatMap(p =>
 p.variants.flatMap(v => {
   try {
     return [{productId:p.id,variantId:v.id,quantity:1,name:p.name,variantName:v.name,price:priceInCents(v)/100,cents:priceInCents(v),limit:quantityLimit(v),
       servings:v.servingsApproved && Number.isFinite(v.servings) && v.servings! > 0 ? v.servings! : null,
       flavors:p.genius?.approved ? p.genius.flavorTags || [] : [], textures:p.genius?.approved ? p.genius.textureTags || [] : []}];
   } catch { return []; }
 }));
}
