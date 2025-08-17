import { useUsers, useDeleteUser } from '../hooks/ressources/useUsers';
import UserForm from '../components/forms/UserForm';
import type { UserDto } from '../../../shared/dtos/user.dto';
import ResourceFormPopup from '../components/shared/ResourceFormPopup';
import ResourceHeader from '../components/shared/ResourceHeader';
import ConfirmationPopup from '../components/shared/ConfirmationPopup';
import usePopups from '../hooks/usePopups';
import ResourceTable from '../components/shared/ResourceTable';
import usePagination from '../hooks/usePagination';
import useFilters from '../hooks/useFilters';
import UserFilters from '../components/shared/UserFilters';
import type { UserFilterParams } from '../types/filters.types';
import { useState } from 'react';

export default function Users() {
	const [showFilters, setShowFilters] = useState(false);

	const {
		openFormPopup,
		openDeletePopup,
		selectedResource: selectedUser,
		handleOpenFormPopup,
		handleOpenDeletePopup,
		handleClosePopup,
	} = usePopups<UserDto>();

	const { page, rowsPerPage, handlePageChange, handleRowsPerPageChange } =
		usePagination();

	const { filters, handleFiltersChange } = useFilters<UserFilterParams>(() => {
		handlePageChange(0);
	});

	const { data, error, isLoading } = useUsers({
		page: page + 1,
		pageSize: rowsPerPage,
		...filters,
	});

	const { data: users, pagination } = data || {};

	const deleteUserMutation = useDeleteUser(handleClosePopup);

	const handleDelete = () => {
		if (selectedUser) {
			deleteUserMutation.mutateAsync(selectedUser.id);
		}
	};

	return (
		<>
			<ResourceHeader
				title='Utilisateurs'
				handleAdd={() => handleOpenFormPopup(null)}
				onToggleFilters={() => setShowFilters(!showFilters)}
				error={!!error}
			/>

			{showFilters && (
				<UserFilters filters={filters} onFiltersChange={handleFiltersChange} />
			)}

			<ResourceTable
				headers={[
					{ id: 'ref', name: 'Réf' },
					{ id: 'name', name: 'Nom' },
					{ id: 'role', name: 'Rôle' },
				]}
				rows={
					users?.map((user: UserDto) => ({
						item: user,
						data: {
							ref: user.ref,
							name: user.name,
							role: user.role,
						},
					})) || []
				}
				onEdit={handleOpenFormPopup}
				onDelete={handleOpenDeletePopup}
				hideDelete={(item) => item.ref === 'UTI-1'}
				pagination={pagination}
				onPageChange={handlePageChange}
				onRowsPerPageChange={handleRowsPerPageChange}
				isLoading={isLoading}
			/>

			{openFormPopup && (
				<ResourceFormPopup
					onClose={handleClosePopup}
					title={
						selectedUser ? `Modifier ${selectedUser.ref}` : 'Nouvel utilisateur'
					}
				>
					<UserForm init={selectedUser} onClose={handleClosePopup} />
				</ResourceFormPopup>
			)}

			{openDeletePopup && (
				<ConfirmationPopup
					onClose={handleClosePopup}
					title={`Supprimer ${selectedUser?.ref}`}
					description='Voulez-vous vraiment supprimer cet utilisateur ?'
					onDelete={handleDelete}
				/>
			)}
		</>
	);
}
