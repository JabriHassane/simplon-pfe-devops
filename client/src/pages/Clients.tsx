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
import { useClients, useDeleteClient } from '../hooks/ressources/useClients';
import ClientForm from '../components/ClientForm';
import type { ClientDtoType } from '../../../shared/dtos/client.dto';
import ResourceFormPopup from '../components/ResourceFormPopup';
import ResourceHeader from '../components/ResourceHeader';
import ResourceLoader from '../components/ResourceLoader';
import ResourceDeleteConfirmation from '../components/ResourceDeleteConfirmation';

export default function Clients() {
	const [openFormPopup, setOpenFormPopup] = useState(false);
	const [openDeletePopup, setOpenDeletePopup] = useState(false);
	const [selectedClient, setSelectedClient] = useState<ClientDtoType | null>(
		null
	);
	const { data: clients = [], isLoading, error } = useClients();

	const deleteClientMutation = useDeleteClient();

	const handleDelete = () => {
		if (selectedClient) {
			deleteClientMutation.mutate(selectedClient.id);
		}
	};

	const handleOpenDeletePopup = (client: ClientDtoType) => {
		setSelectedClient(client);
		setOpenDeletePopup(true);
	};

	const handleOpenEditPopup = (client: ClientDtoType) => {
		setSelectedClient(client);
		setOpenFormPopup(true);
	};

	const handleOpenAddPopup = () => {
		setSelectedClient(null);
		setOpenFormPopup(true);
	};

	const handleCloseFormPopup = () => {
		setOpenFormPopup(false);
		setSelectedClient(null);
	};

	if (isLoading) {
		return <ResourceLoader />;
	}

	return (
		<Box>
			<ResourceHeader
				title='Clients'
				handleAdd={handleOpenAddPopup}
				error={!!error}
			/>

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
									<IconButton
										onClick={() => handleOpenEditPopup(client)}
										size='small'
									>
										<EditIcon />
									</IconButton>
									<IconButton
										onClick={() => handleOpenDeletePopup(client)}
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
					title={selectedClient ? 'Modifier le client' : 'Ajouter un client'}
				>
					<ClientForm init={selectedClient} onClose={handleCloseFormPopup} />
				</ResourceFormPopup>
			)}

			{openDeletePopup && (
				<ResourceDeleteConfirmation
					onClose={() => setOpenDeletePopup(false)}
					title='Supprimer le client'
					description='Voulez-vous vraiment supprimer ce client ?'
					onDelete={handleDelete}
				/>
			)}
		</Box>
	);
}
