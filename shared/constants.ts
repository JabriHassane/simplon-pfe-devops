export const ROLES = ['super_admin', 'admin', 'agent'] as const;
export const ORDER_STATUSES = [
	'pending',
	'partially_paid',
	'paid',
	'cancelled',
] as const;
export const DISCOUNT_TYPES = ['percentage', 'fixed'] as const;
export const TRANSACTION_TYPES = ['purchase', 'order', 'transfer'] as const;
export const PAYMENT_METHODS = [
	'cash',
	'check',
	'tpe',
	'bankTransfer',
] as const;
