import type {
	AccountDtoType,
	CreateAccountDtoType,
} from '../../../shared/dtos/account.dto';
import type { UpdateAccountDtoType } from '../../../shared/dtos/account.dto';
import { ApiService } from './api.service';

export const AccountService = {
	async getAll() {
		return ApiService.get<AccountDtoType[]>('/accounts');
	},

	async getById(id: string) {
		return ApiService.get<AccountDtoType>(`/accounts/${id}`);
	},

	async create(data: CreateAccountDtoType) {
		return ApiService.post<AccountDtoType>('/accounts', data);
	},

	async update(id: string, data: UpdateAccountDtoType) {
		return ApiService.put<AccountDtoType>(`/accounts/${id}`, data);
	},

	async deleteById(id: string) {
		return ApiService.delete<AccountDtoType>(`/accounts/${id}`);
	},
};
