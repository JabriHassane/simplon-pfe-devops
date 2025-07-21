import { z } from 'zod';
import { ORDER_STATUSES, DISCOUNT_TYPES } from '../constants';
import { UserDto } from './user.dto';
import { ClientDto } from './client.dto';
import { ArticleDto } from './article.dto';
import { AccountDto } from './account.dto';

export const CreateSaleItemDto = z.object({
	articleId: z.string().min(1, 'Article requis'),
	price: z.number().min(0, 'Le prix doit être positif'),
	quantity: z.number().int().min(1, 'La quantité doit être au moins 1'),
});

export const CreateSaleDto = z.object({
	date: z.string().min(1, 'Date requise'),

	agentId: z.string().min(1, 'Agent requis'),
	clientId: z.string().min(1, 'Client requis'),

	receiptNumber: z.string().min(1, 'Numéro de reçu requis'),
	invoiceNumber: z.string().min(1, 'Numéro de facture requis'),

	totalPrice: z.number(),
	totalPaid: z.number(),
	totalDue: z.number(),

	items: z.array(CreateSaleItemDto).min(1, 'Au moins un article requis'),
	status: z.enum(ORDER_STATUSES).optional().default('pending'),

	discountAmount: z
		.number()
		.min(0, 'La remise doit être positive')
		.optional()
		.default(0),
	discountType: z.enum(DISCOUNT_TYPES).optional().default('fixed'),

	note: z.string().optional(),
});

export const UpdateSaleDto = CreateSaleDto;

export const SalePaymentDto = z.object({
	id: z.string(),
	ref: z.string(),
	date: z.string(),
	amount: z.number(),
	from: AccountDto,
	to: AccountDto,
});

export const SaleItemDto = CreateSaleItemDto.extend({
	article: ArticleDto,
});

export const SaleDto = z.object({
	id: z.string(),
	ref: z.string(),
	...CreateSaleDto.shape,
	agent: UserDto,
	client: ClientDto,
	items: z.array(SaleItemDto),
	payments: z.array(SalePaymentDto),
});

export type CreateSaleDtoType = z.infer<typeof CreateSaleDto>;
export type UpdateSaleDtoType = z.infer<typeof UpdateSaleDto>;
export type SaleDtoType = z.infer<typeof SaleDto>;
export type SaleItemDtoType = z.infer<typeof SaleItemDto>;
export type SalePaymentDtoType = z.infer<typeof SalePaymentDto>;
