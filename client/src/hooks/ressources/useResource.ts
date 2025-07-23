import { useClients } from '../../hooks/ressources/useClients';
import { useUsers } from '../../hooks/ressources/useUsers';
import { useSuppliers } from '../../hooks/ressources/useSuppliers';
import type { UseQueryResult } from '@tanstack/react-query';
import type { ResourceType } from '../../components/shared/ResourcePickerPopup';
import type { PaginationParams } from '../../services/api.service';

export const useResource = (
	resourceType: ResourceType,
	params?: PaginationParams
): UseQueryResult<any, Error> => {
	switch (resourceType) {
		case 'client':
			return useClients(params);
		case 'user':
			return useUsers(params);
		case 'supplier':
			return useSuppliers(params);
		default:
			return {
				data: {
					data: [],
					pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
				},
				isLoading: false,
				error: null,
			} as any;
	}
};
