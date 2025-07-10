import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PurchaseService } from '../../services/purchase.service';
import type {
	CreatePurchaseDtoType,
	UpdatePurchaseDtoType,
} from '../../../../shared/dtos/purchase.dto';
import { useSnackbar } from './useSnackbar';

// Query keys
export const purchaseKeys = {
	lists: () => ['purchases'],
	detail: (id: string) => [...purchaseKeys.lists(), id],
};

// Get all purchases
export const usePurchases = () => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: purchaseKeys.lists(),
		queryFn: async () => {
			try {
				return await PurchaseService.getAll();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la récupération des achats');
				return [];
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
export const useCreatePurchase = () => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreatePurchaseDtoType) => {
			try {
				await PurchaseService.create(data);
				queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() });

				showSuccess('Achat créé');
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
export const useDeletePurchase = () => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			try {
				await PurchaseService.delete(id);

				queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() });
				queryClient.removeQueries({ queryKey: purchaseKeys.detail(id) });

				showSuccess('Achat supprimé');
			} catch (error) {
				console.error(error);
				showError("Erreur lors de la suppression de l'achat");
			}
		},
	});
};
