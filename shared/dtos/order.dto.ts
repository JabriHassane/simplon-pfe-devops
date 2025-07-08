import { z } from 'zod';
import {
	BaseOrderStatusEnum,
	BaseDiscountTypeEnum,
	BaseDateString,
} from './base.dto';

export const OrderItemDto = z.object({
	productId: z.string().min(1, 'Produit requis'),
	price: z.number().min(0, 'Le prix doit être positif'),
	quantity: z.number().int().min(1, 'La quantité doit être au moins 1'),
});

export const CreateOrderDto = z.object({
	body: z.object({
		date: BaseDateString,
		clientId: z.string().min(1, 'Client requis'),
		receiptNumber: z
			.string()
			.min(1, 'Numéro de reçu requis')
			.max(50, 'Numéro de reçu trop long'),
		invoiceNumber: z
			.string()
			.min(1, 'Numéro de facture requis')
			.max(50, 'Numéro de facture trop long'),
		items: z.array(OrderItemDto).min(1, 'Au moins un article requis'),
		status: BaseOrderStatusEnum.optional().default('pending'),
		discountAmount: z
			.number()
			.min(0, 'La remise doit être positive')
			.optional()
			.default(0),
		discountType: BaseDiscountTypeEnum.optional().default('fixed'),
		note: z
			.string()
			.max(500, 'La note ne peut pas dépasser 500 caractères')
			.optional(),
	}),
});

export const UpdateOrderDto = z.object({
	params: z.object({
		id: z.string(),
	}),
	body: CreateOrderDto.shape.body.partial(),
});

export const OrderIdDto = z.object({
	params: z.object({
		id: z.string(),
	}),
});

export type CreateOrderDtoType = z.infer<typeof CreateOrderDto>;
export type UpdateOrderDtoType = z.infer<typeof UpdateOrderDto>;
export type OrderIdDtoType = z.infer<typeof OrderIdDto>;
