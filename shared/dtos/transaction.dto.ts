import { z } from 'zod';
import {
	TRANSACTION_TYPES,
	TRANSACTION_METHODS,
	TRANSFER_ACTORS,
} from '../constants';
import { UserDto } from './user.dto';
import { OrderDto } from './order.dto';

const CreateTransactionUnrefinedDto = z.object({
	date: z.string(),
	type: z.enum(TRANSACTION_TYPES),
	agentId: z.string(),
	orderId: z.string().nullish(),
	method: z.enum(TRANSACTION_METHODS).nullish(),
	amount: z.number().positive('Le montant doit être positif'),
	transferActor: z.enum(TRANSFER_ACTORS).nullish(),
	cashingTransactionId: z.string().nullish(),
	depositTransactionId: z.string().nullish(),
});

export const CreateTransactionDto = CreateTransactionUnrefinedDto.refine(
	(data) => {
		// Validate that either orderId is provided for purchase/sale types
		if ((data.type === 'purchase' || data.type === 'sale') && !data.orderId) {
			return false;
		}
		return true;
	},
	{
		message: 'Achat ou vente requis selon le type de transaction',
		path: ['orderId'],
	}
);

export const UpdateTransactionDto = CreateTransactionDto;

export const RelatedTransactionDto = z.object({
	id: z.string(),
	method: z.enum(TRANSACTION_METHODS),
});

export const TransactionDto = z.object({
	id: z.string(),
	ref: z.string(),
	...CreateTransactionUnrefinedDto.shape,
	agent: UserDto.nullish(),
	order: OrderDto.nullish(),
	cashedPayment: RelatedTransactionDto.nullish(),
	depositedPayment: RelatedTransactionDto.nullish(),
});

export type CreateTransactionDto = z.infer<typeof CreateTransactionDto>;
export type UpdateTransactionDto = z.infer<typeof UpdateTransactionDto>;
export type TransactionDto = z.infer<typeof TransactionDto>;
