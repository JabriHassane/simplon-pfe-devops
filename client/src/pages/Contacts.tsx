import { Box, Tabs, Tab } from '@mui/material';
import { useState } from 'react';
import { useContacts, useDeleteContact } from '../hooks/ressources/useContacts';
import ContactForm from '../components/forms/ContactForm';
import type { ContactDtoType } from '../../../shared/dtos/contact.dto';
import ResourceFormPopup from '../components/shared/ResourceFormPopup';
import ResourceHeader from '../components/shared/ResourceHeader';
import ResourceLoader from '../components/shared/ResourceLoader';
import ResourceDeleteConfirmation from '../components/shared/ResourceDeleteConfirmation';
import useCrud from '../hooks/useCrud';
import ResourceTable from '../components/shared/ResourceTable';

export default function Contacts() {
	const [activeTab, setActiveTab] = useState(0);
	const [filterType, setFilterType] = useState<
		'client' | 'supplier' | undefined
	>(undefined);

	const {
		openFormPopup,
		openDeletePopup,
		selectedResource: selectedContact,
		handleOpenFormPopup,
		handleOpenDeletePopup,
		handleClosePopup,
	} = useCrud<ContactDtoType>();

	const {
		data: contacts,
		isLoading,
		error,
	} = useContacts({ type: filterType });
	const deleteContactMutation = useDeleteContact(handleClosePopup);

	const handleDelete = () => {
		if (selectedContact) {
			deleteContactMutation.mutate(selectedContact.id);
		}
	};

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setActiveTab(newValue);
		if (newValue === 0) {
			setFilterType(undefined); // All contacts
		} else if (newValue === 1) {
			setFilterType('client');
		} else if (newValue === 2) {
			setFilterType('supplier');
		}
	};

	if (isLoading) {
		return <ResourceLoader />;
	}

	return (
		<>
			<ResourceHeader
				title='Contacts'
				handleAdd={() => handleOpenFormPopup(null)}
				error={!!error}
			/>

			<Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
				<Tabs value={activeTab} onChange={handleTabChange}>
					<Tab label='Tous' />
					<Tab label='Clients' />
					<Tab label='Fournisseurs' />
				</Tabs>
			</Box>

			<ResourceTable
				headers={[
					{ id: 'ref', name: 'Ref' },
					{ id: 'name', name: 'Nom' },
					{ id: 'type', name: 'Type' },
					{ id: 'phone', name: 'Téléphone' },
					{ id: 'address', name: 'Adresse' },
				]}
				rows={contacts?.data.map((contact) => ({
					item: contact,
					data: {
						ref: contact.ref,
						name: contact.name,
						type: contact.type === 'client' ? 'Client' : 'Fournisseur',
						phone: contact.phone,
						address: contact.address,
					},
				}))}
				onEdit={handleOpenFormPopup}
				onDelete={handleOpenDeletePopup}
			/>

			{openFormPopup && (
				<ResourceFormPopup
					onClose={handleClosePopup}
					title={
						selectedContact
							? `Modifier ${selectedContact.ref}`
							: 'Nouveau contact'
					}
				>
					<ContactForm init={selectedContact} onClose={handleClosePopup} />
				</ResourceFormPopup>
			)}

			{openDeletePopup && (
				<ResourceDeleteConfirmation
					onClose={handleClosePopup}
					title={`Supprimer ${selectedContact?.ref}`}
					description='Voulez-vous vraiment supprimer ce contact ?'
					onDelete={handleDelete}
				/>
			)}
		</>
	);
}
