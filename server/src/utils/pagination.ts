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

export const getSalePaginationCondition = (
	req: Request
): PaginationCondition => {
	const page = parseInt(req.query.page as string) || 1;
	const limit = parseInt(req.query.limit as string) || 10;
	const search = (req.query.search as string) || '';
	const skip = (page - 1) * limit;

	// Build where clause for search and filters
	const whereClause: any = { deletedAt: null };

	// Search functionality
	if (search) {
		whereClause.OR = ['ref', 'receiptNumber', 'invoiceNumber'].map((field) => ({
			[field]: { contains: search, mode: 'insensitive' },
		}));
	}

	// Date range filters
	const dateFrom = req.query.dateFrom as string;
	const dateTo = req.query.dateTo as string;

	if (dateFrom || dateTo) {
		whereClause.date = {};
		if (dateFrom) {
			whereClause.date.gte = new Date(dateFrom);
		}
		if (dateTo) {
			whereClause.date.lte = new Date(dateTo);
		}
	}

	// Agent filter
	const agentId = req.query.agentId as string;
	if (agentId) {
		whereClause.agentId = agentId;
	}

	// Client filter
	const clientId = req.query.clientId as string;
	if (clientId) {
		whereClause.clientId = clientId;
	}

	// Status filter
	const status = req.query.status as string;
	if (status) {
		whereClause.status = status;
	}

	return {
		page,
		limit,
		skip,
		search,
		whereClause,
	};
};
