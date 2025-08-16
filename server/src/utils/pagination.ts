import { Request } from 'express';

export interface PaginationCondition {
	page: number;
	pageSize: number;
	skip: number;
	search: string;
	whereClause: any;
}

export const getPaginationCondition = (
	req: Request,
	searchFields: string[]
): PaginationCondition => {
	const page = parseInt(req.query.page as string) || 1;
	const pageSize = parseInt(req.query.pageSize as string) || 10;
	const search = (req.query.search as string) || '';
	const skip = (page - 1) * pageSize;

	// Build where clause for search
	const whereClause: any = { deletedAt: null };
	if (search) {
		whereClause.OR = searchFields.map((field) => ({
			[field]: { contains: search, mode: 'insensitive' },
		}));
	}

	return {
		page,
		pageSize,
		skip,
		search,
		whereClause,
	};
};

export const getOrderPaginationCondition = (
	req: Request
): PaginationCondition => {
	const page = parseInt(req.query.page as string) || 1;
	const pageSize = parseInt(req.query.pageSize as string) || 10;
	const search = (req.query.search as string) || '';
	const skip = (page - 1) * pageSize;

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
		whereClause.date.gte = dateFrom ? new Date(dateFrom) : undefined;
		whereClause.date.lte = dateTo ? new Date(dateTo) : undefined;
	}

	// Agent filter

	whereClause.agentId = req.query.agentId || undefined;

	// Contact filter
	whereClause.contactId = req.query.contactId || undefined;

	// Status filter
	const status = req.query.status;
	if (status === 'paid') {
		whereClause.totalDue = 0;
	} else if (status === 'partially_paid') {
		whereClause.totalDue = {
			gt: 0,
		};
	}

	// Only unprocessed payments filter
	if (req.query.onlyUnprocessedPayments) {
		whereClause.payments = {
			some: {
				method: {
					not: 'cash',
				},
				depositTransactionId: null,
				cashingTransactionId: null,
			},
		};
	}

	return {
		page,
		pageSize,
		skip,
		search,
		whereClause,
	};
};

export const getTransactionPaginationCondition = (
	req: Request
): PaginationCondition => {
	const page = parseInt(req.query.page as string) || 1;
	const pageSize = parseInt(req.query.pageSize as string) || 10;
	const search = (req.query.search as string) || '';
	const skip = (page - 1) * pageSize;

	// Build where clause for search and filters
	const whereClause: any = { deletedAt: null };

	// Search functionality
	if (search) {
		whereClause.OR = ['ref'].map((field) => ({
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

	// Account filter
	const account = req.query.account as string;
	if (account) {
		whereClause.account = account;
	}

	return {
		page,
		pageSize,
		skip,
		search,
		whereClause,
	};
};
