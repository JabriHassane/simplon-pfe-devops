import {
	useContacts
} from '../../hooks/ressources/useContacts';
import { useUsers } from '../../hooks/ressources/useUsers';
import type { ResourceType } from '../../components/shared/ResourcePickerPopup';
import type {
	PaginatedResponse,
	PaginationParams,
} from '../../types/pagination.types';
import { useOrders } from './useOrders';
import { useTransactions } from './useTransactions';
import type { UseQueryResult } from '@tanstack/react-query';

export const useResource = <T>(
	resourceType: ResourceType,
	params?: PaginationParams & Record<string, any>
) => {
	const hookMap = {
		contact: useContacts,
		user: useUsers,
		order: useOrders,
		transaction: useTransactions,
	};

	const hook = hookMap[resourceType];

	return hook(params) as UseQueryResult<PaginatedResponse<T>, Error>;
};
