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
	Alert,
	CircularProgress,
} from '@mui/material';
import {
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
} from '@mui/icons-material';
import { useClients, useDeleteClient } from '../hooks/ressources/useClients';
import ClientForm from '../components/ClientForm';
import type { ClientDtoType } from '../../../shared/dtos/client.dto';
import ResourceFormPopup from '../components/ResourceFormPopup';

export default function Clients() {
	const [openDialog, setOpenDialog] = useState(false);
	const [selectedClient, setSelectedClient] = useState<ClientDtoType | null>(
		null
	);

	// TanStack Query hooks
	const { data: clients = [], isLoading, error } = useClients();
	const deleteClientMutation = useDeleteClient();

	const handleDelete = async (id: string) => {
		if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client?')) {
			await deleteClientMutation.mutateAsync(id);
		}
	};

	const handleEdit = (client: ClientDtoType) => {
		setSelectedClient(client);
		setOpenDialog(true);
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

			<TableContainer>
				<Table size='small'>
					<TableHead>
						<TableRow>
							<TableCell>Nom</TableCell>
							<TableCell>Téléphone</TableCell>
							<TableCell>Adresse</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{clients.map((client) => (
							<TableRow key={client.id}>
								<TableCell>{client.name}</TableCell>
								<TableCell>{client.phone}</TableCell>
								<TableCell>{client.address}</TableCell>
								<TableCell align='right'>
									<IconButton onClick={() => handleEdit(client)} size='small'>
										<EditIcon />
									</IconButton>
									<IconButton
										onClick={() => handleDelete(client.id)}
										size='small'
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

			<ResourceFormPopup
				open={openDialog}
				onClose={handleCloseDialog}
				title={selectedClient ? 'Modifier le client' : 'Ajouter un client'}
			>
				<ClientForm init={selectedClient} onClose={handleCloseDialog} />
			</ResourceFormPopup>
		</Box>
	);
}
