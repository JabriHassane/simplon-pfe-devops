import { z } from 'zod';

// Base schemas without Prisma dependencies
export const BaseRoleEnum = z.enum(['SUPER_ADMIN', 'ADMIN', 'AGENT']);
export const BaseOrderStatusEnum = z.enum([
	'pending',
	'partially_paid',
	'paid',
	'cancelled',
]);
export const BaseDiscountTypeEnum = z.enum(['percentage', 'fixed']);
export const BaseTransactionTypeEnum = z.enum([
	'purchase',
	'order',
	'transfer',
]);
export const BasePaymentMethodEnum = z.enum([
	'cash',
	'check',
	'tpe',
	'bankTransfer',
]);

// Base date string schema that can be transformed to Date
export const BaseDateString = z.string().transform((val) => new Date(val));

// Base schemas for common fields
export const BaseIdParam = z.object({
	params: z.object({
		id: z.string().min(1, 'ID requis'),
	}),
});

export const BasePaginationQuery = z.object({
	query: z.object({
		page: z
			.string()
			.optional()
			.transform((val) => parseInt(val || '1')),
		limit: z
			.string()
			.optional()
			.transform((val) => parseInt(val || '10')),
	}),
});
