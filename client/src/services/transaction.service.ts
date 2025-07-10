import { ApiService } from './api.service';
import type {
	CreateTransactionDtoType,
	TransactionDtoType,
	UpdateTransactionDtoType,
} from '../../../shared/dtos/transaction.dto';

export const TransactionService = {
	async getAll() {
		return ApiService.get<TransactionDtoType[]>('/transactions');
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
