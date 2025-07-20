import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PurchaseService } from '../../services/purchase.service';
import type {
	CreatePurchaseDtoType,
	UpdatePurchaseDtoType,
} from '../../../../shared/dtos/purchase.dto';
import { useSnackbar } from './useSnackbar';
import type { PaginationParams } from '../../services/api.service';

// Query keys
export const purchaseKeys = {
	lists: () => ['purchases'],
	detail: (id: string) => [...purchaseKeys.lists(), id],
};

// Get all purchases
export const usePurchases = (params?: PaginationParams) => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: [...purchaseKeys.lists(), params],
		queryFn: async () => {
			try {
				return await PurchaseService.getPage(params);
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la récupération des achats');
				return {
					data: [],
					pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
				};
			}
		},
	});
};

// Get single purchase
export const usePurchase = (id: string) => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: purchaseKeys.detail(id),
		queryFn: async () => {
			try {
				return await PurchaseService.getById(id);
			} catch (error) {
				console.error(error);
				showError("Erreur lors de la récupération de l'achat");
				return null;
			}
		},
		enabled: !!id,
	});
};

// Create purchase mutation
export const useCreatePurchase = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreatePurchaseDtoType) => {
			try {
				await PurchaseService.create(data);
				queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() });

				showSuccess('Achat créé');
				callback();
			} catch (error) {
				console.error(error);
				showError("Erreur lors de la création de l'achat");
			}
		},
		onSuccess: () => {},
	});
};

// Update purchase mutation
export const useUpdatePurchase = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: UpdatePurchaseDtoType;
		}) => {
			try {
				await PurchaseService.update(id, data);

				queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() });
				queryClient.setQueryData(purchaseKeys.detail(id), data);

				showSuccess('Achat modifié');
				callback();
			} catch (error) {
				console.error(error);
				showError("Erreur lors de la modification de l'achat");
			}
		},
	});
};

// Delete purchase mutation
export const useDeletePurchase = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			try {
				await PurchaseService.delete(id);

				queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() });
				queryClient.removeQueries({ queryKey: purchaseKeys.detail(id) });

				showSuccess('Achat supprimé');
				callback();
			} catch (error) {
				console.error(error);
				showError("Erreur lors de la suppression de l'achat");
			}
		},
	});
};
