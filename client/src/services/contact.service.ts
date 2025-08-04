import type {
	CreateContactDtoType,
	UpdateContactDtoType,
} from '../../../shared/dtos/contact.dto';
import type { ContactDtoType } from '../../../shared/dtos/contact.dto';
import {
	ApiService,
	type PaginationParams,
	type PaginatedResponse,
} from './api.service';

export const ContactService = {
	async getPage(
		params?: PaginationParams & { type?: string }
	): Promise<PaginatedResponse<ContactDtoType>> {
		return ApiService.getPaginated<ContactDtoType>('/contacts', params);
	},

	async getById(id: string) {
		return ApiService.get<ContactDtoType>(`/contacts/${id}`);
	},

	async create(data: CreateContactDtoType) {
		return ApiService.post<ContactDtoType>('/contacts', data);
	},

	async update(id: string, data: UpdateContactDtoType) {
		return ApiService.put<ContactDtoType>(`/contacts/${id}`, data);
	},

	async delete(id: string) {
		return ApiService.delete<void>(`/contacts/${id}`);
	},
};
