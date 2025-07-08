export const DISCOUNT_TYPES = ['percentage', 'fixed'] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number];

export interface Discount {
	amount: number;
	type: DiscountType;
}
