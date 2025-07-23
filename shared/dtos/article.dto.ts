import { z } from 'zod';
import { CategoryDto } from './category.dto';

export const CreateArticleDto = z.object({
	name: z
		.string()
		.min(2, 'Le nom du article doit contenir au moins 2 caractères')
		.max(100, 'Le nom du article ne peut pas dépasser 100 caractères'),
	image: z.string().url("L'image doit être une URL valide").optional(),
	categoryId: z.string().optional(),
	price: z
		.number()
		.min(0, 'Le prix doit être positif')
		.max(999999, 'Le prix ne peut pas dépasser 999,999'),
});

export const UpdateArticleDto = CreateArticleDto;

export const ArticleDto = z.object({
	id: z.string(),
	ref: z.string(),
	...CreateArticleDto.shape,
	category: CategoryDto.optional(),
});

export type CreateArticleDtoType = z.infer<typeof CreateArticleDto>;
export type UpdateArticleDtoType = z.infer<typeof UpdateArticleDto>;
export type ArticleDtoType = z.infer<typeof ArticleDto>;
