import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';

export interface User {
	id: string;
	name: string;
	email: string;
	role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
	status: 'ACTIVE' | 'INACTIVE';
	createdAt: string;
	updatedAt: string;
}

export interface CreateUserData {
	name: string;
	email: string;
	password: string;
	role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
}

export interface UpdateUserData {
	name?: string;
	email?: string;
	role?: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
	status?: 'ACTIVE' | 'INACTIVE';
}

// Query keys
const USERS_QUERY_KEY = ['users'];

// Hooks
export const useUsers = () => {
	return useQuery({
		queryKey: USERS_QUERY_KEY,
		queryFn: async (): Promise<User[]> => {
			const response = await apiService.getUsers();
			return response as User[];
		},
	});
};

export const useUser = (id: string) => {
	return useQuery({
		queryKey: [...USERS_QUERY_KEY, id],
		queryFn: async (): Promise<User> => {
			const response = await apiService.getUser(id);
			return response as User;
		},
		enabled: !!id,
	});
};

export const useCreateUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateUserData): Promise<User> => {
			const response = await apiService.createUser(data);
			return response as User;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
		},
	});
};

export const useUpdateUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: UpdateUserData;
		}): Promise<User> => {
			const response = await apiService.updateUser(id, data);
			return response as User;
		},
		onSuccess: (updatedUser) => {
			queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
			queryClient.setQueryData(
				[...USERS_QUERY_KEY, updatedUser.id],
				updatedUser
			);
		},
	});
};

export const useDeleteUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string): Promise<void> => {
			await apiService.deleteUser(id);
		},
		onSuccess: (_, deletedId) => {
			queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
			queryClient.removeQueries({ queryKey: [...USERS_QUERY_KEY, deletedId] });
		},
	});
};
