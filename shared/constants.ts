export const ROLES = ['super_admin', 'admin', 'agent'] as const;
export type Role = (typeof ROLES)[number];

export const ORDER_TYPES = ['sale', 'purchase'] as const;
export type OrderType = (typeof ORDER_TYPES)[number];

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
	paid: 'success',
	cancelled: 'error',
} as const;

export const TRANSACTION_TYPES = [
	'sale',
	'purchase',
	'cashing',
	'send',
	'receive',
] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const OPERATION_TYPES = ['cashing', 'send', 'receive'] as const;
export type OperationType = (typeof OPERATION_TYPES)[number];

export const TRANSACTION_TYPE_COLOR_MAP = {
	purchase: 'warning',
	sale: 'success',
	send: 'warning',
	receive: 'success',
	cashing: 'info',
} as const;

export const TRANSACTION_METHODS = [
	'cash',
	'check',
	'tpe',
	'bank_transfer',
] as const;
export type TransactionMethod = (typeof TRANSACTION_METHODS)[number];

export const PAYMENT_METHODS_COLOR_MAP = {
	cash: 'success',
	check: 'warning',
	tpe: 'info',
	bank_transfer: 'secondary',
} as const;

export const TRANSACTION_ACCOUNTS = ['nabil', 'faycal', 'redouane', 'bank'] as const;
export type TransactionAccount = (typeof TRANSACTION_ACCOUNTS)[number];