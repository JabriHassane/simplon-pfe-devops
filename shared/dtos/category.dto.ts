import { z } from 'zod';

export const CreateCategoryDto = z.object({
	name: z
		.string()
		.min(2, 'Le nom de la catégorie doit contenir au moins 2 caractères')
		.max(50, 'Le nom de la catégorie ne peut pas dépasser 50 caractères'),
});

export const UpdateCategoryDto = CreateCategoryDto;

export const CategoryDto = z.object({
	id: z.string(),
	ref: z.string(),
	...CreateCategoryDto.shape,
});

export type CreateCategoryDtoType = z.infer<typeof CreateCategoryDto>;
export type UpdateCategoryDtoType = z.infer<typeof UpdateCategoryDto>;
export type CategoryDtoType = z.infer<typeof CategoryDto>;
