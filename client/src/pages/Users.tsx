import React, { useState } from 'react';
import {
	Typography,
	Box,
	Paper,
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
	type User,
} from '../hooks/useUsers';
import UserForm from '../components/UserForm';

export default function Users() {
	const [openDialog, setOpenDialog] = useState(false);
	const [editingUser, setEditingUser] = useState<User | null>(null);

	// TanStack Query hooks
	const { data: users = [], isLoading, error } = useUsers();
	const createUserMutation = useCreateUser();
	const updateUserMutation = useUpdateUser();
	const deleteUserMutation = useDeleteUser();

	const handleSubmit = async (data: any) => {
		try {
			if (editingUser) {
				await updateUserMutation.mutateAsync({
					id: editingUser.id,
					data: {
						username: data.username,
						email: data.email,
						role: data.role,
					},
				});
			} else {
				await createUserMutation.mutateAsync({
					username: data.username,
					email: data.email,
					password: data.password,
					role: data.role,
				});
			}
			setOpenDialog(false);
			setEditingUser(null);
		} catch (err) {
			console.error('Error saving user:', err);
		}
	};

	const handleDelete = async (id: string) => {
		if (window.confirm('Are you sure you want to delete this user?')) {
			try {
				await deleteUserMutation.mutateAsync(id);
			} catch (err) {
				console.error('Error deleting user:', err);
			}
		}
	};

	const handleEdit = (user: User) => {
		setEditingUser(user);
		setOpenDialog(true);
	};

	const handleAdd = () => {
		setEditingUser(null);
		setOpenDialog(true);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString();
	};

	const getRoleColor = (role: string) => {
		switch (role) {
			case 'SUPER_ADMIN':
				return 'error';
			case 'ADMIN':
				return 'warning';
			case 'AGENT':
				return 'info';
			default:
				return 'default';
		}
	};

	const getStatusColor = (status: string) => {
		return status === 'ACTIVE' ? 'success' : 'error';
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
				<Typography variant='h4'>Users</Typography>
				<Button variant='contained' startIcon={<AddIcon />} onClick={handleAdd}>
					Add User
				</Button>
			</Box>

			{error && (
				<Alert severity='error' sx={{ mb: 2 }}>
					Failed to fetch users
				</Alert>
			)}

			{(createUserMutation.error ||
				updateUserMutation.error ||
				deleteUserMutation.error) && (
				<Alert severity='error' sx={{ mb: 2 }}>
					{createUserMutation.error?.message ||
						updateUserMutation.error?.message ||
						deleteUserMutation.error?.message ||
						'An error occurred'}
				</Alert>
			)}

			<TableContainer>
				<Table size='small'>
					<TableHead>
						<TableRow>
							<TableCell>Username</TableCell>
							<TableCell>Email</TableCell>
							<TableCell>Role</TableCell>
							<TableCell>Status</TableCell>
							<TableCell>Created</TableCell>
							<TableCell>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{users.map((user) => (
							<TableRow key={user.id}>
								<TableCell>
									<Typography variant='subtitle2'>{user.username}</Typography>
								</TableCell>
								<TableCell>{user.email}</TableCell>
								<TableCell>
									<Chip
										label={user.role.replace('_', ' ')}
										color={getRoleColor(user.role) as any}
										size='small'
									/>
								</TableCell>
								<TableCell>
									<Chip
										label={user.status}
										color={getStatusColor(user.status) as any}
										size='small'
									/>
								</TableCell>
								<TableCell>{formatDate(user.createdAt)}</TableCell>
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
				onClose={() => setOpenDialog(false)}
				maxWidth='sm'
				fullWidth
			>
				<DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
				<DialogContent>
					<UserForm
						initialData={
							editingUser
								? {
										username: editingUser.username,
										email: editingUser.email,
										password: '',
										role: editingUser.role as 'SUPER_ADMIN' | 'ADMIN' | 'AGENT',
								  }
								: undefined
						}
						onSubmit={handleSubmit}
						onCancel={() => setOpenDialog(false)}
						isLoading={
							createUserMutation.isPending || updateUserMutation.isPending
						}
					/>
				</DialogContent>
			</Dialog>
		</Box>
	);
}
