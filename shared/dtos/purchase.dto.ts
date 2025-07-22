import { z } from 'zod';
import { CreateOrderDto, OrderDto } from './order.dto';
import { SupplierDto } from './supplier.dto';

export const CreatePurchaseDto = CreateOrderDto.extend({
	supplierId: z.string().optional(),
});

export const UpdatePurchaseDto = CreatePurchaseDto;

export const PurchaseDto = OrderDto.extend({
	supplier: SupplierDto.optional(),
});

export type CreatePurchaseDtoType = z.infer<typeof CreatePurchaseDto>;
export type UpdatePurchaseDtoType = z.infer<typeof UpdatePurchaseDto>;
export type PurchaseDtoType = z.infer<typeof PurchaseDto>;
