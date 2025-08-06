export interface PaginationParams {
	page?: number;
	pageSize?: number;
}

export interface Pagination {
	page: number;
	pageSize: number;
	total: number;
}

export interface PaginatedResponse<T> {
	data: T[];
	pagination: Pagination;
}
