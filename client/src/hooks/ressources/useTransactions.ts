import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TransactionService } from '../../services/transaction.service';
import { useSnackbar } from './useSnackbar';
import type {
	CreateTransactionDtoType,
	UpdateTransactionDtoType,
} from '../../../../shared/dtos/transaction.dto';
import type { PaginationParams } from '../../services/api.service';

// Query keys
export const transactionKeys = {
	lists: () => ['transactions'],
	detail: (id: string) => [...transactionKeys.lists(), id],
};

// Get all transactions
export const useTransactions = (params?: PaginationParams) => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: [...transactionKeys.lists(), params],
		queryFn: async () => {
			try {
				return await TransactionService.getPage(params);
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la récupération des transactions');
				return {
					data: [],
					pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
				};
			}
		},
	});
};

export const useTransaction = (id: string) => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: transactionKeys.detail(id),
		queryFn: async () => {
			try {
				return await TransactionService.getById(id);
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la récupération de la transaction');
				return null;
			}
		},
		enabled: !!id,
	});
};

export const useCreateTransaction = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateTransactionDtoType) => {
			try {
				await TransactionService.create(data);

				queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });

				showSuccess('Transaction créée');
				callback();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la création de la transaction');
			}
		},
	});
};

export const useUpdateTransaction = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: UpdateTransactionDtoType;
		}) => {
			try {
				await TransactionService.update(id, data);

				queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
				queryClient.setQueryData(transactionKeys.detail(id), data);

				showSuccess('Transaction modifiée');
				callback();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la modification de la transaction');
			}
		},
	});
};

export const useDeleteTransaction = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			try {
				await TransactionService.delete(id);

				queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
				queryClient.removeQueries({ queryKey: transactionKeys.detail(id) });

				showSuccess('Transaction supprimée');
				callback();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la suppression de la transaction');
			}
		},
	});
};
