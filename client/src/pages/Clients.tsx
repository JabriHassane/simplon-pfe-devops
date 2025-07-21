import {
	Box
} from '@mui/material';
import { useClients, useDeleteClient } from '../hooks/ressources/useClients';
import ClientForm from '../components/forms/ClientForm';
import type { ClientDtoType } from '../../../shared/dtos/client.dto';
import ResourceFormPopup from '../components/shared/ResourceFormPopup';
import ResourceHeader from '../components/shared/ResourceHeader';
import ResourceLoader from '../components/shared/ResourceLoader';
import ResourceDeleteConfirmation from '../components/shared/ResourceDeleteConfirmation';
import useCrud from '../hooks/useCrud';
import ResourceTable from '../components/shared/ResourceTable';

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

			<ResourceTable
				headers={[
					{ id: 'ref', name: 'Ref' },
					{ id: 'name', name: 'Nom' },
					{ id: 'phone', name: 'Téléphone' },
					{ id: 'address', name: 'Adresse' },
				]}
				rows={clients?.data.map((client) => ({
					item: client,
					data: {
						ref: client.ref,
						name: client.name,
						phone: client.phone,
						address: client.address,
					},
				}))}
				onEdit={handleOpenFormPopup}
				onDelete={handleOpenDeletePopup}
			/>

			{openFormPopup && (
				<ResourceFormPopup
					onClose={handleClosePopup}
					title={
						selectedClient
							? `Modifier ${selectedClient.ref}`
							: 'Nouveau client'
					}
				>
					<ClientForm init={selectedClient} onClose={handleClosePopup} />
				</ResourceFormPopup>
			)}

			{openDeletePopup && (
				<ResourceDeleteConfirmation
					onClose={handleClosePopup}
					title={`Supprimer ${selectedClient?.ref}`}
					description='Voulez-vous vraiment supprimer ce client ?'
					onDelete={handleDelete}
				/>
			)}
		</Box>
	);
}
