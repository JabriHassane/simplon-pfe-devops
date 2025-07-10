import type {
	CreateProductDtoType,
	ProductDtoType,
	UpdateProductDtoType,
} from '../../../shared/dtos/product.dto';
import { ApiService } from './api.service';

export const ProductService = {
	async getAll() {
		return ApiService.get<ProductDtoType[]>('/products');
	},

	async getById(id: string) {
		return ApiService.get<ProductDtoType>(`/products/${id}`);
	},

	async create(data: CreateProductDtoType) {
		return ApiService.post<ProductDtoType>('/products', data);
	},

	async update(id: string, data: UpdateProductDtoType) {
		return ApiService.put<ProductDtoType>(`/products/${id}`, data);
	},

	async delete(id: string) {
		return ApiService.delete<void>(`/products/${id}`);
	},
};
