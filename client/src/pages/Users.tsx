import { useState } from 'react';
import {
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	IconButton,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useUsers, useDeleteUser } from '../hooks/ressources/useUsers';
import UserForm from '../components/forms/UserForm';
import type { UserDtoType } from '../../../shared/dtos/user.dto';
import ResourceFormPopup from '../components/shared/ResourceFormPopup';
import ResourceHeader from '../components/shared/ResourceHeader';
import ResourceLoader from '../components/shared/ResourceLoader';
import ResourceDeleteConfirmation from '../components/shared/ResourceDeleteConfirmation';

export default function Users() {
	const [openFormPopup, setOpenFormPopup] = useState(false);
	const [openDeletePopup, setOpenDeletePopup] = useState(false);
	const [selectedUser, setSelectedUser] = useState<UserDtoType | null>(null);

	const { data: users = [], isLoading, error } = useUsers();
	const deleteUserMutation = useDeleteUser(() => setOpenDeletePopup(false));

	const handleDelete = () => {
		if (selectedUser) {
			deleteUserMutation.mutate(selectedUser.id);
		}
	};

	const handleOpenDeletePopup = (user: UserDtoType) => {
		setSelectedUser(user);
		setOpenDeletePopup(true);
	};

	const handleOpenEditPopup = (user: UserDtoType) => {
		setSelectedUser(user);
		setOpenFormPopup(true);
	};

	const handleOpenAddPopup = () => {
		setSelectedUser(null);
		setOpenFormPopup(true);
	};

	const handleCloseFormPopup = () => {
		setOpenFormPopup(false);
		setSelectedUser(null);
	};

	if (isLoading) {
		return <ResourceLoader />;
	}

	return (
		<Box>
			<ResourceHeader
				title='Utilisateurs'
				handleAdd={handleOpenAddPopup}
				error={!!error}
			/>

			<TableContainer>
				<Table size='small'>
					<TableHead>
						<TableRow>
							<TableCell>Nom d'utilisateur</TableCell>
							<TableCell>Rôle</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{users.map((user) => (
							<TableRow key={user.id}>
								<TableCell>{user.name}</TableCell>
								<TableCell>{user.role}</TableCell>
								<TableCell align='right'>
									<IconButton
										onClick={() => handleOpenEditPopup(user)}
										size='small'
									>
										<EditIcon />
									</IconButton>
									<IconButton
										onClick={() => handleOpenDeletePopup(user)}
										size='small'
									>
										<DeleteIcon />
									</IconButton>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			{openFormPopup && (
				<ResourceFormPopup
					onClose={handleCloseFormPopup}
					title={
						selectedUser ? "Modifier l'utilisateur" : 'Ajouter un utilisateur'
					}
				>
					<UserForm init={selectedUser} onClose={handleCloseFormPopup} />
				</ResourceFormPopup>
			)}

			{openDeletePopup && (
				<ResourceDeleteConfirmation
					onClose={() => setOpenDeletePopup(false)}
					title="Supprimer l'utilisateur"
					description='Voulez-vous vraiment supprimer cet utilisateur ?'
					onDelete={handleDelete}
				/>
			)}
		</Box>
	);
}
