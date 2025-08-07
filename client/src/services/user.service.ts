import {
	ApiService,
	type PaginationParams,
	type PaginatedResponse,
} from './api.service';
import type { CreateUserDto, UserDto } from '../../../shared/dtos/user.dto';
import type { UpdateUserDto } from '../../../shared/dtos/user.dto';

export const UserService = {
	async getPage(
		params?: PaginationParams
	): Promise<PaginatedResponse<UserDto>> {
		return ApiService.getPaginated<UserDto>('/users', params);
	},

	async getById(id: string) {
		return ApiService.get<UserDto>(`/users/${id}`);
	},

	async create(data: CreateUserDto) {
		return ApiService.post<UserDto>('/users', data);
	},

	async update(id: string, data: UpdateUserDto) {
		return ApiService.put<UserDto>(`/users/${id}`, data);
	},

	async delete(id: string) {
		return ApiService.delete<void>(`/users/${id}`);
	},
};
