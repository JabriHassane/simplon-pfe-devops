import { ApiService } from './api.service';
import type {
	CreateTransactionDto,
	TransactionDto,
	UpdateTransactionDto,
} from '../../../shared/dtos/transaction.dto';
import type { PaginationParams } from '../types/pagination.types';
import type { PaymentCashingDto } from '../../../shared/dtos/order.dto';

export const TransactionService = {
	async getPage(params?: PaginationParams) {
		return ApiService.getPaginated<TransactionDto>('/transactions', params);
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
		return ApiService.get<TransactionDto>(`/transactions/${id}`);
	},

	async create(data: CreateTransactionDto) {
		return ApiService.post<TransactionDto>('/transactions', data);
	},

	async cashPayment(data: PaymentCashingDto) {
		return ApiService.post<TransactionDto>(
			`/transactions/${data.id}/cash`,
			data
		);
	},

	async undoPaymentCashing(id: string) {
		return ApiService.post<TransactionDto>(`/transactions/${id}/undo-cashing`);
	},

	async depositPaymentToBank(data: PaymentCashingDto) {
		return ApiService.post<TransactionDto>(
			`/transactions/${data.id}/deposit`,
			data
		);
	},

	async undoPaymentDeposit(id: string) {
		return ApiService.post<TransactionDto>(`/transactions/${id}/undo-deposit`);
	},

	async update(id: string, data: UpdateTransactionDto) {
		return ApiService.put<TransactionDto>(`/transactions/${id}`, data);
	},

	async delete(id: string) {
		return ApiService.delete<void>(`/transactions/${id}`);
	},
};
