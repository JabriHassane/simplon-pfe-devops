import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';

export interface Supplier {
	id: string;
	name: string;
	email: string;
	phone: string;
	address: string;
	contactPerson: string;
	status: 'ACTIVE' | 'INACTIVE';
	createdAt: string;
	updatedAt: string;
}

export interface CreateSupplierData {
	name: string;
	email: string;
	phone?: string;
	address?: string;
	contactPerson?: string;
}

export interface UpdateSupplierData {
	name?: string;
	email?: string;
	phone?: string;
	address?: string;
	contactPerson?: string;
}

// Query keys
export const supplierKeys = {
	all: ['suppliers'] as const,
	lists: () => [...supplierKeys.all, 'list'] as const,
	list: (filters: string) => [...supplierKeys.lists(), { filters }] as const,
	details: () => [...supplierKeys.all, 'detail'] as const,
	detail: (id: string) => [...supplierKeys.details(), id] as const,
};

// Get all suppliers
export const useSuppliers = () => {
	return useQuery({
		queryKey: supplierKeys.lists(),
		queryFn: async () => {
			const response = await apiService.getSuppliers();
			return response as Supplier[];
		},
	});
};

// Get single supplier
export const useSupplier = (id: string) => {
	return useQuery({
		queryKey: supplierKeys.detail(id),
		queryFn: async () => {
			const response = await apiService.getSupplier(id);
			return response as Supplier;
		},
		enabled: !!id,
	});
};

// Create supplier mutation
export const useCreateSupplier = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateSupplierData) => {
			const response = await apiService.createSupplier(data);
			return response as Supplier;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
		},
	});
};

// Update supplier mutation
export const useUpdateSupplier = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: UpdateSupplierData;
		}) => {
			const response = await apiService.updateSupplier(id, data);
			return response as Supplier;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
			queryClient.setQueryData(supplierKeys.detail(data.id), data);
		},
	});
};

// Delete supplier mutation
export const useDeleteSupplier = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			await apiService.deleteSupplier(id);
			return id;
		},
		onSuccess: (id) => {
			queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
			queryClient.removeQueries({ queryKey: supplierKeys.detail(id) });
		},
	});
};
