import { Axios } from '../config/axios.config';
import type {
	PaginatedResponse,
	PaginationParams,
} from '../types/pagination.types';

export const ApiService = {
	async get<T>(endpoint: string, params?: Record<string, any>) {
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
		params?: PaginationParams & Record<string, any>
	) {
		return this.get<PaginatedResponse<T>>(endpoint, params);
	},

	async post<T, Dto = any>(endpoint: string, data?: Dto) {
		const response = await Axios.post<T>(endpoint, data);
		return response.data;
	},

	async put<T, Dto = any>(endpoint: string, data?: Dto) {
		const response = await Axios.put<T>(endpoint, data);
		return response.data;
	},

	async delete<T>(endpoint: string) {
		const response = await Axios.delete<T>(endpoint);
		return response.data;
	},
};
