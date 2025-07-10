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
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	Alert,
	CircularProgress,
	Chip,
} from '@mui/material';
import {
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
} from '@mui/icons-material';
import {
	useUsers,
	useCreateUser,
	useUpdateUser,
	useDeleteUser,
} from '../hooks/ressources/useUsers';
import UserForm from '../components/UserForm';
import type { UserDtoType } from '../../../shared/dtos/user.dto';

export default function Users() {
	const [openDialog, setOpenDialog] = useState(false);
	const [selectedUser, setSelectedUser] = useState<UserDtoType | null>(null);

	// TanStack Query hooks
	const { data: users = [], isLoading, error } = useUsers();
	const createUserMutation = useCreateUser();
	const updateUserMutation = useUpdateUser(() => setOpenDialog(false));
	const deleteUserMutation = useDeleteUser();

	const handleSubmit = async (data: any) => {
		if (selectedUser) {
			await updateUserMutation.mutateAsync({
				id: selectedUser.id,
				data,
			});
		} else {
			await createUserMutation.mutateAsync(data);
		}
	};

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

			{(createUserMutation.error ||
				updateUserMutation.error ||
				deleteUserMutation.error) && (
				<Alert severity='error' sx={{ mb: 2 }}>
					{createUserMutation.error?.message ||
						updateUserMutation.error?.message ||
						deleteUserMutation.error?.message ||
						'Une erreur est survenue'}
				</Alert>
			)}

			<TableContainer>
				<Table size='small'>
					<TableHead>
						<TableRow>
							<TableCell>Nom d'utilisateur</TableCell>
							<TableCell>Email</TableCell>
							<TableCell>Rôle</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{users.map((user) => (
							<TableRow key={user.id}>
								<TableCell>{user.name}</TableCell>
								<TableCell>{user.email}</TableCell>
								<TableCell>{user.role}</TableCell>
								<TableCell>
									<IconButton onClick={() => handleEdit(user)} size='small'>
										<EditIcon />
									</IconButton>
									<IconButton
										onClick={() => handleDelete(user.id)}
										size='small'
										color='error'
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

			<Dialog
				open={openDialog}
				onClose={handleCloseDialog}
				maxWidth='sm'
				fullWidth
			>
				<DialogTitle>
					<Typography variant='h6' sx={{ fontWeight: 600 }}>
						{selectedUser ? "Modifier l'utilisateur" : 'Ajouter un utilisateur'}
					</Typography>
				</DialogTitle>

				<DialogContent sx={{ p: 0 }}>
					<UserForm
						init={
							selectedUser
								? {
										name: selectedUser.name,
										email: selectedUser.email,
										password: '',
										role: selectedUser.role,
								  }
								: undefined
						}
						onSubmit={handleSubmit}
						isLoading={
							createUserMutation.isPending || updateUserMutation.isPending
						}
					/>
				</DialogContent>
			</Dialog>
		</Box>
	);
}
