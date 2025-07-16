import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AccountService } from '../../services/account.service';
import { useSnackbar } from './useSnackbar';
import type {
	CreateAccountDtoType,
	UpdateAccountDtoType,
} from '../../../../shared/dtos/account.dto';

// Query keys
export const accountKeys = {
	all: ['accounts'] as const,
	lists: () => [...accountKeys.all, 'list'] as const,
	list: (filters: string) => [...accountKeys.lists(), { filters }] as const,
	details: () => [...accountKeys.all, 'detail'] as const,
	detail: (id: string) => [...accountKeys.details(), id] as const,
};

// Get all accounts
export const useAccounts = () => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: accountKeys.lists(),
		queryFn: async () => {
			try {
				return await AccountService.getAll();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la récupération des comptes');
				return [];
			}
		},
	});
};

// Get single account
export const useAccount = (id: string) => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: accountKeys.detail(id),
		queryFn: async () => {
			try {
				return await AccountService.getById(id);
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la récupération du compte');
				return null;
			}
		},
		enabled: !!id,
	});
};

// Create account mutation
export const useCreateAccount = (callback: () => void) => {
	const queryClient = useQueryClient();
	const { showSuccess, showError } = useSnackbar();

	return useMutation({
		mutationFn: async (data: CreateAccountDtoType) => {
			try {
				await AccountService.create(data);

				queryClient.invalidateQueries({ queryKey: accountKeys.lists() });

				showSuccess('Compte créé');
				callback();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la création du compte');
			}
		},
	});
};

// Update account mutation
export const useUpdateAccount = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: UpdateAccountDtoType;
		}) => {
			try {
				await AccountService.update(id, data);

				queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
				queryClient.setQueryData(accountKeys.detail(id), data);

				showSuccess('Compte modifié');
				callback();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la modification du compte');
			}
		},
	});
};

// Delete account mutation
export const useDeleteAccount = (callback: () => void) => {
	const queryClient = useQueryClient();
	const { showSuccess, showError } = useSnackbar();

	return useMutation({
		mutationFn: async (id: string) => {
			try {
				await AccountService.deleteById(id);

				queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
				queryClient.removeQueries({ queryKey: accountKeys.detail(id) });

				showSuccess('Compte supprimé');
				callback();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la suppression du compte');
			}
		},
	});
};
