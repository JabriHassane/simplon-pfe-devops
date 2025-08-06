import { Box } from '@mui/material';
import { useUsers, useDeleteUser } from '../hooks/ressources/useUsers';
import UserForm from '../components/forms/UserForm';
import type { UserDtoType } from '../../../shared/dtos/user.dto';
import ResourceFormPopup from '../components/shared/ResourceFormPopup';
import ResourceHeader from '../components/shared/ResourceHeader';
import ResourceLoader from '../components/shared/ResourceLoader';
import ResourceDeleteConfirmation from '../components/shared/ResourceDeleteConfirmation';
import usePopups from '../hooks/useCrud';
import ResourceTable from '../components/shared/ResourceTable';
import usePagination from '../hooks/usePagination';
import useFilters from '../hooks/useFilters';

export default function Users() {
	const {
		openFormPopup,
		openDeletePopup,
		selectedResource: selectedUser,
		handleOpenFormPopup,
		handleOpenDeletePopup,
		handleClosePopup,
	} = usePopups<UserDtoType>();

	const { page, rowsPerPage, handlePageChange, handleRowsPerPageChange } =
		usePagination();

	const { filters, handleFiltersChange } = useFilters(() => {
		handlePageChange(0);
	});

	const { data, isLoading, error } = useUsers({
		page: page + 1,
		pageSize: rowsPerPage,
		...filters,
	});

	const { data: users, pagination } = data || {};

	const deleteUserMutation = useDeleteUser(handleClosePopup);

	const handleDelete = () => {
		if (selectedUser) {
			deleteUserMutation.mutate(selectedUser.id);
		}
	};

	if (isLoading) {
		return <ResourceLoader />;
	}

	return (
		<>
			<ResourceHeader
				title='Utilisateurs'
				handleAdd={() => handleOpenFormPopup(null)}
				error={!!error}
			/>

			<ResourceTable
				headers={[
					{ id: 'ref', name: 'Ref' },
					{ id: 'name', name: 'Nom' },
					{ id: 'role', name: 'Rôle' },
				]}
				rows={
					users?.map((user: UserDtoType) => ({
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
				pagination={pagination}
				onPageChange={handlePageChange}
				onRowsPerPageChange={handleRowsPerPageChange}
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
				<ResourceDeleteConfirmation
					onClose={handleClosePopup}
					title={`Supprimer ${selectedUser?.ref}`}
					description='Voulez-vous vraiment supprimer cet utilisateur ?'
					onDelete={handleDelete}
				/>
			)}
		</>
	);
}
