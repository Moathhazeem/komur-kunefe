import type { Offer } from '../types';
/** Store calendar, independent of the visitor's timezone. */
export function isActiveOffer(offer: Offer, now = new Date()) {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Hebron', year:'numeric',month:'2-digit',day:'2-digit' }).format(now);
  return offer.isActive && (!offer.startDate || offer.startDate.slice(0,10) <= today) && (!offer.endDate || offer.endDate.slice(0,10) >= today);
}
