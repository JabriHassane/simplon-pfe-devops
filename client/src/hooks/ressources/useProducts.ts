import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductService } from '../../services/product.service';
import type {
	CreateProductDtoType,
	UpdateProductDtoType,
} from '../../../../shared/dtos/product.dto';
import { useSnackbar } from './useSnackbar';
import type { PaginationParams } from '../../services/api.service';

// Query keys
export const productKeys = {
	lists: () => ['products'],
	list: (params?: PaginationParams) => [...productKeys.lists(), params],
	detail: (id: string) => [...productKeys.lists(), id],
};

// Get paginated products
export const useProducts = (params?: PaginationParams) => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: productKeys.list(params),
		queryFn: async () => {
			try {
				return await ProductService.getPage(params);
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la récupération des produits');
				return {
					data: [],
					pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
				};
			}
		},
	});
};

// Get all products (for backward compatibility)
export const useAllProducts = () => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: productKeys.lists(),
		queryFn: async () => {
			try {
				const result = await ProductService.getPage();
				return result.data;
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la récupération des produits');
				return [];
			}
		},
	});
};

// Get single product
export const useProduct = (id: string) => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: productKeys.detail(id),
		queryFn: async () => {
			try {
				return await ProductService.getById(id);
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la récupération du produit');
				return null;
			}
		},
		enabled: !!id,
	});
};

// Create product mutation
export const useCreateProduct = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateProductDtoType) => {
			try {
				await ProductService.create(data);
				queryClient.invalidateQueries({ queryKey: productKeys.lists() });

				showSuccess('Produit créé');
				callback();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la création du produit');
			}
		},
	});
};

// Update product mutation
export const useUpdateProduct = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: UpdateProductDtoType;
		}) => {
			try {
				await ProductService.update(id, data);

				queryClient.invalidateQueries({ queryKey: productKeys.lists() });
				queryClient.setQueryData(productKeys.detail(id), data);

				showSuccess('Produit modifié');
				callback();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la modification du produit');
			}
		},
	});
};

// Delete product mutation
export const useDeleteProduct = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			try {
				await ProductService.delete(id);

				queryClient.invalidateQueries({ queryKey: productKeys.lists() });
				queryClient.removeQueries({ queryKey: productKeys.detail(id) });

				showSuccess('Produit supprimé');
				callback();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la suppression du produit');
			}
		},
	});
};
