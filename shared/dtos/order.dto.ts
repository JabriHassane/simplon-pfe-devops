import { z } from 'zod';
import { ORDER_STATUSES, TRANSACTION_METHODS } from '../constants';
import { UserDto } from './user.dto';

export const CreateOrderPaymentDto = z.object({
	date: z.string().min(1, 'Date requise'),
	amount: z.number().min(0, 'Le montant doit être positif'),
	agentId: z.string().optional(),
	method: z.enum(TRANSACTION_METHODS),
	isCashed: z.boolean().optional(),
});

export const CreateOrderDto = z.object({
	date: z.string().min(1, 'Date requise'),

	agentId: z.string().optional(),

	receiptNumber: z.string().optional(),
	invoiceNumber: z.string().optional(),

	totalPrice: z.number(),
	totalPaid: z.number(),
	totalDue: z.number(),

	payments: z.array(CreateOrderPaymentDto),
	status: z.enum(ORDER_STATUSES).optional().default('pending'),

	note: z.string().optional(),
});

export const UpdateOrderDto = CreateOrderDto;

export const OrderPaymentDto = z.object({
	ref: z.string(),
	...CreateOrderPaymentDto.shape,
	agent: UserDto.optional(),
});

export const OrderDto = z.object({
	id: z.string(),
	ref: z.string(),
	...CreateOrderDto.shape,
	agent: UserDto.optional(),
	payments: z.array(OrderPaymentDto),
});

export type CreateOrderPaymentDtoType = z.infer<typeof CreateOrderPaymentDto>;
export type CreateOrderDtoType = z.infer<typeof CreateOrderDto>;
export type UpdateOrderDtoType = z.infer<typeof UpdateOrderDto>;
export type OrderPaymentDtoType = z.infer<typeof OrderPaymentDto>;
export type OrderDtoType = z.infer<typeof OrderDto>;
