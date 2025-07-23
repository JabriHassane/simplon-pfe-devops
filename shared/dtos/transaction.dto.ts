import { z } from 'zod';
import { TRANSACTION_TYPES, TRANSACTION_METHODS } from '../constants';
import { UserDto } from './user.dto';
import { PurchaseDto } from './purchase.dto';
import { SaleDto } from './sale.dto';

const CreateTransactionUnrefinedDto = z.object({
	date: z.string(),
	type: z.enum(TRANSACTION_TYPES),
	agentId: z.string(),
	purchaseId: z.string().optional(),
	saleId: z.string().optional(),
	method: z.enum(TRANSACTION_METHODS).optional(),
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
		message: 'Achat ou vente requis selon le type de transaction',
		path: ['purchaseId', 'saleId'],
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
});

export type CreateTransactionDtoType = z.infer<typeof CreateTransactionDto>;
export type UpdateTransactionDtoType = z.infer<typeof UpdateTransactionDto>;
export type TransactionDtoType = z.infer<typeof TransactionDto>;
