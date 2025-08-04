import { z } from 'zod';

export const CreateSupplierDto = z.object({
	name: z.string().min(1, 'Le nom du client ne doit pas être vide'),
	phone: z.string().optional(),
	address: z.string().optional(),
});

export const UpdateSupplierDto = CreateSupplierDto;

export const SupplierDto = z.object({
	id: z.string(),
	ref: z.string(),
	...CreateSupplierDto.shape,
});

export type CreateSupplierDtoType = z.infer<typeof CreateSupplierDto>;
export type UpdateSupplierDtoType = z.infer<typeof UpdateSupplierDto>;
export type SupplierDtoType = z.infer<typeof SupplierDto>;
