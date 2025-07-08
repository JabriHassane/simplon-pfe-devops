import type { Entity } from './general.types';
import type { Purchase } from './purchase.types';
import type { Order } from './order.types';
import type { User } from './user.types';

export const PAYMENT_METHODS = [
	'cash',
	'check',
	'tpe',
	'bankTransfer',
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

// caisse espece, caisse cheque, banque, nabil, farid
export interface Account extends Entity {
	name: string;
	balance: number;
}

export const TRANSACTION_TYPES = ['purchase', 'order', 'transfer'] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export interface Transaction extends Entity {
	date: Date;
	agent: string | User;

	type: TransactionType;

	purchase: string | Purchase | null;
	order: string | Order | null;
	paymentMethod: PaymentMethod | null;

	from: string | Account | null;
	to: string | Account | null;

	amount: number;
}
