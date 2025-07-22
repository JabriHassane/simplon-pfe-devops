import type { LoginDtoType, VerifyPasswordDtoType } from '../../../shared/dtos/auth.dto';
import type { UserDtoType } from '../../../shared/dtos/user.dto';
import { ApiService } from './api.service';

export const AuthService = {
	async getConnectedUser() {
		return ApiService.get<UserDtoType>('/auth/me');
	},

	async login(data: LoginDtoType) {
		return ApiService.post<UserDtoType>('/auth/login', data);
	},

	async logout() {
		return ApiService.post<void>('/auth/logout');
	},

	async refresh() {
		return ApiService.post<{ message: string }>('/auth/refresh');
	},

	async verifyPassword(data: VerifyPasswordDtoType) {
		return ApiService.post<{ message: string }>('/auth/verify-password', data);
	},
};
