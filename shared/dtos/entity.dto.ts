import { z } from 'zod';

export const EntityDto = z.object({
	id: z.string(),
	ref: z.string(),

	createdAt: z.string(),
	updatedAt: z.string().nullish(),
	deletedAt: z.string().nullish(),

	createdById: z.string().nullish(),
	updatedById: z.string().nullish(),
	deletedById: z.string().nullish(),
});
