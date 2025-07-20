import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClientService } from '../../services/client.service';
import type {
	CreateClientDtoType,
	UpdateClientDtoType,
} from '../../../../shared/dtos/client.dto';
import { useSnackbar } from './useSnackbar';
import type { PaginationParams } from '../../services/api.service';

// Query keys
export const clientKeys = {
	lists: () => ['clients'],
	list: (params?: PaginationParams) => [...clientKeys.lists(), params],
	detail: (id: string) => [...clientKeys.lists(), id],
};

// Get paginated clients
export const useClients = (params?: PaginationParams) => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: clientKeys.list(params),
		queryFn: async () => {
			try {
				return await ClientService.getPage(params);
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la récupération des clients');
				return {
					data: [],
					pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
				};
			}
		},
	});
};

// Get all clients (for backward compatibility)
export const useAllClients = () => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: clientKeys.lists(),
		queryFn: async () => {
			try {
				const result = await ClientService.getPage();
				return result.data;
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la récupération des clients');
				return [];
			}
		},
	});
};

// Get single client
export const useClient = (id: string) => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: clientKeys.detail(id),
		queryFn: async () => {
			try {
				return await ClientService.getById(id);
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la récupération du client');
				return null;
			}
		},
		enabled: !!id,
	});
};

// Create client mutation
export const useCreateClient = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateClientDtoType) => {
			try {
				await ClientService.create(data);

				queryClient.invalidateQueries({ queryKey: clientKeys.lists() });

				showSuccess('Client créé');
				callback();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la création du client');
			}
		},
	});
};

// Update client mutation
export const useUpdateClient = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: UpdateClientDtoType;
		}) => {
			try {
				await ClientService.update(id, data);

				queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
				queryClient.setQueryData(clientKeys.detail(id), data);

				showSuccess('Client modifié');
				callback();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la modification du client');
			}
		},
	});
};

// Delete client mutation
export const useDeleteClient = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			try {
				await ClientService.delete(id);

				queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
				queryClient.removeQueries({ queryKey: clientKeys.detail(id) });

				showSuccess('Client supprimé');
				callback();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la suppression du client');
			}
		},
	});
};
