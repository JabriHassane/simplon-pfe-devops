import { z } from 'zod';

export const CreateProductDto = z.object({
		name: z
			.string()
			.min(2, 'Le nom du produit doit contenir au moins 2 caractères')
			.max(100, 'Le nom du produit ne peut pas dépasser 100 caractères'),
		image: z.string().url("L'image doit être une URL valide").optional(),
		categoryId: z.string().min(1, 'Catégorie requise'),
		price: z
			.number()
			.min(0, 'Le prix doit être positif')
			.max(999999, 'Le prix ne peut pas dépasser 999,999'),
		inventory: z
			.number()
			.int("L'inventaire doit être un nombre entier")
		.min(0, "L'inventaire doit être positif")
		.max(999999, "L'inventaire ne peut pas dépasser 999,999"),
});

export const UpdateProductDto = CreateProductDto;

export const ProductDto = z.object({
	id: z.string(),
	ref: z.string(),
	...CreateProductDto.shape,
});

export type CreateProductDtoType = z.infer<typeof CreateProductDto>;
export type UpdateProductDtoType = z.infer<typeof UpdateProductDto>;
export type ProductDtoType = z.infer<typeof ProductDto>;
