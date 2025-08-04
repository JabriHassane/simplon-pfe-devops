import { useContacts } from '../../hooks/ressources/useContacts';
import { useUsers } from '../../hooks/ressources/useUsers';
import type { UseQueryResult } from '@tanstack/react-query';
import type { ResourceType } from '../../components/shared/ResourcePickerPopup';
import type { PaginationParams } from '../../services/api.service';

export const useResource = (
	resourceType: ResourceType,
	params?: PaginationParams
): UseQueryResult<any, Error> => {
	switch (resourceType) {
		case 'contact':
			return useContacts(params);
		case 'user':
			return useUsers(params);
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
