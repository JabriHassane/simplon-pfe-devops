import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';

export interface ProductCategory {
	id: string;
	name: string;
	description: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateProductCategoryData {
	name: string;
	description?: string;
}

export interface UpdateProductCategoryData {
	name?: string;
	description?: string;
}

// Query keys
export const productCategoryKeys = {
	all: ['productCategories'] as const,
	lists: () => [...productCategoryKeys.all, 'list'] as const,
	list: (filters: string) =>
		[...productCategoryKeys.lists(), { filters }] as const,
	details: () => [...productCategoryKeys.all, 'detail'] as const,
	detail: (id: string) => [...productCategoryKeys.details(), id] as const,
};

// Get all product categories
export const useProductCategories = () => {
	return useQuery({
		queryKey: productCategoryKeys.lists(),
		queryFn: async () => {
			const response = await apiService.getProductCategories();
			return response as ProductCategory[];
		},
	});
};

// Get single product category
export const useProductCategory = (id: string) => {
	return useQuery({
		queryKey: productCategoryKeys.detail(id),
		queryFn: async () => {
			const response = await apiService.getProductCategory(id);
			return response as ProductCategory;
		},
		enabled: !!id,
	});
};

// Create product category mutation
export const useCreateProductCategory = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateProductCategoryData) => {
			const response = await apiService.createProductCategory(data);
			return response as ProductCategory;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: productCategoryKeys.lists() });
		},
	});
};

// Update product category mutation
export const useUpdateProductCategory = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: UpdateProductCategoryData;
		}) => {
			const response = await apiService.updateProductCategory(id, data);
			return response as ProductCategory;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: productCategoryKeys.lists() });
			queryClient.setQueryData(productCategoryKeys.detail(data.id), data);
		},
	});
};

// Delete product category mutation
export const useDeleteProductCategory = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			await apiService.deleteProductCategory(id);
			return id;
		},
		onSuccess: (id) => {
			queryClient.invalidateQueries({ queryKey: productCategoryKeys.lists() });
			queryClient.removeQueries({ queryKey: productCategoryKeys.detail(id) });
		},
	});
};
