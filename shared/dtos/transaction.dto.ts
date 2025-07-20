import { z } from 'zod';
import { TRANSACTION_TYPES, PAYMENT_METHODS } from '../constants';
import { AccountDto } from './account.dto';
import { UserDto } from './user.dto';
import { PurchaseDto } from './purchase.dto';
import { SaleDto } from './sale.dto';

const CreateTransactionUnrefinedDto = z.object({
	date: z.string(),
	type: z.enum(TRANSACTION_TYPES),
	agentId: z.string(),
	purchaseId: z.string().optional(),
	saleId: z.string().optional(),
	paymentMethod: z.enum(PAYMENT_METHODS).optional(),
	fromId: z.string().optional(),
	toId: z.string().optional(),
	amount: z.number().positive('Le montant doit être positif'),
});

export const CreateTransactionDto = CreateTransactionUnrefinedDto.refine(
	(data) => {
		// Validate that either purchaseId or saleId is provided for purchase/sale types
		if (data.type === 'purchase' && !data.purchaseId) {
			return false;
		}
		if (data.type === 'sale' && !data.saleId) {
			return false;
		}
		return true;
	},
	{
		message: 'Purchase ID ou Sale ID requis selon le type de transaction',
		path: ['purchaseId', 'saleId'],
	}
).refine(
	(data) => {
		// Validate that fromId and toId are provided for transfer type
		if (data.type === 'transfer' && (!data.fromId || !data.toId)) {
			return false;
		}
		return true;
	},
	{
		message: 'Comptes source et destination requis pour les transferts',
		path: ['fromId', 'toId'],
	}
);

export const UpdateTransactionDto = CreateTransactionDto;

export const TransactionDto = z.object({
	id: z.string(),
	ref: z.string(),
	...CreateTransactionUnrefinedDto.shape,
	agent: UserDto,
	purchase: PurchaseDto,
	sale: SaleDto,
	from: AccountDto,
	to: AccountDto,
});

export type CreateTransactionDtoType = z.infer<typeof CreateTransactionDto>;
export type UpdateTransactionDtoType = z.infer<typeof UpdateTransactionDto>;
export type TransactionDtoType = z.infer<typeof TransactionDto>;
