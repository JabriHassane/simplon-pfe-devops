import {
	Box
} from '@mui/material';
import { useUsers, useDeleteUser } from '../hooks/ressources/useUsers';
import UserForm from '../components/forms/UserForm';
import type { UserDtoType } from '../../../shared/dtos/user.dto';
import ResourceFormPopup from '../components/shared/ResourceFormPopup';
import ResourceHeader from '../components/shared/ResourceHeader';
import ResourceLoader from '../components/shared/ResourceLoader';
import ResourceDeleteConfirmation from '../components/shared/ResourceDeleteConfirmation';
import useCrud from '../hooks/useCrud';
import ResourceTable from '../components/shared/ResourceTable';

export default function Users() {
	const {
		openFormPopup,
		openDeletePopup,
		selectedResource: selectedUser,
		handleOpenFormPopup,
		handleOpenDeletePopup,
		handleClosePopup,
	} = useCrud<UserDtoType>();

	const { data: users, isLoading, error } = useUsers();
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
		<Box>
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
				rows={users?.data.map((user) => ({
					item: user,
					data: {
						ref: user.ref,
						name: user.name,
						role: user.role,
					},
				}))}
				onEdit={handleOpenFormPopup}
				onDelete={handleOpenDeletePopup}
			/>

			{openFormPopup && (
				<ResourceFormPopup
					onClose={handleClosePopup}
					title={
						selectedUser ? "Modifier l'utilisateur" : 'Ajouter un utilisateur'
					}
				>
					<UserForm init={selectedUser} onClose={handleClosePopup} />
				</ResourceFormPopup>
			)}

			{openDeletePopup && (
				<ResourceDeleteConfirmation
					onClose={handleClosePopup}
					title="Supprimer l'utilisateur"
					description='Voulez-vous vraiment supprimer cet utilisateur ?'
					onDelete={handleDelete}
				/>
			)}
		</Box>
	);
}
