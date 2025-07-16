import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductCategoryService } from '../../services/product-category.service';
import type {
	CreateProductCategoryDtoType,
	UpdateProductCategoryDtoType,
} from '../../../../shared/dtos/product-category.dto';
import { useSnackbar } from './useSnackbar';

// Query keys
export const productCategoryKeys = {
	lists: () => ['product-categories'],
	detail: (id: string) => [...productCategoryKeys.lists(), id],
};

// Get all product categories
export const useProductCategories = () => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: productCategoryKeys.lists(),
		queryFn: async () => {
			try {
				return await ProductCategoryService.getAll();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la récupération des catégories');
				return [];
			}
		},
	});
};

// Get single product category
export const useProductCategory = (id: string) => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: productCategoryKeys.detail(id),
		queryFn: async () => {
			try {
				return await ProductCategoryService.getById(id);
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la récupération de la catégorie');
				return null;
			}
		},
		enabled: !!id,
	});
};

// Create product category mutation
export const useCreateProductCategory = () => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateProductCategoryDtoType) => {
			try {
				await ProductCategoryService.create(data);
				queryClient.invalidateQueries({
					queryKey: productCategoryKeys.lists(),
				});

				showSuccess('Catégorie créée');
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la création de la catégorie');
			}
		},
		onSuccess: () => {},
	});
};

// Update product category mutation
export const useUpdateProductCategory = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: UpdateProductCategoryDtoType;
		}) => {
			try {
				await ProductCategoryService.update(id, data);

				queryClient.invalidateQueries({
					queryKey: productCategoryKeys.lists(),
				});
				queryClient.setQueryData(productCategoryKeys.detail(id), data);

				showSuccess('Catégorie modifiée');
				callback();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la modification de la catégorie');
			}
		},
	});
};

// Delete product category mutation
export const useDeleteProductCategory = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			try {
				await ProductCategoryService.delete(id);

				queryClient.invalidateQueries({
					queryKey: productCategoryKeys.lists(),
				});
				queryClient.removeQueries({ queryKey: productCategoryKeys.detail(id) });

				showSuccess('Catégorie supprimée');
				callback();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la suppression de la catégorie');
			}
		},
	});
};
