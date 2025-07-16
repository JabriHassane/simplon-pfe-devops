import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OrderService } from '../../services/order.service';
import type {
	CreateOrderDtoType,
	UpdateOrderDtoType,
} from '../../../../shared/dtos/order.dto';
import { useSnackbar } from './useSnackbar';

export interface OrderItem {
	id: string;
	product: {
		id: string;
		name: string;
	};
	quantity: number;
	price: number;
}

// Query keys
export const orderKeys = {
	lists: () => ['orders'],
	detail: (id: string) => [...orderKeys.lists(), id],
};

// Get all orders
export const useOrders = () => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: orderKeys.lists(),
		queryFn: async () => {
			try {
				return await OrderService.getAll();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la récupération des commandes');
				return [];
			}
		},
	});
};

// Get single order
export const useOrder = (id: string) => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: orderKeys.detail(id),
		queryFn: async () => {
			try {
				return await OrderService.getById(id);
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la récupération de la commande');
				return null;
			}
		},
		enabled: !!id,
	});
};

// Create order mutation
export const useCreateOrder = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateOrderDtoType) => {
			try {
				await OrderService.create(data);
				queryClient.invalidateQueries({ queryKey: orderKeys.lists() });

				showSuccess('Commande créée');
				callback();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la création de la commande');
			}
		},
		onSuccess: () => {},
	});
};

// Update order mutation
export const useUpdateOrder = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: UpdateOrderDtoType;
		}) => {
			try {
				await OrderService.update(id, data);

				queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
				queryClient.setQueryData(orderKeys.detail(id), data);

				showSuccess('Commande modifiée');
				callback();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la modification de la commande');
			}
		},
	});
};

// Delete order mutation
export const useDeleteOrder = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			try {
				await OrderService.delete(id);

				queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
				queryClient.removeQueries({ queryKey: orderKeys.detail(id) });

				showSuccess('Commande supprimée');
				callback();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la suppression de la commande');
			}
		},
	});
};
