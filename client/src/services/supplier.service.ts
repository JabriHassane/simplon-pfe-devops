import type { SupplierDtoType } from '../../../shared/dtos/supplier.dto';
import type { CreateSupplierDtoType } from '../../../shared/dtos/supplier.dto';
import type { UpdateSupplierDtoType } from '../../../shared/dtos/supplier.dto';
import {
	ApiService,
	type PaginationParams,
	type PaginatedResponse,
} from './api.service';

export const SupplierService = {
	async getPage(
		params?: PaginationParams
	): Promise<PaginatedResponse<SupplierDtoType>> {
		return ApiService.getPaginated<SupplierDtoType>('/suppliers', params);
	},

	async getById(id: string) {
		return ApiService.get<SupplierDtoType>(`/suppliers/${id}`);
	},

	async create(data: CreateSupplierDtoType) {
		return ApiService.post<SupplierDtoType>('/suppliers', data);
	},

	async update(id: string, data: UpdateSupplierDtoType) {
		return ApiService.put<SupplierDtoType>(`/suppliers/${id}`, data);
	},

	async delete(id: string) {
		return ApiService.delete<void>(`/suppliers/${id}`);
	},
};
