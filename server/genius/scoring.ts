import type { Preference } from './types';
import type { Option } from './normalization';
export const WEIGHTS = { diversity: .4, preference: .3, value: .2, excess: .1 };
export interface Candidate { counts: number[]; cents: number; units: number; servings: number; flavors: string[]; score: number; }
export function evaluate(counts:number[], options:Option[], people:number, budget:number, preference:Preference): Candidate {
 let cents=0, units=0, servings=0, matched=0;
 const tags = new Set<string>(); const products = new Set<string>();
 counts.forEach((q,i)=>{if(!q)return;const o=options[i];cents+=o.cents*q;units+=q;servings+=(o.servings || 0)*q;products.add(o.productId);o.flavors.forEach(t=>tags.add(t));if(preference==='balanced' || o.textures.includes(preference))matched+=q;});
 const diversity = Math.min(1, (tags.size || products.size)/3);
 const match = units ? matched/units : 0;
 // Budget efficiency rewards affordability rather than consuming all available money.
 const value = 1-cents/budget;
 const excess = Math.min(1,Math.max(0,units-people)/Math.max(1,people));
 return {counts,cents,units,servings,flavors:[...tags].sort(),score:WEIGHTS.diversity*diversity+WEIGHTS.preference*match+WEIGHTS.value*value-WEIGHTS.excess*excess};
}
