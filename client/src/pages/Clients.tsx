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
} from '../hooks/ressources/useClients';
import ClientForm from '../components/ClientForm';
import type { ClientDtoType } from '../../../shared/dtos/client.dto';

export default function Clients() {
	const [openDialog, setOpenDialog] = useState(false);
	const [selectedClient, setSelectedClient] = useState<ClientDtoType | null>(
		null
	);

	// TanStack Query hooks
	const { data: clients = [], isLoading, error } = useClients();
	const createClientMutation = useCreateClient();
	const updateClientMutation = useUpdateClient(() => setOpenDialog(false));
	const deleteClientMutation = useDeleteClient();

	// Snackbar hook
	const handleSubmit = async (data: any) => {
		if (selectedClient) {
			await updateClientMutation.mutateAsync({
				id: selectedClient.id,
				data,
			});
		} else {
			await createClientMutation.mutateAsync(data);
		}
	};

	const handleDelete = async (id: string) => {
		if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client?')) {
			await deleteClientMutation.mutateAsync(id);
		}
	};

	const handleEdit = (client: ClientDtoType) => {
		setSelectedClient(client);
	};

	const handleAdd = () => {
		setSelectedClient(null);
		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setSelectedClient(null);
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
				<Button
					variant='contained'
					startIcon={<AddIcon />}
					onClick={handleAdd}
					disableElevation
				>
					Ajouter un client
				</Button>
			</Box>

			{error && (
				<Alert severity='error' sx={{ mb: 2 }}>
					Erreur lors de la récupération des clients
				</Alert>
			)}

			{(createClientMutation.error ||
				updateClientMutation.error ||
				deleteClientMutation.error) && (
				<Alert severity='error' sx={{ mb: 2 }}>
					{createClientMutation.error?.message ||
						updateClientMutation.error?.message ||
						deleteClientMutation.error?.message ||
						'Une erreur est survenue'}
				</Alert>
			)}

			<TableContainer>
				<Table size='small'>
					<TableHead>
						<TableRow>
							<TableCell>Name</TableCell>
							<TableCell>Phone</TableCell>
							<TableCell>Address</TableCell>
							<TableCell>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{clients.map((client) => (
							<TableRow key={client.id}>
								<TableCell>{client.name}</TableCell>
								<TableCell>{client.phone}</TableCell>
								<TableCell>{client.address}</TableCell>
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
				onClose={handleCloseDialog}
				maxWidth='sm'
				fullWidth
			>
				<DialogTitle>
					<Typography variant='h6' sx={{ fontWeight: 600 }}>
						{selectedClient ? 'Modifier le client' : 'Ajouter un client'}
					</Typography>
				</DialogTitle>

				<DialogContent sx={{ p: 0 }}>
					<ClientForm
						init={selectedClient}
						onSubmit={handleSubmit}
						isLoading={
							createClientMutation.isPending || updateClientMutation.isPending
						}
					/>
				</DialogContent>
			</Dialog>
		</Box>
	);
}
