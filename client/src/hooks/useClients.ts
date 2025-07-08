import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';

export interface Client {
	id: string;
	name: string;
	email: string;
	phone: string;
	address: string;
	type: 'INDIVIDUAL' | 'COMPANY';
	status: 'ACTIVE' | 'INACTIVE';
	createdAt: string;
	updatedAt: string;
}

export interface CreateClientData {
	name: string;
	email: string;
	phone?: string;
	address?: string;
	type?: 'INDIVIDUAL' | 'COMPANY';
}

export interface UpdateClientData {
	name?: string;
	email?: string;
	phone?: string;
	address?: string;
	type?: 'INDIVIDUAL' | 'COMPANY';
}

// Query keys
export const clientKeys = {
	all: ['clients'] as const,
	lists: () => [...clientKeys.all, 'list'] as const,
	list: (filters: string) => [...clientKeys.lists(), { filters }] as const,
	details: () => [...clientKeys.all, 'detail'] as const,
	detail: (id: string) => [...clientKeys.details(), id] as const,
};

// Get all clients
export const useClients = () => {
	return useQuery({
		queryKey: clientKeys.lists(),
		queryFn: async () => {
			const response = await apiService.getClients();
			return response as Client[];
		},
	});
};

// Get single client
export const useClient = (id: string) => {
	return useQuery({
		queryKey: clientKeys.detail(id),
		queryFn: async () => {
			const response = await apiService.getClient(id);
			return response as Client;
		},
		enabled: !!id,
	});
};

// Create client mutation
export const useCreateClient = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateClientData) => {
			const response = await apiService.createClient(data);
			return response as Client;
		},
		onSuccess: () => {
			// Invalidate and refetch clients list
			queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
		},
	});
};

// Update client mutation
export const useUpdateClient = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: UpdateClientData;
		}) => {
			const response = await apiService.updateClient(id, data);
			return response as Client;
		},
		onSuccess: (data) => {
			// Invalidate and refetch clients list
			queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
			// Update the specific client in cache
			queryClient.setQueryData(clientKeys.detail(data.id), data);
		},
	});
};

// Delete client mutation
export const useDeleteClient = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			await apiService.deleteClient(id);
			return id;
		},
		onSuccess: (id) => {
			// Invalidate and refetch clients list
			queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
			// Remove the specific client from cache
			queryClient.removeQueries({ queryKey: clientKeys.detail(id) });
		},
	});
};
