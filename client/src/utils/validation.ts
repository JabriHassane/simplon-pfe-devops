import { ZodError } from 'zod';

// Import all DTOs from shared folder
export * from '../../../shared/dtos/auth.dto';
export * from '../../../shared/dtos/user.dto';
export * from '../../../shared/dtos/client.dto';
export * from '../../../shared/dtos/order.dto';
export * from '../../../shared/dtos/product.dto';
export * from '../../../shared/dtos/product-category.dto';
export * from '../../../shared/dtos/purchase.dto';
export * from '../../../shared/dtos/supplier.dto';
export * from '../../../shared/dtos/transaction.dto';
export * from '../../../shared/dtos/account.dto';

export interface ValidationError {
	field: string;
	message: string;
}

export interface ValidationResult {
	isValid: boolean;
	errors: ValidationError[];
}

export const validateForm = (schema: any, data: any): ValidationResult => {
	try {
		schema.parse(data);
		return {
			isValid: true,
			errors: [],
		};
	} catch (error) {
		if (error instanceof ZodError) {
			const errors = error.errors.map((err) => ({
				field: err.path.join('.'),
				message: err.message,
			}));
			return {
				isValid: false,
				errors,
			};
		}
		return {
			isValid: false,
			errors: [{ field: 'general', message: 'Validation failed' }],
		};
	}
};

export const validateField = (
	schema: any,
	data: any,
	field: string
): ValidationResult => {
	try {
		schema.parse(data);
		return {
			isValid: true,
			errors: [],
		};
	} catch (error) {
		if (error instanceof ZodError) {
			const fieldErrors = error.errors
				.filter((err) => err.path.join('.').startsWith(field))
				.map((err) => ({
					field: err.path.join('.'),
					message: err.message,
				}));
			return {
				isValid: fieldErrors.length === 0,
				errors: fieldErrors,
			};
		}
		return {
			isValid: false,
			errors: [{ field, message: 'Validation failed' }],
		};
	}
};
