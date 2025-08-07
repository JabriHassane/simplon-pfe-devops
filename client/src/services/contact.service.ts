import type {
	CreateContactDto,
	UpdateContactDto,
} from '../../../shared/dtos/contact.dto';
import type { ContactDto } from '../../../shared/dtos/contact.dto';
import {
	ApiService,
	type PaginationParams,
	type PaginatedResponse,
} from './api.service';

export const ContactService = {
	async getPage(
		params?: PaginationParams & { type?: string }
	): Promise<PaginatedResponse<ContactDto>> {
		return ApiService.getPaginated<ContactDto>('/contacts', params);
	},

	async getById(id: string) {
		return ApiService.get<ContactDto>(`/contacts/${id}`);
	},

	async create(data: CreateContactDto) {
		return ApiService.post<ContactDto>('/contacts', data);
	},

	async update(id: string, data: UpdateContactDto) {
		return ApiService.put<ContactDto>(`/contacts/${id}`, data);
	},

	async delete(id: string) {
		return ApiService.delete<void>(`/contacts/${id}`);
	},
};
