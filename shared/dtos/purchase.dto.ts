import { z } from 'zod';
import { CreateOrderDto, OrderDto } from './order.dto';
import { ContactDto } from './contact.dto';

export const CreatePurchaseDto = CreateOrderDto.extend({
	contactId: z.string().optional(),
});

export const UpdatePurchaseDto = CreatePurchaseDto;

export const PurchaseDto = OrderDto.extend({
	contact: ContactDto.optional(),
});

export type CreatePurchaseDtoType = z.infer<typeof CreatePurchaseDto>;
export type UpdatePurchaseDtoType = z.infer<typeof UpdatePurchaseDto>;
export type PurchaseDtoType = z.infer<typeof PurchaseDto>;
