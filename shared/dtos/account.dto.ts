import { z } from 'zod';
import { PAYMENT_METHODS } from '../constants';

export const CreateAccountDto = z.object({
	name: z.string().min(1, 'Le nom du compte est requis'),
	paymentMethods: z
		.array(z.enum(PAYMENT_METHODS))
		.min(1, 'Au moins une méthode de paiement est requise'),
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
