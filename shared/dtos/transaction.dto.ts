import { z } from 'zod';
import {
	BaseTransactionTypeEnum,
	BasePaymentMethodEnum,
	BaseDateString,
} from './base.dto';

export const CreateTransactionDto = z.object({
	body: z
		.object({
			date: BaseDateString,
			type: BaseTransactionTypeEnum,
			purchaseId: z.string().optional(),
			orderId: z.string().optional(),
			paymentMethod: BasePaymentMethodEnum.optional(),
			fromId: z.string().optional(),
			toId: z.string().optional(),
			amount: z
				.number()
				.min(0.01, 'Le montant doit être supérieur à 0')
				.max(999999, 'Le montant ne peut pas dépasser 999,999'),
		})
		.refine(
			(data) => {
				// Validate that either purchaseId or orderId is provided for purchase/order types
				if (data.type === 'purchase' && !data.purchaseId) {
					return false;
				}
				if (data.type === 'order' && !data.orderId) {
					return false;
				}
				return true;
			},
			{
				message: 'Purchase ID ou Order ID requis selon le type de transaction',
				path: ['purchaseId'],
			}
		)
		.refine(
			(data) => {
				// Validate that fromId and toId are provided for transfer type
				if (data.type === 'transfer' && (!data.fromId || !data.toId)) {
					return false;
				}
				return true;
			},
			{
				message: 'Comptes source et destination requis pour les transferts',
				path: ['fromId'],
			}
		),
});

export const UpdateTransactionDto = z.object({
	body: z.object({
		date: BaseDateString.optional(),
		paymentMethod: BasePaymentMethodEnum.optional(),
		amount: z
			.number()
			.min(0.01, 'Le montant doit être supérieur à 0')
			.max(999999, 'Le montant ne peut pas dépasser 999,999')
			.optional(),
	}),
});

export const TransactionIdDto = z.object({
	params: z.object({
		id: z.string().min(1, 'ID transaction requis'),
	}),
});

export type CreateTransactionDtoType = z.infer<typeof CreateTransactionDto>;
export type UpdateTransactionDtoType = z.infer<typeof UpdateTransactionDto>;
export type TransactionIdDtoType = z.infer<typeof TransactionIdDto>;
