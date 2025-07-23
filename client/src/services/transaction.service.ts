import { ApiService } from './api.service';
import type {
	CreateTransactionDtoType,
	TransactionDtoType,
	UpdateTransactionDtoType,
} from '../../../shared/dtos/transaction.dto';
import type { PaginationParams } from './api.service';

export const TransactionService = {
	async getPage(params?: PaginationParams) {
		return ApiService.getPaginated<TransactionDtoType>('/transactions', params);
	},

	async getPaymentMethodStats() {
		return ApiService.get<{
			cash: number;
			check: number;
			tpe: number;
			bank_transfer: number;
		}>('/transactions/balances');
	},

	async getById(id: string) {
		return ApiService.get<TransactionDtoType>(`/transactions/${id}`);
	},

	async create(data: CreateTransactionDtoType) {
		return ApiService.post<TransactionDtoType>('/transactions', data);
	},

	async update(id: string, data: UpdateTransactionDtoType) {
		return ApiService.put<TransactionDtoType>(`/transactions/${id}`, data);
	},

	async delete(id: string) {
		return ApiService.delete<void>(`/transactions/${id}`);
	},
};
