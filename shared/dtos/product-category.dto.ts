import { z } from 'zod';

export const CreateProductCategoryDto = z.object({
	name: z
		.string()
		.min(2, 'Le nom de la catégorie doit contenir au moins 2 caractères')
		.max(50, 'Le nom de la catégorie ne peut pas dépasser 50 caractères'),
});

export const UpdateProductCategoryDto = CreateProductCategoryDto;

export const ProductCategoryDto = z.object({
	id: z.string(),
	ref: z.string(),
	...CreateProductCategoryDto.shape,
});

export type CreateProductCategoryDtoType = z.infer<
	typeof CreateProductCategoryDto
>;
export type UpdateProductCategoryDtoType = z.infer<
	typeof UpdateProductCategoryDto
>;
export type ProductCategoryDtoType = z.infer<typeof ProductCategoryDto>;
