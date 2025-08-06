import { Request } from 'express';

export function getPaginationCondition(req: Request) {
	const page = parseInt(req.query.page as string) || 1;
	const pageSize = parseInt(req.query.pageSize as string) || 10;
	const search = (req.query.search as string) || '';
	const skip = (page - 1) * pageSize;

	// Build where clause for search
	const whereClause: any = { deletedAt: null };
	if (search) {
		whereClause.OR = [
			{ name: { contains: search, mode: 'insensitive' } },
			{ ref: { contains: search, mode: 'insensitive' } },
			{ phone: { contains: search, mode: 'insensitive' } },
		];
	}
	return { whereClause, skip, pageSize, page };
}
