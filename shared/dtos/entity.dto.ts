import { z } from 'zod';

export const EntityDto = z.object({
	id: z.string(),
	ref: z.string(),

	createdAt: z.string(),
	updatedAt: z.string().optional(),
	deletedAt: z.string().optional(),

	createdById: z.string().optional(),
	updatedById: z.string().optional(),
	deletedById: z.string().optional(),
});
