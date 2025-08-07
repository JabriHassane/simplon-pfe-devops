import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService } from '../../services/user.service';
import type {
	CreateUserDto,
	UpdateUserDto,
	UserDto,
} from '../../../../shared/dtos/user.dto';
import { useSnackbar } from '../useSnackbar';
import type { PaginationParams } from '../../types/pagination.types';

export interface UserFilters {
	search?: string;
}

// Query keys
export const userKeys = {
	lists: () => ['users'],
	list: (params?: PaginationParams) => [...userKeys.lists(), params],
	detail: (id: string) => [...userKeys.lists(), id],
};

// Get paginated users
export const useUsers = (params?: PaginationParams & UserFilters) => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: userKeys.list(params),
		queryFn: async () => {
			try {
				return await UserService.getPage(params);
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la récupération des utilisateurs');
				return {
					data: [] as UserDto[],
					pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
				};
			}
		},
	});
};

// Get all users (for backward compatibility)
export const useAllUsers = () => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: userKeys.lists(),
		queryFn: async () => {
			try {
				const result = await UserService.getPage();
				return result.data;
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la récupération des utilisateurs');
				return [];
			}
		},
	});
};

// Get single user
export const useUser = (id: string) => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: userKeys.detail(id),
		queryFn: async () => {
			try {
				return await UserService.getById(id);
			} catch (error) {
				console.error(error);
				showError("Erreur lors de la récupération de l'utilisateur");
				return null;
			}
		},
		enabled: !!id,
	});
};

// Create user mutation
export const useCreateUser = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateUserDto) => {
			try {
				await UserService.create(data);
				queryClient.invalidateQueries({ queryKey: userKeys.lists() });

				showSuccess('Utilisateur créé');
				callback();
			} catch (error) {
				console.error(error);
				showError("Erreur lors de la création de l'utilisateur");
			}
		},
	});
};

// Update user mutation
export const useUpdateUser = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, data }: { id: string; data: UpdateUserDto }) => {
			try {
				await UserService.update(id, data);

				queryClient.invalidateQueries({ queryKey: userKeys.lists() });
				queryClient.setQueryData(userKeys.detail(id), data);

				showSuccess('Utilisateur modifié');
				callback();
			} catch (error) {
				console.error(error);
				showError("Erreur lors de la modification de l'utilisateur");
			}
		},
	});
};

// Delete user mutation
// TODO: add callback
export const useDeleteUser = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			try {
				await UserService.delete(id);

				queryClient.invalidateQueries({ queryKey: userKeys.lists() });
				queryClient.removeQueries({ queryKey: userKeys.detail(id) });

				showSuccess('Utilisateur supprimé');
				callback();
			} catch (error) {
				console.error(error);
				showError("Erreur lors de la suppression de l'utilisateur");
			}
		},
	});
};
