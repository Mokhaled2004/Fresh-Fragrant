export const OFFER_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
} as const;

export type OfferType = (typeof OFFER_TYPES)[keyof typeof OFFER_TYPES];