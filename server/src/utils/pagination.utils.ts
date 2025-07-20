import { Request } from 'express';

export function getPaginationCondition(req: Request) {
	const page = parseInt(req.query.page as string) || 1;
	const limit = parseInt(req.query.limit as string) || 10;
	const search = (req.query.search as string) || '';
	const skip = (page - 1) * limit;

	// Build where clause for search
	const whereClause: any = { deletedAt: null };
	if (search) {
		whereClause.OR = [
			{ name: { contains: search, mode: 'insensitive' } },
			{ ref: { contains: search, mode: 'insensitive' } },
			{ phone: { contains: search, mode: 'insensitive' } },
		];
	}
	return { whereClause, skip, limit, page };
}
