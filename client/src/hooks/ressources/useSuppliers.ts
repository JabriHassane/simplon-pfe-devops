import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupplierService } from '../../services/supplier.service';
import type {
	CreateSupplierDtoType,
	UpdateSupplierDtoType,
} from '../../../../shared/dtos/supplier.dto';
import { useSnackbar } from './useSnackbar';

// Query keys
export const supplierKeys = {
	lists: () => ['suppliers'],
	detail: (id: string) => [...supplierKeys.lists(), id],
};

// Get all suppliers
export const useSuppliers = () => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: supplierKeys.lists(),
		queryFn: async () => {
			try {
				return await SupplierService.getAll();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la récupération des fournisseurs');
				return [];
			}
		},
	});
};

// Get single supplier
export const useSupplier = (id: string) => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: supplierKeys.detail(id),
		queryFn: async () => {
			try {
				return await SupplierService.getById(id);
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la récupération du fournisseur');
				return null;
			}
		},
		enabled: !!id,
	});
};

// Create supplier mutation
export const useCreateSupplier = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateSupplierDtoType) => {
			try {
				await SupplierService.create(data);
				queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });

				showSuccess('Fournisseur créé');
				callback();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la création du fournisseur');
			}
		},
	});
};

// Update supplier mutation
export const useUpdateSupplier = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: UpdateSupplierDtoType;
		}) => {
			try {
				await SupplierService.update(id, data);

				queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
				queryClient.setQueryData(supplierKeys.detail(id), data);

				showSuccess('Fournisseur modifié');
				callback();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la modification du fournisseur');
			}
		},
	});
};

// Delete supplier mutation
export const useDeleteSupplier = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			try {
				await SupplierService.delete(id);

				queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
				queryClient.removeQueries({ queryKey: supplierKeys.detail(id) });

				showSuccess('Fournisseur supprimé');
				callback();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la suppression du fournisseur');
			}
		},
	});
};
