import { z } from 'zod';
import { ORDER_STATUSES, DISCOUNT_TYPES } from '../constants';
import { UserDto } from './user.dto';
import { ClientDto } from './client.dto';

export const OrderItemDto = z.object({
	productId: z.string().min(1, 'Produit requis'),
	price: z.number().min(0, 'Le prix doit être positif'),
	quantity: z.number().int().min(1, 'La quantité doit être au moins 1'),
});

export const CreateOrderDto = z.object({
	date: z.string().min(1, 'Date requise'),

	agentId: z.string().min(1, 'Agent requis'),
	clientId: z.string().min(1, 'Client requis'),

	receiptNumber: z.string().min(1, 'Numéro de reçu requis'),
	invoiceNumber: z.string().min(1, 'Numéro de facture requis'),

	totalPrice: z.number(),
	totalPaid: z.number(),
	totalDue: z.number(),

	items: z.array(OrderItemDto).min(1, 'Au moins un article requis'),
	status: z.enum(ORDER_STATUSES).optional().default('pending'),

	discountAmount: z
		.number()
		.min(0, 'La remise doit être positive')
		.optional()
		.default(0),
	discountType: z.enum(DISCOUNT_TYPES).optional().default('fixed'),

	note: z.string().optional(),
});

export const UpdateOrderDto = CreateOrderDto;

export const OrderDto = z.object({
	id: z.string(),
	ref: z.string(),
	...CreateOrderDto.shape,
	agent: UserDto,
	client: ClientDto,
	items: z.array(OrderItemDto),
});

export type CreateOrderDtoType = z.infer<typeof CreateOrderDto>;
export type UpdateOrderDtoType = z.infer<typeof UpdateOrderDto>;
export type OrderDtoType = z.infer<typeof OrderDto>;
