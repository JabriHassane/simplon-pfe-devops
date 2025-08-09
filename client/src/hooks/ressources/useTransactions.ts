import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TransactionService } from '../../services/transaction.service';
import { useSnackbar } from '../useSnackbar';
import type {
	CreateTransactionDto,
	UpdateTransactionDto,
} from '../../../../shared/dtos/transaction.dto';
import type { PaginationParams } from '../../types/pagination.types';
import type { TransactionAccount } from '../../../../shared/constants';
import { orderKeys } from './useOrders';
import type { PaymentCashingDto } from '../../../../shared/dtos/order.dto';

export interface TransactionFilters {
	search?: string;
	dateFrom?: string;
	dateTo?: string;
	account?: TransactionAccount;
}

// Query keys
export const transactionKeys = {
	lists: () => ['transactions'],
	detail: (id: string) => [...transactionKeys.lists(), id],
};

// Get all transactions
export const useTransactions = (
	params?: PaginationParams & TransactionFilters
) => {
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
					pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
				};
			}
		},
	});
};

// Get payment method statistics
export const usePaymentMethodStats = () => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: [...transactionKeys.lists(), 'balances'],
		queryFn: async () => {
			try {
				return await TransactionService.getPaymentMethodStats();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la récupération des statistiques');
				return {
					cash: 0,
					check: 0,
					tpe: 0,
					bank_transfer: 0,
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
		mutationFn: async (data: CreateTransactionDto) => {
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

export const useCashPayment = (callback?: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: PaymentCashingDto) => {
			try {
				await TransactionService.cashPayment(data);

				queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
				queryClient.removeQueries({
					queryKey: transactionKeys.detail(data.id),
				});

				queryClient.invalidateQueries({ queryKey: orderKeys.lists() });

				showSuccess('Transaction encaissée');
				callback?.();
			} catch (error) {
				console.error(error);
				showError("Erreur lors de l'encaissement de la transaction");
			}
		},
	});
};

export const useDepositPayment = (callback?: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: PaymentCashingDto) => {
			try {
				await TransactionService.depositPaymentToBank(data);

				queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
				queryClient.removeQueries({
					queryKey: transactionKeys.detail(data.id),
				});

				queryClient.invalidateQueries({ queryKey: orderKeys.lists() });

				showSuccess('Transaction déposée à la banque');
				callback?.();
			} catch (error) {
				console.error(error);
				showError('Erreur lors du dépôt de la transaction à la banque');
			}
		},
	});
};

export const useUndoPaymentCashing = (callback?: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			try {
				await TransactionService.undoPaymentCashing(id);

				queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
				queryClient.removeQueries({ queryKey: transactionKeys.detail(id) });

				queryClient.invalidateQueries({ queryKey: orderKeys.lists() });

				showSuccess('Encaissement annulé');
				callback?.();
			} catch (error) {
				console.error(error);
				showError("Erreur lors de l'annulation de l'encaissement");
			}
		},
	});
};

export const useUndoPaymentDeposit = (callback?: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			try {
				await TransactionService.undoPaymentDeposit(id);

				queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
				queryClient.removeQueries({ queryKey: transactionKeys.detail(id) });

				queryClient.invalidateQueries({ queryKey: orderKeys.lists() });

				showSuccess('Dépôt annulé');
				callback?.();
			} catch (error) {
				console.error(error);
				showError("Erreur lors de l'annulation du dépôt");
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
			data: UpdateTransactionDto;
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
