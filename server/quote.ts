import type { Product, OrderItem } from './db';
import { priceInCents, quantityLimit } from '../shared/commerce';
export function quote(products:Product[], raw:unknown):{items:OrderItem[];total:number} {
 if(!Array.isArray(raw) || !raw.length || raw.length>100)throw new Error('اختر من 1 إلى 100 سطر');
 const merged=new Map<string,OrderItem>();
 for(const line of raw){
  if(!line || typeof line.productId!=='string' || typeof line.variantId!=='string' || !Number.isInteger(line.quantity) || line.quantity<1)throw new Error('بيانات صنف غير صالحة');
  const product=products.find(p=>p.id===line.productId && p.isAvailable);
  const variant=product?.variants.find(v=>v.id===line.variantId);
  if(!product || !variant)throw new Error('تغير توفر أحد الأصناف. حدّث السلة');
  const key=product.id+'|'+variant.id;
  const quantity=(merged.get(key)?.quantity || 0)+line.quantity;
  if(quantity>quantityLimit(variant))throw new Error('تجاوزت حد الكمية للصنف: '+product.name);
  merged.set(key,{productId:product.id,variantId:variant.id,name:product.name,variantName:variant.name,price:priceInCents(variant)/100,quantity});
 }
 const items=[...merged.values()];
 return {items,total:items.reduce((sum,i)=>sum+Math.round(i.price*100)*i.quantity,0)/100};
}
