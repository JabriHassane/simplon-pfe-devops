export const JWT_EXPIRES_IN = '15m';

export const PAGE_SIZE = 20;

export const ROLES = ['super_admin', 'admin', 'agent'] as const;
export type Role = (typeof ROLES)[number];

export const ORDER_TYPES = ['sale', 'purchase'] as const;
export type OrderType = (typeof ORDER_TYPES)[number];

export const ORDER_STATUSES = ['partially_paid', 'paid'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_COLOR_MAP = {
	partially_paid: 'warning',
	paid: 'success',
} as const;

export const TRANSACTION_TYPES = [
	'sale',
	'purchase',
	'cashing',
	'deposit',
	'send',
	'receive',
] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const OPERATION_TYPES = ['send', 'receive'] as const;
export type OperationType = (typeof OPERATION_TYPES)[number];

export const TRANSACTION_TYPE_COLOR_MAP = {
	purchase: 'warning',
	sale: 'success',
	send: 'warning',
	receive: 'success',
	cashing: 'info',
	deposit: 'secondary',
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

export const TRANSFER_ACTORS = [
	'Nabil',
	'Faycal',
	'Redouane',
	'Banque',
] as const;
export type TransferActor = (typeof TRANSFER_ACTORS)[number];
