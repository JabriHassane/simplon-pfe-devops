import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodType } from 'zod';

export const validate = (schema: ZodType) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			if (schema) {
				req.body = await schema.parseAsync(req.body);
			}

			next();
		} catch (error) {
			if (error instanceof ZodError) {
				const errors = error.errors.map((err) => ({
					field: err.path.join('.'),
					message: err.message,
				}));
				return res.status(400).json({
					message: 'Validation failed',
					errors,
				});
			}
			next(error);
		}
	};
};
