import { Request } from 'express';

export interface PaginationCondition {
	page: number;
	limit: number;
	skip: number;
	search: string;
	whereClause: any;
}

export const getPaginationCondition = (
	req: Request,
	searchFields: string[]
): PaginationCondition => {
	const page = parseInt(req.query.page as string) || 1;
	const limit = parseInt(req.query.limit as string) || 10;
	const search = (req.query.search as string) || '';
	const skip = (page - 1) * limit;

	// Build where clause for search
	const whereClause: any = { deletedAt: null };
	if (search) {
		whereClause.OR = searchFields.map((field) => ({
			[field]: { contains: search, mode: 'insensitive' },
		}));
	}

	return {
		page,
		limit,
		skip,
		search,
		whereClause,
	};
};
