import type {
	CreateSaleDtoType,
	UpdateSaleDtoType,
} from '../../../shared/dtos/sale.dto';
import type { SaleDtoType } from '../../../shared/dtos/sale.dto';
import { ApiService } from './api.service';
import type { PaginationParams } from './api.service';
import type { TransactionDtoType } from '../../../shared/dtos/transaction.dto';

export const SaleService = {
	async getPage(params?: PaginationParams) {
		return ApiService.getPaginated<SaleDtoType>('/sales', params);
	},

	async getById(id: string) {
		return ApiService.get<SaleDtoType>(`/sales/${id}`);
	},

	async getTransactions(id: string) {
		return ApiService.get<TransactionDtoType[]>(`/sales/${id}/transactions`);
	},

	async create(data: CreateSaleDtoType) {
		return ApiService.post<SaleDtoType>('/sales', data);
	},

	async update(id: string, data: UpdateSaleDtoType) {
		return ApiService.put<SaleDtoType>(`/sales/${id}`, data);
	},

	async delete(id: string) {
		return ApiService.delete<void>(`/sales/${id}`);
	},
};
