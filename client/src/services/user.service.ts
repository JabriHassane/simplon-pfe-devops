import {
	ApiService,
	type PaginationParams,
	type PaginatedResponse,
} from './api.service';
import type {
	CreateUserDtoType,
	UserDtoType,
} from '../../../shared/dtos/user.dto';
import type { UpdateUserDtoType } from '../../../shared/dtos/user.dto';

export const UserService = {
	async getPage(
		params?: PaginationParams
	): Promise<PaginatedResponse<UserDtoType>> {
		return ApiService.getPaginated<UserDtoType>('/users', params);
	},

	async getById(id: string) {
		return ApiService.get<UserDtoType>(`/users/${id}`);
	},

	async create(data: CreateUserDtoType) {
		return ApiService.post<UserDtoType>('/users', data);
	},

	async update(id: string, data: UpdateUserDtoType) {
		return ApiService.put<UserDtoType>(`/users/${id}`, data);
	},

	async delete(id: string) {
		return ApiService.delete<void>(`/users/${id}`);
	},
};
