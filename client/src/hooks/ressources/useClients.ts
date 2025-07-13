import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClientService } from '../../services/client.service';
import type {
	CreateClientDtoType,
	UpdateClientDtoType,
} from '../../../../shared/dtos/client.dto';
import { useSnackbar } from './useSnackbar';

// Query keys
export const clientKeys = {
	lists: () => ['clients'],
	detail: (id: string) => [...clientKeys.lists(), id],
};

// Get all clients
export const useClients = () => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: clientKeys.lists(),
		queryFn: async () => {
			try {
				return await ClientService.getAll();
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
export const useDeleteClient = () => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			try {
				await ClientService.delete(id);

				queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
				queryClient.removeQueries({ queryKey: clientKeys.detail(id) });

				showSuccess('Client supprimé');
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la suppression du client');
			}
		},
	});
};
