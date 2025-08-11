import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OrderService } from '../../services/order.service';
import type {
	CreateOrderDto,
	UpdateOrderDto,
} from '../../../../shared/dtos/order.dto';
import { useSnackbar } from '../useSnackbar';
import type { PaginationParams } from '../../types/pagination.types';
import type { OrderFilterParams } from '../../types/filters.types';

// Query keys
export const orderKeys = {
	lists: () => ['orders'],
	list: (params?: PaginationParams & { type?: string }) => [
		...orderKeys.lists(),
		params,
	],
	detail: (id: string) => [...orderKeys.lists(), id],
	transactions: (id: string) => [...orderKeys.detail(id), 'transactions'],
};

// Get paginated orders
export const useOrders = (params?: PaginationParams & OrderFilterParams) => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: orderKeys.list(params),
		queryFn: async () => {
			try {
				return await OrderService.getPage(params);
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la récupération des commandes');
				return {
					data: [],
					pagination: { page: 1, pageSize: 10, total: 0 },
				};
			}
		},
	});
};

// Get orders by type
export const useOrdersByType = (
	type: 'sale' | 'purchase',
	params?: PaginationParams
) => {
	return useOrders({ ...params, type });
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

// Get order transactions
export const useOrderTransactions = (id: string) => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: orderKeys.transactions(id),
		queryFn: async () => {
			try {
				return await OrderService.getTransactions(id);
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la récupération des transactions');
				return [];
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
		mutationFn: async (data: CreateOrderDto) => {
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
	});
};

// Update order mutation
export const useUpdateOrder = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, data }: { id: string; data: UpdateOrderDto }) => {
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
