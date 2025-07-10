import { z } from 'zod';

export const CreateSupplierDto = z.object({
		name: z
			.string()
			.min(2, 'Le nom du fournisseur doit contenir au moins 2 caractères')
			.max(100, 'Le nom du fournisseur ne peut pas dépasser 100 caractères'),
		phone: z
			.string()
			.min(8, 'Le numéro de téléphone doit contenir au moins 8 caractères')
			.max(20, 'Le numéro de téléphone ne peut pas dépasser 20 caractères'),
		address: z
			.string()
		.min(5, "L'adresse doit contenir au moins 5 caractères")
		.max(200, "L'adresse ne peut pas dépasser 200 caractères"),
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