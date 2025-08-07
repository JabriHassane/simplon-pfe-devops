import { z } from 'zod';
import {
	TRANSACTION_TYPES,
	TRANSACTION_METHODS,
	TRANSACTION_ACCOUNTS,
} from '../constants';
import { UserDto } from './user.dto';
import { OrderDto } from './order.dto';

const CreateTransactionUnrefinedDto = z.object({
	date: z.string(),
	type: z.enum(TRANSACTION_TYPES),
	agentId: z.string(),
	orderId: z.string().optional(),
	method: z.enum(TRANSACTION_METHODS).optional(),
	amount: z.number().positive('Le montant doit être positif'),
	account: z.enum(TRANSACTION_ACCOUNTS),
	cashingTransactionId: z.string().optional(),
	depositTransactionId: z.string().optional(),
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

export const TransactionDto = z.object({
	id: z.string(),
	ref: z.string(),
	...CreateTransactionUnrefinedDto.shape,
	agent: UserDto.optional(),
	order: OrderDto.optional(),
});

export type CreateTransactionDto = z.infer<typeof CreateTransactionDto>;
export type UpdateTransactionDto = z.infer<typeof UpdateTransactionDto>;
export type TransactionDto = z.infer<typeof TransactionDto>;
