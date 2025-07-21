import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SaleService } from '../../services/sale.service';
import type {
	CreateSaleDtoType,
	UpdateSaleDtoType,
} from '../../../../shared/dtos/sale.dto';
import { useSnackbar } from './useSnackbar';
import type { PaginationParams } from '../../services/api.service';

export interface SaleItem {
	id: string;
	article: {
		id: string;
		name: string;
	};
	quantity: number;
	price: number;
}

// Query keys
export const saleKeys = {
	lists: () => ['sales'],
	detail: (id: string) => [...saleKeys.lists(), id],
};

// Get all sales
export const useSales = (params?: PaginationParams) => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: [...saleKeys.lists(), params],
		queryFn: async () => {
			try {
				return await SaleService.getPage(params);
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la récupération des ventes');
				return {
					data: [],
					pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
				};
			}
		},
	});
};

// Get single sale
export const useSale = (id: string) => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: saleKeys.detail(id),
		queryFn: async () => {
			try {
				return await SaleService.getById(id);
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la récupération de la vente');
				return null;
			}
		},
		enabled: !!id,
	});
};

export const useSaleTransactions = (id: string) => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: [...saleKeys.lists(), 'transactions', id],
		queryFn: async () => {
			try {
				return await SaleService.getTransactions(id);
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la récupération de la vente');
				return null;
			}
		},
		enabled: !!id,
	});
};

// Create sale mutation
export const useCreateSale = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateSaleDtoType) => {
			try {
				await SaleService.create(data);
				queryClient.invalidateQueries({ queryKey: saleKeys.lists() });

				showSuccess('Commande créée');
				callback();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la création de la vente');
			}
		},
		onSuccess: () => {},
	});
};

// Update sale mutation
export const useUpdateSale = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: UpdateSaleDtoType;
		}) => {
			try {
				await SaleService.update(id, data);

				queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
				queryClient.setQueryData(saleKeys.detail(id), data);

				showSuccess('Commande modifiée');
				callback();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la modification de la vente');
			}
		},
	});
};

// Delete sale mutation
export const useDeleteSale = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			try {
				await SaleService.delete(id);

				queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
				queryClient.removeQueries({ queryKey: saleKeys.detail(id) });

				showSuccess('Commande supprimée');
				callback();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la suppression de la vente');
			}
		},
	});
};
