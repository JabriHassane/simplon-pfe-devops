import { z } from 'zod';

export const CreateProductCategoryDto = z.object({
	body: z.object({
		name: z
			.string()
			.min(2, 'Le nom de la catégorie doit contenir au moins 2 caractères')
			.max(50, 'Le nom de la catégorie ne peut pas dépasser 50 caractères'),
	}),
});

export const UpdateProductCategoryDto = z.object({
	body: z.object({
		name: z
			.string()
			.min(2, 'Le nom de la catégorie doit contenir au moins 2 caractères')
			.max(50, 'Le nom de la catégorie ne peut pas dépasser 50 caractères'),
	}),
});

export const ProductCategoryIdDto = z.object({
	params: z.object({
		id: z.string().min(1, 'ID catégorie requis'),
	}),
});

export type CreateProductCategoryDtoType = z.infer<typeof CreateProductCategoryDto>;
export type UpdateProductCategoryDtoType = z.infer<typeof UpdateProductCategoryDto>;
export type ProductCategoryIdDtoType = z.infer<typeof ProductCategoryIdDto>;