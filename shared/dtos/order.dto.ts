import { z } from 'zod';
import { ORDER_STATUSES, PAYMENT_METHODS } from '../constants';
import { UserDto } from './user.dto';
import { ArticleDto } from './article.dto';
import { AccountDto } from './account.dto';

export const CreateOrderItemDto = z.object({
	articleId: z.string().optional(),
	articleName: z.string().optional(),
	price: z.number().min(0, 'Le prix doit être positif'),
	quantity: z.number().int().min(1, 'La quantité doit être au moins 1'),
});

export const CreateOrderPaymentDto = z.object({
	date: z.string().min(1, 'Date requise'),
	amount: z.number().min(0, 'Le montant doit être positif'),
	accountId: z.string().optional(),
	agentId: z.string().optional(),
	paymentMethod: z.enum(PAYMENT_METHODS),
});

export const CreateOrderDto = z.object({
	date: z.string().min(1, 'Date requise'),

	agentId: z.string().optional(),
	accountId: z.string().optional(),

	receiptNumber: z.string().optional(),
	invoiceNumber: z.string().optional(),

	totalPrice: z.number(),
	totalPaid: z.number(),
	totalDue: z.number(),

	items: z.array(CreateOrderItemDto).min(1, 'Au moins un article requis'),
	payments: z.array(CreateOrderPaymentDto),
	status: z.enum(ORDER_STATUSES).optional().default('pending'),

	note: z.string().optional(),
});

export const UpdateOrderDto = CreateOrderDto;

export const OrderPaymentDto = z.object({
	ref: z.string(),
	...CreateOrderPaymentDto.shape,
	account: AccountDto.optional(),
	agent: UserDto.optional(),
});

export const OrderItemDto = CreateOrderItemDto.extend({
	article: ArticleDto.optional(),
});

export const OrderDto = z.object({
	id: z.string(),
	ref: z.string(),
	...CreateOrderDto.shape,
	agent: UserDto.optional(),
	items: z.array(OrderItemDto),
	payments: z.array(OrderPaymentDto),
});

export type CreateOrderItemDtoType = z.infer<typeof CreateOrderItemDto>;
export type CreateOrderPaymentDtoType = z.infer<typeof CreateOrderPaymentDto>;
export type CreateOrderDtoType = z.infer<typeof CreateOrderDto>;
export type UpdateOrderDtoType = z.infer<typeof UpdateOrderDto>;
export type OrderPaymentDtoType = z.infer<typeof OrderPaymentDto>;
export type OrderItemDtoType = z.infer<typeof OrderItemDto>;
export type OrderDtoType = z.infer<typeof OrderDto>;
