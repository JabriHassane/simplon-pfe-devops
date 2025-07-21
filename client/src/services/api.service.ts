import { Axios } from '../config/axios.config';

export interface PaginationParams {
	page?: number;
	limit?: number;
	search?: string;
	dateFrom?: string;
	dateTo?: string;
	agentId?: string;
	clientId?: string;
	status?: string;
}

export interface PaginatedResponse<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export const ApiService = {
	async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
		const searchParams = new URLSearchParams();
		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					searchParams.append(key, value.toString());
				}
			});
		}

		const queryString = searchParams.toString();
		const url = queryString ? `${endpoint}?${queryString}` : endpoint;

		const response = await Axios.get<T>(url);
		return response.data;
	},

	async getPaginated<T>(
		endpoint: string,
		params?: PaginationParams
	): Promise<PaginatedResponse<T>> {
		return this.get<PaginatedResponse<T>>(endpoint, params);
	},

	async post<T, Dto = any>(endpoint: string, data?: Dto): Promise<T> {
		const response = await Axios.post<T>(endpoint, data);
		return response.data;
	},

	async put<T, Dto = any>(endpoint: string, data?: Dto): Promise<T> {
		const response = await Axios.put<T>(endpoint, data);
		return response.data;
	},

	async delete<T>(endpoint: string): Promise<T> {
		const response = await Axios.delete<T>(endpoint);
		return response.data;
	},
};
