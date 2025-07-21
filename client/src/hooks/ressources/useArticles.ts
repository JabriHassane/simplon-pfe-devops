import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArticleService } from '../../services/article.service';
import type {
	CreateArticleDtoType,
	UpdateArticleDtoType,
} from '../../../../shared/dtos/article.dto';
import { useSnackbar } from './useSnackbar';
import type { PaginationParams } from '../../services/api.service';

// Query keys
export const articleKeys = {
	lists: () => ['articles'],
	list: (params?: PaginationParams) => [...articleKeys.lists(), params],
	detail: (id: string) => [...articleKeys.lists(), id],
};

// Get paginated articles
export const useArticles = (params?: PaginationParams) => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: articleKeys.list(params),
		queryFn: async () => {
			try {
				return await ArticleService.getPage(params);
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la récupération des articles');
				return {
					data: [],
					pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
				};
			}
		},
	});
};

// Get all articles (for backward compatibility)
export const useAllArticles = () => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: articleKeys.lists(),
		queryFn: async () => {
			try {
				const result = await ArticleService.getPage();
				return result.data;
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la récupération des articles');
				return [];
			}
		},
	});
};

// Get single article
export const useArticle = (id: string) => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: articleKeys.detail(id),
		queryFn: async () => {
			try {
				return await ArticleService.getById(id);
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la récupération du article');
				return null;
			}
		},
		enabled: !!id,
	});
};

// Create article mutation
export const useCreateArticle = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateArticleDtoType) => {
			try {
				await ArticleService.create(data);
				queryClient.invalidateQueries({ queryKey: articleKeys.lists() });

				showSuccess('Article créé');
				callback();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la création du article');
			}
		},
	});
};

// Update article mutation
export const useUpdateArticle = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: UpdateArticleDtoType;
		}) => {
			try {
				await ArticleService.update(id, data);

				queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
				queryClient.setQueryData(articleKeys.detail(id), data);

				showSuccess('Article modifié');
				callback();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la modification du article');
			}
		},
	});
};

// Delete article mutation
export const useDeleteArticle = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			try {
				await ArticleService.delete(id);

				queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
				queryClient.removeQueries({ queryKey: articleKeys.detail(id) });

				showSuccess('Article supprimé');
				callback();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la suppression du article');
			}
		},
	});
};
