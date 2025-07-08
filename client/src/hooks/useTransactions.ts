import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';

export interface Transaction {
	id: string;
	account: {
		id: string;
		name: string;
	};
	type: 'INCOME' | 'EXPENSE';
	amount: number;
	description: string;
	reference: string;
	date: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateTransactionData {
	accountId: string;
	type: 'INCOME' | 'EXPENSE';
	amount: number;
	description: string;
	reference: string;
	date: string;
}

export interface UpdateTransactionData {
	accountId?: string;
	type?: 'INCOME' | 'EXPENSE';
	amount?: number;
	description?: string;
	reference?: string;
	date?: string;
}

// Query keys
const TRANSACTIONS_QUERY_KEY = ['transactions'];

// Hooks
export const useTransactions = () => {
	return useQuery({
		queryKey: TRANSACTIONS_QUERY_KEY,
		queryFn: async (): Promise<Transaction[]> => {
			const response = await apiService.getTransactions();
			return response as Transaction[];
		},
	});
};

export const useTransaction = (id: string) => {
	return useQuery({
		queryKey: [...TRANSACTIONS_QUERY_KEY, id],
		queryFn: async (): Promise<Transaction> => {
			const response = await apiService.getTransaction(id);
			return response as Transaction;
		},
		enabled: !!id,
	});
};

export const useCreateTransaction = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateTransactionData): Promise<Transaction> => {
			const response = await apiService.createTransaction(data);
			return response as Transaction;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
		},
	});
};

export const useUpdateTransaction = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: UpdateTransactionData;
		}): Promise<Transaction> => {
			const response = await apiService.updateTransaction(id, data);
			return response as Transaction;
		},
		onSuccess: (updatedTransaction) => {
			queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
			queryClient.setQueryData(
				[...TRANSACTIONS_QUERY_KEY, updatedTransaction.id],
				updatedTransaction
			);
		},
	});
};

export const useDeleteTransaction = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string): Promise<void> => {
			await apiService.deleteTransaction(id);
		},
		onSuccess: (_, deletedId) => {
			queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
			queryClient.removeQueries({
				queryKey: [...TRANSACTIONS_QUERY_KEY, deletedId],
			});
		},
	});
};
