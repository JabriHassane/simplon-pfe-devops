export const ROLES = ['super_admin', 'admin', 'agent'] as const;
export type Role = (typeof ROLES)[number];

export const ORDER_STATUSES = [
	'pending',
	'partially_paid',
	'paid',
	'cancelled',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_COLOR_MAP = {
	pending: 'warning',
	partially_paid: 'info',
	paid: 'primary',
	cancelled: 'error',
} as const;

export const DISCOUNT_TYPES = ['percentage', 'fixed'] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number];

export const TRANSACTION_TYPES = ['purchase', 'sale', 'transfer'] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const PAYMENT_METHODS = [
	'cash',
	'check',
	'tpe',
	'bankTransfer',
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
