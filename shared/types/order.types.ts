import type { DiscountType } from './discount.types';
import type { Client } from './client.types';
import type { Product } from './product.types';
import type { User } from './user.types';
import type { Entity } from './general.types';
import type { Transaction } from './transaction.types';

export const ORDER_STATUSES = [
	'pending',
	'partially-paid',
	'paid',
	'cancelled',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrderItem extends Product {
	product: string | Product;
	price: number;
	quantity: number;
}

export interface Order extends Entity {
	date: Date;
	agent: string | User;
	client: string | Client;

	receiptNumber: string;
	invoiceNumber: string;

	items: OrderItem[];

	payments: string[] | Transaction[];
	totalPrice: number;
	totalPaid: number;
	totalDue: number;

	status: OrderStatus;

	discountType: DiscountType;
	discountAmount: number;

	note: string;
}
