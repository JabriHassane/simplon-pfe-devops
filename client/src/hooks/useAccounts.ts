import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';

export interface Account {
	id: string;
	name: string;
	ref: string;
	balance: number;
	createdAt: string;
	updatedAt: string;
}

export interface CreateAccountData {
	name: string;
	balance?: number;
}

export interface UpdateAccountData {
	name?: string;
	balance?: number;
}

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
	return useQuery({
		queryKey: accountKeys.lists(),
		queryFn: async () => {
			const response = await apiService.getAccounts();
			return response as Account[];
		},
	});
};

// Get single account
export const useAccount = (id: string) => {
	return useQuery({
		queryKey: accountKeys.detail(id),
		queryFn: async () => {
			const response = await apiService.getAccount(id);
			return response as Account;
		},
		enabled: !!id,
	});
};

// Create account mutation
export const useCreateAccount = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateAccountData) => {
			const response = await apiService.createAccount(data);
			return response as Account;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
		},
	});
};

// Update account mutation
export const useUpdateAccount = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: UpdateAccountData;
		}) => {
			const response = await apiService.updateAccount(id, data);
			return response as Account;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
			queryClient.setQueryData(accountKeys.detail(data.id), data);
		},
	});
};

// Delete account mutation
export const useDeleteAccount = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			await apiService.deleteAccount(id);
			return id;
		},
		onSuccess: (id) => {
			queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
			queryClient.removeQueries({ queryKey: accountKeys.detail(id) });
		},
	});
};
