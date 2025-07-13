import { useState } from 'react';
import {
	Typography,
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Button,
	IconButton, Alert,
	CircularProgress
} from '@mui/material';
import {
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
} from '@mui/icons-material';
import { useUsers, useDeleteUser } from '../hooks/ressources/useUsers';
import UserForm from '../components/UserForm';
import type { UserDtoType } from '../../../shared/dtos/user.dto';
import ResourceFormPopup from '../components/ResourceFormPopup';

export default function Users() {
	const [openDialog, setOpenDialog] = useState(false);
	const [selectedUser, setSelectedUser] = useState<UserDtoType | null>(null);

	// TanStack Query hooks
	const { data: users = [], isLoading, error } = useUsers();
	const deleteUserMutation = useDeleteUser();

	const handleDelete = async (id: string) => {
		if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?')) {
			await deleteUserMutation.mutateAsync(id);
		}
	};

	const handleEdit = (user: UserDtoType) => {
		setSelectedUser(user);
	};

	const handleAdd = () => {
		setSelectedUser(null);
		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setSelectedUser(null);
	};

	if (isLoading) {
		return (
			<Box
				display='flex'
				justifyContent='center'
				alignItems='center'
				minHeight='400px'
			>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box>
			<Box
				display='flex'
				justifyContent='space-between'
				alignItems='center'
				mb={3}
			>
				<Typography variant='h4'>Utilisateurs</Typography>
				<Button
					variant='contained'
					startIcon={<AddIcon />}
					onClick={handleAdd}
					disableElevation
				>
					Ajouter un utilisateur
				</Button>
			</Box>

			{error && (
				<Alert severity='error' sx={{ mb: 2 }}>
					Erreur lors de la récupération des utilisateurs
				</Alert>
			)}

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
									<IconButton onClick={() => handleEdit(user)} size='small'>
										<EditIcon />
									</IconButton>
									<IconButton
										onClick={() => handleDelete(user.id)}
										size='small'
										disabled={deleteUserMutation.isPending}
									>
										{deleteUserMutation.isPending ? (
											<CircularProgress size={20} />
										) : (
											<DeleteIcon />
										)}
									</IconButton>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<ResourceFormPopup
				open={openDialog}
				onClose={handleCloseDialog}
				title={
					selectedUser ? "Modifier l'utilisateur" : 'Ajouter un utilisateur'
				}
			>
				<UserForm init={selectedUser} onClose={handleCloseDialog} />
			</ResourceFormPopup>
		</Box>
	);
}
