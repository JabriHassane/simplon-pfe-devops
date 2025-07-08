import { useState } from 'react';
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
} from '@mui/material';
import {
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
} from '@mui/icons-material';
import {
	useClients,
	useCreateClient,
	useUpdateClient,
	useDeleteClient,
	type Client,
} from '../hooks/useClients';
import ClientForm from '../components/ClientForm';

export default function Clients() {
	const [openDialog, setOpenDialog] = useState(false);
	const [editingClient, setEditingClient] = useState<Client | null>(null);

	// TanStack Query hooks
	const { data: clients = [], isLoading, error } = useClients();
	const createClientMutation = useCreateClient();
	const updateClientMutation = useUpdateClient();
	const deleteClientMutation = useDeleteClient();

	const handleSubmit = async (data: any) => {
		try {
			if (editingClient) {
				await updateClientMutation.mutateAsync({ id: editingClient.id, data });
			} else {
				await createClientMutation.mutateAsync(data);
			}
			setOpenDialog(false);
			setEditingClient(null);
		} catch (err) {
			console.error('Error saving client:', err);
		}
	};

	const handleDelete = async (id: string) => {
		if (window.confirm('Are you sure you want to delete this client?')) {
			try {
				await deleteClientMutation.mutateAsync(id);
			} catch (err) {
				console.error('Error deleting client:', err);
			}
		}
	};

	const handleEdit = (client: Client) => {
		setEditingClient(client);
		setOpenDialog(true);
	};

	const handleAdd = () => {
		setEditingClient(null);
		setOpenDialog(true);
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
				<Typography variant='h4'>Clients</Typography>
				<Button variant='contained' startIcon={<AddIcon />} onClick={handleAdd}>
					Add Client
				</Button>
			</Box>

			{error && (
				<Alert severity='error' sx={{ mb: 2 }}>
					Failed to fetch clients
				</Alert>
			)}

			{(createClientMutation.error ||
				updateClientMutation.error ||
				deleteClientMutation.error) && (
				<Alert severity='error' sx={{ mb: 2 }}>
					{createClientMutation.error?.message ||
						updateClientMutation.error?.message ||
						deleteClientMutation.error?.message ||
						'An error occurred'}
				</Alert>
			)}

			<TableContainer>
				<Table size='small'>
					<TableHead>
						<TableRow>
							<TableCell>Name</TableCell>
							<TableCell>Email</TableCell>
							<TableCell>Phone</TableCell>
							<TableCell>Type</TableCell>
							<TableCell>Status</TableCell>
							<TableCell>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{clients.map((client) => (
							<TableRow key={client.id}>
								<TableCell>{client.name}</TableCell>
								<TableCell>{client.email}</TableCell>
								<TableCell>{client.phone}</TableCell>
								<TableCell>{client.type}</TableCell>
								<TableCell>
									<Box
										sx={{
											px: 1,
											py: 0.5,
											borderRadius: 1,
											backgroundColor:
												client.status === 'ACTIVE'
													? 'success.light'
													: 'error.light',
											color:
												client.status === 'ACTIVE'
													? 'success.dark'
													: 'error.dark',
											display: 'inline-block',
										}}
									>
										{client.status}
									</Box>
								</TableCell>
								<TableCell>
									<IconButton onClick={() => handleEdit(client)} size='small'>
										<EditIcon />
									</IconButton>
									<IconButton
										onClick={() => handleDelete(client.id)}
										size='small'
										color='error'
										disabled={deleteClientMutation.isPending}
									>
										{deleteClientMutation.isPending ? (
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
				<DialogTitle>
					{editingClient ? 'Edit Client' : 'Add New Client'}
				</DialogTitle>
				<DialogContent>
					<ClientForm
						initialData={editingClient}
						onSubmit={handleSubmit}
						onCancel={() => setOpenDialog(false)}
						isLoading={
							createClientMutation.isPending || updateClientMutation.isPending
						}
					/>
				</DialogContent>
			</Dialog>
		</Box>
	);
}
