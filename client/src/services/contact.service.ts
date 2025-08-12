import type {
	CreateContactDto,
	UpdateContactDto,
} from '../../../shared/dtos/contact.dto';
import type { ContactDto } from '../../../shared/dtos/contact.dto';
import { ApiService } from './api.service';
import type { PaginationParams } from '../types/pagination.types';
import type { PaginatedResponse } from '../types/pagination.types';

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
