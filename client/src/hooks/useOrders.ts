import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';

export interface OrderItem {
	id: string;
	product: {
		id: string;
		name: string;
	};
	quantity: number;
	price: number;
}

export interface Order {
	id: string;
	client: {
		id: string;
		name: string;
	};
	items: OrderItem[];
	totalAmount: number;
	discountAmount: number;
	discountType: 'PERCENTAGE' | 'FIXED';
	status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
	notes: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateOrderData {
	clientId: string;
	items: Array<{
		productId: string;
		quantity: number;
		price: number;
	}>;
	discountAmount: number;
	discountType: 'PERCENTAGE' | 'FIXED';
	notes?: string;
}

export interface UpdateOrderData {
	clientId?: string;
	items?: Array<{
		productId: string;
		quantity: number;
		price: number;
	}>;
	discountAmount?: number;
	discountType?: 'PERCENTAGE' | 'FIXED';
	status?: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
	notes?: string;
}

// Query keys
const ORDERS_QUERY_KEY = ['orders'];

// Hooks
export const useOrders = () => {
	return useQuery({
		queryKey: ORDERS_QUERY_KEY,
		queryFn: async (): Promise<Order[]> => {
			const response = await apiService.getOrders();
			return response as Order[];
		},
	});
};

export const useOrder = (id: string) => {
	return useQuery({
		queryKey: [...ORDERS_QUERY_KEY, id],
		queryFn: async (): Promise<Order> => {
			const response = await apiService.getOrder(id);
			return response as Order;
		},
		enabled: !!id,
	});
};

export const useCreateOrder = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateOrderData): Promise<Order> => {
			const response = await apiService.createOrder(data);
			return response as Order;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
		},
	});
};

export const useUpdateOrder = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: UpdateOrderData;
		}): Promise<Order> => {
			const response = await apiService.updateOrder(id, data);
			return response as Order;
		},
		onSuccess: (updatedOrder) => {
			queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
			queryClient.setQueryData(
				[...ORDERS_QUERY_KEY, updatedOrder.id],
				updatedOrder
			);
		},
	});
};

export const useDeleteOrder = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string): Promise<void> => {
			await apiService.deleteOrder(id);
		},
		onSuccess: (_, deletedId) => {
			queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
			queryClient.removeQueries({ queryKey: [...ORDERS_QUERY_KEY, deletedId] });
		},
	});
};
