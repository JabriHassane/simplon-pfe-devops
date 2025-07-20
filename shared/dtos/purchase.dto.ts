import { z } from 'zod';
import { CreateSaleDto, SaleItemDto } from './sale.dto';
import { SupplierDto } from './supplier.dto';
import { UserDto } from './user.dto';

export const CreatePurchaseDto = z.object({
	...CreateSaleDto.omit({
		clientId: true,
	}).shape,
	supplierId: z.string().min(1, 'Fournisseur requis'),
});

export const UpdatePurchaseDto = CreatePurchaseDto;

export const PurchaseDto = z.object({
	id: z.string(),
	ref: z.string(),
	...CreatePurchaseDto.shape,
	agent: UserDto,
	supplier: SupplierDto,
	items: z.array(SaleItemDto),
});

export type CreatePurchaseDtoType = z.infer<typeof CreatePurchaseDto>;
export type UpdatePurchaseDtoType = z.infer<typeof UpdatePurchaseDto>;
export type PurchaseDtoType = z.infer<typeof PurchaseDto>;
