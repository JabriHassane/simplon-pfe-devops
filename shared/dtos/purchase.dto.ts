import { z } from 'zod';
import { CreateOrderDto, OrderDto } from './order.dto';
import { SupplierDto } from './supplier.dto';

export const CreatePurchaseDto = z.object({
	...CreateOrderDto.omit({
		clientId: true,
	}).shape,
	supplierId: z.string().min(1, 'Fournisseur requis'),
});

export const UpdatePurchaseDto = CreatePurchaseDto;

export const PurchaseDto = z.object({
	...OrderDto.omit({
		client: true,
	}).shape,
	supplier: SupplierDto,
});

export type CreatePurchaseDtoType = z.infer<typeof CreatePurchaseDto>;
export type UpdatePurchaseDtoType = z.infer<typeof UpdatePurchaseDto>;
export type PurchaseDtoType = z.infer<typeof PurchaseDto>;
