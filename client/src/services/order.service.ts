import type {
	CreateOrderDtoType,
	UpdateOrderDtoType,
} from '../../../shared/dtos/order.dto';
import type { OrderDtoType } from '../../../shared/dtos/order.dto';
import { ApiService } from './api.service';
import type { PaginationParams } from './api.service';

export const OrderService = {
	async getPage(params?: PaginationParams) {
		return ApiService.getPaginated<OrderDtoType>('/orders', params);
	},

	async getById(id: string) {
		return ApiService.get<OrderDtoType>(`/orders/${id}`);
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
