import type {
	LoginDto,
	VerifyPasswordDto,
} from '../../../shared/dtos/auth.dto';
import type { UserDto } from '../../../shared/dtos/user.dto';
import { ApiService } from './api.service';

export const AuthService = {
	async getConnectedUser() {
		return ApiService.get<UserDto>('/auth/me');
	},

	async login(data: LoginDto) {
		return ApiService.post<UserDto>('/auth/login', data);
	},

	async logout() {
		return ApiService.post<void>('/auth/logout');
	},

	async refresh() {
		return ApiService.post<{ message: string }>('/auth/refresh');
	},

	async verifyPassword(data: VerifyPasswordDto) {
		return ApiService.post<{ message: string }>('/auth/verify-password', data);
	},
};
