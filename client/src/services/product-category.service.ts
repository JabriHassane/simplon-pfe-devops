import type {
	CreateProductCategoryDtoType,
	ProductCategoryDtoType,
	UpdateProductCategoryDtoType,
} from '../../../shared/dtos/product-category.dto';
import { ApiService } from './api.service';
import type { PaginationParams } from './api.service';

export const ProductCategoryService = {
	async getPage(params?: PaginationParams) {
		return ApiService.getPaginated<ProductCategoryDtoType>(
			'/product-categories',
			params
		);
	},

	async getById(id: string) {
		return ApiService.get<ProductCategoryDtoType>(`/product-categories/${id}`);
	},

	async create(data: CreateProductCategoryDtoType) {
		return ApiService.post<ProductCategoryDtoType>('/product-categories', data);
	},

	async update(id: string, data: UpdateProductCategoryDtoType) {
		return ApiService.put<ProductCategoryDtoType>(
			`/product-categories/${id}`,
			data
		);
	},

	async delete(id: string) {
		return ApiService.delete<void>(`/product-categories/${id}`);
	},
};
