import type {
	CreateClientDtoType,
	UpdateClientDtoType,
} from '../../../shared/dtos/client.dto';
import type { ClientDtoType } from '../../../shared/dtos/client.dto';
import {
	ApiService,
	type PaginationParams,
	type PaginatedResponse,
} from './api.service';

export const ClientService = {
	async getPage(
		params?: PaginationParams
	): Promise<PaginatedResponse<ClientDtoType>> {
		return ApiService.getPaginated<ClientDtoType>('/clients', params);
	},

	async getById(id: string) {
		return ApiService.get<ClientDtoType>(`/clients/${id}`);
	},

	async create(data: CreateClientDtoType) {
		return ApiService.post<ClientDtoType>('/clients', data);
	},

	async update(id: string, data: UpdateClientDtoType) {
		return ApiService.put<ClientDtoType>(`/clients/${id}`, data);
	},

	async delete(id: string) {
		return ApiService.delete<void>(`/clients/${id}`);
	},
};
