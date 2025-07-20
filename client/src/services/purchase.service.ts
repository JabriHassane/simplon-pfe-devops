import type {
	CreatePurchaseDtoType,
	UpdatePurchaseDtoType,
	PurchaseDtoType,
} from '../../../shared/dtos/purchase.dto';
import { ApiService } from './api.service';
import type { PaginationParams } from './api.service';

export const PurchaseService = {
	async getPage(params?: PaginationParams) {
		return ApiService.getPaginated<PurchaseDtoType>('/purchases', params);
	},

	async getById(id: string) {
		return ApiService.get<PurchaseDtoType>(`/purchases/${id}`);
	},

	async create(data: CreatePurchaseDtoType) {
		return ApiService.post<PurchaseDtoType>('/purchases', data);
	},

	async update(id: string, data: UpdatePurchaseDtoType) {
		return ApiService.put<PurchaseDtoType>(`/purchases/${id}`, data);
	},

	async delete(id: string) {
		return ApiService.delete<void>(`/purchases/${id}`);
	},
};
