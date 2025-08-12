import type {
	CreateOrderDto,
	UpdateOrderDto,
} from '../../../shared/dtos/order.dto';
import type { OrderDto } from '../../../shared/dtos/order.dto';
import type { OrderFilterParams } from '../types/filters.types';
import type { PaginationParams } from '../types/pagination.types';
import { ApiService } from './api.service';

export const OrderService = {
	async getPage(params?: PaginationParams & OrderFilterParams) {
		return ApiService.getPaginated<OrderDto>('/orders', params);
	},

	async getById(id: string) {
		return ApiService.get<OrderDto>(`/orders/${id}`);
	},

	async getTransactions(id: string) {
		return ApiService.get<any[]>(`/orders/${id}/transactions`);
	},

	async create(data: CreateOrderDto) {
		return ApiService.post<OrderDto>('/orders', data);
	},

	async update(id: string, data: UpdateOrderDto) {
		return ApiService.put<OrderDto>(`/orders/${id}`, data);
	},

	async delete(id: string) {
		return ApiService.delete<void>(`/orders/${id}`);
	},
};
