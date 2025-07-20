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
import ClientForm from '../components/forms/ClientForm';
import type { ClientDtoType } from '../../../shared/dtos/client.dto';
import ResourceFormPopup from '../components/shared/ResourceFormPopup';
import ResourceHeader from '../components/shared/ResourceHeader';
import ResourceLoader from '../components/shared/ResourceLoader';
import ResourceDeleteConfirmation from '../components/shared/ResourceDeleteConfirmation';
import useCrud from '../hooks/useCrud';

export default function Clients() {
	const {
		openFormPopup,
		openDeletePopup,
		selectedResource: selectedClient,
		handleOpenFormPopup,
		handleOpenDeletePopup,
		handleClosePopup,
	} = useCrud<ClientDtoType>();

	const { data: clients, isLoading, error } = useClients();
	const deleteClientMutation = useDeleteClient(handleClosePopup);

	const handleDelete = () => {
		if (selectedClient) {
			deleteClientMutation.mutate(selectedClient.id);
		}
	};

	if (isLoading) {
		return <ResourceLoader />;
	}

	return (
		<Box>
			<ResourceHeader
				title='Clients'
				handleAdd={() => handleOpenFormPopup(null)}
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
						{clients?.data.map((client) => (
							<TableRow key={client.id}>
								<TableCell>{client.name}</TableCell>
								<TableCell>{client.phone}</TableCell>
								<TableCell>{client.address}</TableCell>
								<TableCell align='right'>
									<IconButton
										onClick={() => handleOpenFormPopup(client)}
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
					onClose={handleClosePopup}
					title={selectedClient ? 'Modifier le client' : 'Ajouter un client'}
				>
					<ClientForm init={selectedClient} onClose={handleClosePopup} />
				</ResourceFormPopup>
			)}

			{openDeletePopup && (
				<ResourceDeleteConfirmation
					onClose={handleClosePopup}
					title='Supprimer le client'
					description='Voulez-vous vraiment supprimer ce client ?'
					onDelete={handleDelete}
				/>
			)}
		</Box>
	);
}
