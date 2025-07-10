import { Axios } from "../config/axios.config";

export const ApiService = {
	async get<T>(endpoint: string): Promise<T> {
		const response = await Axios.get<T>(endpoint);
		return response.data;
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
