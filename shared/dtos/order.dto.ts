import { z } from 'zod';
import { ORDER_STATUSES, ORDER_TYPES, TRANSACTION_METHODS } from '../constants';
import { UserDto } from './user.dto';
import { ContactDto } from './contact.dto';

export const CreatePaymentDto = z.object({
	date: z.string().min(1, 'Date requise'),
	amount: z.number().min(0, 'Le montant doit être positif'),
	agentId: z.string(),
	method: z.enum(TRANSACTION_METHODS),
	cashingTransactionId: z.string().optional(),
	depositTransactionId: z.string().optional(),
});

export const PaymentCashingDto = z.object({
	id: z.string(),
	date: z.string().min(1, 'Date requise'),
	agentId: z.string(),
});

export const CreateOrderDto = z.object({
	type: z.enum(ORDER_TYPES),
	date: z.string().min(1, 'Date requise'),

	agentId: z.string(),
	contactId: z.string().optional(),

	receiptNumber: z.string().optional(),
	invoiceNumber: z.string().optional(),

	totalPrice: z.number(),
	totalPaid: z.number(),
	totalDue: z.number(),

	payments: z.array(CreatePaymentDto),
	status: z.enum(ORDER_STATUSES).optional().default('pending'),

	note: z.string().optional(),
});

export const UpdateOrderDto = CreateOrderDto;

const PaymentDto = z.object({
	id: z.string(),
	ref: z.string(),
	...CreatePaymentDto.shape,
	agent: UserDto.optional(),
});

export const OrderDto = z.object({
	id: z.string(),
	ref: z.string(),
	...CreateOrderDto.shape,
	agent: UserDto.optional(),
	contact: ContactDto.optional(),
	payments: z.array(PaymentDto),
});

export type CreatePaymentDto = z.infer<typeof CreatePaymentDto>;
export type PaymentCashingDto = z.infer<typeof PaymentCashingDto>;
export type CreateOrderDto = z.infer<typeof CreateOrderDto>;
export type UpdateOrderDto = z.infer<typeof UpdateOrderDto>;
export type OrderDto = z.infer<typeof OrderDto>;
export type PaymentDto = z.infer<typeof PaymentDto>;
