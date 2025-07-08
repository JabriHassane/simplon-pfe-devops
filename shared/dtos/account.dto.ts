import { z } from 'zod';

export const CreateAccountDto = z.object({
	body: z.object({
		name: z
			.string()
			.min(2, 'Le nom du compte doit contenir au moins 2 caractères')
			.max(100, 'Le nom du compte ne peut pas dépasser 100 caractères'),
		balance: z
			.number()
			.min(0, 'Le solde doit être positif')
			.optional()
			.default(0),
	}),
});

export const AccountIdDto = z.object({
	params: z.object({
		id: z.string().min(1, 'ID compte requis'),
	}),
});

export const UpdateAccountDto = z.object({
	...AccountIdDto.shape,
	body: CreateAccountDto.shape.body.partial(),
});

export type CreateAccountDtoType = z.infer<typeof CreateAccountDto>;
export type UpdateAccountDtoType = z.infer<typeof UpdateAccountDto>;
export type AccountIdDtoType = z.infer<typeof AccountIdDto>;
