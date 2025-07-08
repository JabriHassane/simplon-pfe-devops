import { z } from 'zod';
import { BaseDateString, BaseDiscountTypeEnum } from './base.dto';

export const purchaseItemSchema = z.object({
	productId: z.string().min(1, 'Produit requis'),
	price: z.number().min(0, 'Le prix doit être positif'),
	quantity: z.number().int().min(1, 'La quantité doit être au moins 1'),
});

export const CreatePurchaseDto = z.object({
	body: z.object({
		date: BaseDateString,
		supplierId: z.string().min(1, 'Fournisseur requis'),
		receiptNumber: z
			.string()
			.min(1, 'Numéro de reçu requis')
			.max(50, 'Numéro de reçu trop long'),
		invoiceNumber: z
			.string()
			.min(1, 'Numéro de facture requis')
			.max(50, 'Numéro de facture trop long'),
		items: z.array(purchaseItemSchema).min(1, 'Au moins un article requis'),
		status: z
			.enum(['pending', 'partially-paid', 'paid', 'cancelled'])
			.optional()
			.default('pending'),
		discountAmount: z
			.number()
			.min(0, 'La remise doit être positive')
			.optional()
			.default(0),
		discountType: BaseDiscountTypeEnum.optional().default('fixed'),
		note: z
			.string()
			.max(500, 'La note ne peut pas dépasser 500 caractères')
			.optional(),
	}),
});

export const UpdatePurchaseDto = z.object({
	body: z.object({
		date: BaseDateString.optional(),
		supplierId: z.string().min(1, 'Fournisseur requis').optional(),
		receiptNumber: z
			.string()
			.min(1, 'Numéro de reçu requis')
			.max(50, 'Numéro de reçu trop long')
			.optional(),
		invoiceNumber: z
			.string()
			.min(1, 'Numéro de facture requis')
			.max(50, 'Numéro de facture trop long')
			.optional(),
		items: z
			.array(purchaseItemSchema)
			.min(1, 'Au moins un article requis')
			.optional(),
		status: z
			.enum(['pending', 'partially-paid', 'paid', 'cancelled'])
			.optional(),
		discountAmount: z
			.number()
			.min(0, 'La remise doit être positive')
			.optional(),
		discountType: BaseDiscountTypeEnum.optional(),
		note: z
			.string()
			.max(500, 'La note ne peut pas dépasser 500 caractères')
			.optional(),
	}),
});

export const PurchaseIdDto = z.object({
	params: z.object({
		id: z.string().min(1, 'ID achat requis'),
	}),
});

export type CreatePurchaseDtoType = z.infer<typeof CreatePurchaseDto>;
export type UpdatePurchaseDtoType = z.infer<typeof UpdatePurchaseDto>;
export type PurchaseIdDtoType = z.infer<typeof PurchaseIdDto>;
