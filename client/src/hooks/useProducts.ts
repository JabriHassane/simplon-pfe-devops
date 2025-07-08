import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';

export interface Product {
	id: string;
	name: string;
	description: string;
	price: number;
	cost: number;
	stockQuantity: number;
	sku: string;
	categoryId: string;
	category?: {
		id: string;
		name: string;
	};
	status: 'ACTIVE' | 'INACTIVE';
	createdAt: string;
	updatedAt: string;
}

export interface CreateProductData {
	name: string;
	description?: string;
	price: number;
	cost: number;
	stockQuantity: number;
	categoryId: string;
	sku?: string;
}

export interface UpdateProductData {
	name?: string;
	description?: string;
	price?: number;
	cost?: number;
	stockQuantity?: number;
	categoryId?: string;
	sku?: string;
}

// Query keys
export const productKeys = {
	all: ['products'] as const,
	lists: () => [...productKeys.all, 'list'] as const,
	list: (filters: string) => [...productKeys.lists(), { filters }] as const,
	details: () => [...productKeys.all, 'detail'] as const,
	detail: (id: string) => [...productKeys.details(), id] as const,
};

// Get all products
export const useProducts = () => {
	return useQuery({
		queryKey: productKeys.lists(),
		queryFn: async () => {
			const response = await apiService.getProducts();
			return response as Product[];
		},
	});
};

// Get single product
export const useProduct = (id: string) => {
	return useQuery({
		queryKey: productKeys.detail(id),
		queryFn: async () => {
			const response = await apiService.getProduct(id);
			return response as Product;
		},
		enabled: !!id,
	});
};

// Create product mutation
export const useCreateProduct = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateProductData) => {
			const response = await apiService.createProduct(data);
			return response as Product;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: productKeys.lists() });
		},
	});
};

// Update product mutation
export const useUpdateProduct = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: UpdateProductData;
		}) => {
			const response = await apiService.updateProduct(id, data);
			return response as Product;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: productKeys.lists() });
			queryClient.setQueryData(productKeys.detail(data.id), data);
		},
	});
};

// Delete product mutation
export const useDeleteProduct = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			await apiService.deleteProduct(id);
			return id;
		},
		onSuccess: (id) => {
			queryClient.invalidateQueries({ queryKey: productKeys.lists() });
			queryClient.removeQueries({ queryKey: productKeys.detail(id) });
		},
	});
};
