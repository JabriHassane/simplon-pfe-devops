import { z } from 'zod';

export const CreateAccountDto = z.object({
	name: z
		.string()
		.min(1, 'Le nom du compte est requis'),
});

export const UpdateAccountDto = CreateAccountDto;

export const AccountDto = z.object({
	id: z.string(),
	ref: z.string(),
	...CreateAccountDto.shape,
	balance: z
		.number()
		.min(0, 'Le solde doit être positif')
		.optional()
		.default(0),
});

export type CreateAccountDtoType = z.infer<typeof CreateAccountDto>;
export type UpdateAccountDtoType = z.infer<typeof UpdateAccountDto>;
export type AccountDtoType = z.infer<typeof AccountDto>;
