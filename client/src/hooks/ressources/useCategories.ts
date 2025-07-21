import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CategoryService } from '../../services/category.service';
import type {
	CreateCategoryDtoType,
	UpdateCategoryDtoType,
} from '../../../../shared/dtos/category.dto';
import { useSnackbar } from './useSnackbar';
import type { PaginationParams } from '../../services/api.service';

// Query keys
export const CategoryKeys = {
	lists: () => ['categories'],
	detail: (id: string) => [...CategoryKeys.lists(), id],
};

// Get all categories
export const useCategories = (params?: PaginationParams) => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: [...CategoryKeys.lists(), params],
		queryFn: async () => {
			try {
				return await CategoryService.getPage(params);
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la récupération des catégories de articles');
				return {
					data: [],
					pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
				};
			}
		},
	});
};

// Get single category
export const useCategory = (id: string) => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: CategoryKeys.detail(id),
		queryFn: async () => {
			try {
				return await CategoryService.getById(id);
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la récupération de la catégorie');
				return null;
			}
		},
		enabled: !!id,
	});
};

// Create article category mutation
export const useCreateCategory = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateCategoryDtoType) => {
			try {
				await CategoryService.create(data);
				queryClient.invalidateQueries({
					queryKey: CategoryKeys.lists(),
				});

				showSuccess('Catégorie créée');
				callback();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la création de la catégorie');
			}
		},
	});
};

// Update article category mutation
export const useUpdateCategory = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: UpdateCategoryDtoType;
		}) => {
			try {
				await CategoryService.update(id, data);

				queryClient.invalidateQueries({
					queryKey: CategoryKeys.lists(),
				});
				queryClient.setQueryData(CategoryKeys.detail(id), data);

				showSuccess('Catégorie modifiée');
				callback();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la modification de la catégorie');
			}
		},
	});
};

// Delete article category mutation
export const useDeleteCategory = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			try {
				await CategoryService.delete(id);

				queryClient.invalidateQueries({
					queryKey: CategoryKeys.lists(),
				});
				queryClient.removeQueries({ queryKey: CategoryKeys.detail(id) });

				showSuccess('Catégorie supprimée');
				callback();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la suppression de la catégorie');
			}
		},
	});
};
