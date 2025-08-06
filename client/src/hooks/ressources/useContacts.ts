import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ContactService } from '../../services/contact.service';
import type {
	ContactType,
	CreateContactDtoType,
	UpdateContactDtoType,
} from '../../../../shared/dtos/contact.dto';
import { useSnackbar } from '../useSnackbar';
import type { PaginationParams } from '../../types/pagination.types';

export interface ContactFilters {
	type?: ContactType;
	search?: string;
}

// Query keys
export const contactKeys = {
	lists: () => ['contacts'],
	list: (params?: PaginationParams & { type?: string }) => [
		...contactKeys.lists(),
		params,
	],
	detail: (id: string) => [...contactKeys.lists(), id],
};

// Get paginated contacts
export const useContacts = (params?: PaginationParams & ContactFilters) => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: contactKeys.list(params),
		queryFn: async () => {
			try {
				return await ContactService.getPage(params);
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la récupération des contacts');
				return {
					data: [],
					pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
				};
			}
		},
	});
};

// Get contacts by type
export const useContactsByType = (
	type: 'client' | 'supplier',
	params?: PaginationParams
) => {
	return useContacts({ ...params, type });
};

// Get all contacts (for backward compatibility)
export const useAllContacts = () => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: contactKeys.lists(),
		queryFn: async () => {
			try {
				const result = await ContactService.getPage();
				return result.data;
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la récupération des contacts');
				return [];
			}
		},
	});
};

// Get single contact
export const useContact = (id: string) => {
	const { showError } = useSnackbar();

	return useQuery({
		queryKey: contactKeys.detail(id),
		queryFn: async () => {
			try {
				return await ContactService.getById(id);
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la récupération du contact');
				return null;
			}
		},
		enabled: !!id,
	});
};

// Create contact mutation
export const useCreateContact = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateContactDtoType) => {
			try {
				await ContactService.create(data);

				queryClient.invalidateQueries({ queryKey: contactKeys.lists() });

				showSuccess('Contact créé');
				callback();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la création du contact');
			}
		},
	});
};

// Update contact mutation
export const useUpdateContact = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: UpdateContactDtoType;
		}) => {
			try {
				await ContactService.update(id, data);

				queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
				queryClient.setQueryData(contactKeys.detail(id), data);

				showSuccess('Contact modifié');
				callback();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la modification du contact');
			}
		},
	});
};

// Delete contact mutation
export const useDeleteContact = (callback: () => void) => {
	const { showSuccess, showError } = useSnackbar();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			try {
				await ContactService.delete(id);

				queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
				queryClient.removeQueries({ queryKey: contactKeys.detail(id) });

				showSuccess('Contact supprimé');
				callback();
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la suppression du contact');
			}
		},
	});
};
