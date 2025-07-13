import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductService } from '../../services/product.service';
import type {
	CreateProductDtoType,
	UpdateProductDtoType,
} from '../../../../shared/dtos/product.dto';
import { useSnackbar } from './useSnackbar';

// Query keys
export const productKeys = {
	lists: () => ['products'],
	detail: (id: string) => [...productKeys.lists(), id],
};

// Get all products
export const useProducts = () => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: productKeys.lists(),
		queryFn: async () => {
			try {
				return await ProductService.getAll();
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
export const useDeleteProduct = () => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			try {
				await ProductService.delete(id);

				queryClient.invalidateQueries({ queryKey: productKeys.lists() });
				queryClient.removeQueries({ queryKey: productKeys.detail(id) });

				showSuccess('Produit supprimé');
				return id;
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la suppression du produit');
			}
		},
	});
};
