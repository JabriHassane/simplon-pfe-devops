import type {
	CreateOrderDtoType,
	UpdateOrderDtoType,
} from '../../../shared/dtos/order.dto';
import type { OrderDtoType } from '../../../shared/dtos/order.dto';
import type { OrderFilters } from '../hooks/ressources/useOrders';
import type { PaginationParams } from '../types/pagination.types';
import { ApiService } from './api.service';

export const OrderService = {
	async getPage(params?: PaginationParams & OrderFilters) {
		return ApiService.getPaginated<OrderDtoType>('/orders', params);
	},

	async getById(id: string) {
		return ApiService.get<OrderDtoType>(`/orders/${id}`);
	},

	async getTransactions(id: string) {
		return ApiService.get<any[]>(`/orders/${id}/transactions`);
	},

	async create(data: CreateOrderDtoType) {
		return ApiService.post<OrderDtoType>('/orders', data);
	},

	async update(id: string, data: UpdateOrderDtoType) {
		return ApiService.put<OrderDtoType>(`/orders/${id}`, data);
	},

	async delete(id: string) {
		return ApiService.delete<void>(`/orders/${id}`);
	},
};
