import { z } from 'zod';
import { ORDER_TYPES, TRANSACTION_METHODS } from '../constants';
import { UserDto } from './user.dto';
import { ContactDto } from './contact.dto';

export const CreatePaymentDto = z.object({
	ref: z.string().nullish(),
	date: z.string().min(1, 'Date requise'),
	amount: z.number().min(0, 'Le montant doit être positif'),
	agentId: z.string(),
	agent: UserDto.nullish(),
	method: z.enum(TRANSACTION_METHODS),
	cashingTransactionId: z.string().nullish(),
	depositTransactionId: z.string().nullish(),
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
	contactId: z.string().nullish(),

	receiptNumber: z.string().nullish(),
	invoiceNumber: z.string().nullish(),

	totalPrice: z.number(),
	totalPaid: z.number(),
	totalDue: z.number(),

	payments: z.array(CreatePaymentDto),
});

export const UpdateOrderDto = CreateOrderDto;

export const PaymentDto = z.object({
	id: z.string(),
	...CreatePaymentDto.shape,
	ref: z.string(),
	agent: UserDto.nullish(),
});

export const OrderDto = z.object({
	id: z.string(),
	ref: z.string(),
	...CreateOrderDto.shape,
	agent: UserDto.nullish(),
	contact: ContactDto.nullish(),
	payments: z.array(PaymentDto),
});

export type CreatePaymentDto = z.infer<typeof CreatePaymentDto>;
export type PaymentCashingDto = z.infer<typeof PaymentCashingDto>;
export type CreateOrderDto = z.infer<typeof CreateOrderDto>;
export type UpdateOrderDto = z.infer<typeof UpdateOrderDto>;
export type OrderDto = z.infer<typeof OrderDto>;
export type PaymentDto = z.infer<typeof PaymentDto>;
