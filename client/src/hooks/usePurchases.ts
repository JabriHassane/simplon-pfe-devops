import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';

export interface PurchaseItem {
	id: string;
	product: {
		id: string;
		name: string;
	};
	quantity: number;
	price: number;
}

export interface Purchase {
	id: string;
	supplier: {
		id: string;
		name: string;
	};
	items: PurchaseItem[];
	totalAmount: number;
	discountAmount: number;
	discountType: 'PERCENTAGE' | 'FIXED';
	status: 'PENDING' | 'CONFIRMED' | 'RECEIVED' | 'CANCELLED';
	notes: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreatePurchaseData {
	supplierId: string;
	items: Array<{
		productId: string;
		quantity: number;
		price: number;
	}>;
	discountAmount: number;
	discountType: 'PERCENTAGE' | 'FIXED';
	notes?: string;
}

export interface UpdatePurchaseData {
	supplierId?: string;
	items?: Array<{
		productId: string;
		quantity: number;
		price: number;
	}>;
	discountAmount?: number;
	discountType?: 'PERCENTAGE' | 'FIXED';
	status?: 'PENDING' | 'CONFIRMED' | 'RECEIVED' | 'CANCELLED';
	notes?: string;
}

// Query keys
const PURCHASES_QUERY_KEY = ['purchases'];

// Hooks
export const usePurchases = () => {
	return useQuery({
		queryKey: PURCHASES_QUERY_KEY,
		queryFn: async (): Promise<Purchase[]> => {
			const response = await apiService.getPurchases();
			return response as Purchase[];
		},
	});
};

export const usePurchase = (id: string) => {
	return useQuery({
		queryKey: [...PURCHASES_QUERY_KEY, id],
		queryFn: async (): Promise<Purchase> => {
			const response = await apiService.getPurchase(id);
			return response as Purchase;
		},
		enabled: !!id,
	});
};

export const useCreatePurchase = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreatePurchaseData): Promise<Purchase> => {
			const response = await apiService.createPurchase(data);
			return response as Purchase;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: PURCHASES_QUERY_KEY });
		},
	});
};

export const useUpdatePurchase = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: UpdatePurchaseData;
		}): Promise<Purchase> => {
			const response = await apiService.updatePurchase(id, data);
			return response as Purchase;
		},
		onSuccess: (updatedPurchase) => {
			queryClient.invalidateQueries({ queryKey: PURCHASES_QUERY_KEY });
			queryClient.setQueryData(
				[...PURCHASES_QUERY_KEY, updatedPurchase.id],
				updatedPurchase
			);
		},
	});
};

export const useDeletePurchase = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string): Promise<void> => {
			await apiService.deletePurchase(id);
		},
		onSuccess: (_, deletedId) => {
			queryClient.invalidateQueries({ queryKey: PURCHASES_QUERY_KEY });
			queryClient.removeQueries({
				queryKey: [...PURCHASES_QUERY_KEY, deletedId],
			});
		},
	});
};
