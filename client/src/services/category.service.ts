import type {
	CreateCategoryDtoType,
	CategoryDtoType,
	UpdateCategoryDtoType,
} from '../../../shared/dtos/category.dto';
import { ApiService } from './api.service';
import type { PaginationParams } from './api.service';

export const CategoryService = {
	async getPage(params?: PaginationParams) {
		return ApiService.getPaginated<CategoryDtoType>(
			'/categories',
			params
		);
	},

	async getById(id: string) {
		return ApiService.get<CategoryDtoType>(`/categories/${id}`);
	},

	async create(data: CreateCategoryDtoType) {
		return ApiService.post<CategoryDtoType>('/categories', data);
	},

	async update(id: string, data: UpdateCategoryDtoType) {
		return ApiService.put<CategoryDtoType>(`/categories/${id}`, data);
	},

	async delete(id: string) {
		return ApiService.delete<void>(`/categories/${id}`);
	},
};
