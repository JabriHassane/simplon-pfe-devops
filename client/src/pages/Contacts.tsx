import { useContacts, useDeleteContact } from '../hooks/ressources/useContacts';
import ContactForm from '../components/forms/ContactForm';
import type { ContactDtoType } from '../../../shared/dtos/contact.dto';
import ResourceFormPopup from '../components/shared/ResourceFormPopup';
import ResourceHeader from '../components/shared/ResourceHeader';
import ResourceLoader from '../components/shared/ResourceLoader';
import ResourceDeleteConfirmation from '../components/shared/ResourceDeleteConfirmation';
import usePopups from '../hooks/useCrud';
import ResourceTable from '../components/shared/ResourceTable';
import usePagination from '../hooks/usePagination';
import useFilters from '../hooks/useFilters';

interface Props {
	type: 'client' | 'supplier';
}

export default function Contacts({ type }: Props) {
	const {
		openFormPopup,
		openDeletePopup,
		selectedResource: selectedContact,
		handleOpenFormPopup,
		handleOpenDeletePopup,
		handleClosePopup,
	} = usePopups<ContactDtoType>();

	const { page, rowsPerPage, handlePageChange, handleRowsPerPageChange } =
		usePagination();

	const { filters, handleFiltersChange } = useFilters(() => {
		handlePageChange(0);
	});

	const { data, isLoading, error } = useContacts({
		page: page + 1,
		pageSize: rowsPerPage,
		...filters,
		type,
	});

	const { data: contacts, pagination } = data || {};

	const deleteContactMutation = useDeleteContact(handleClosePopup);

	const handleDelete = () => {
		if (selectedContact) {
			deleteContactMutation.mutate(selectedContact.id);
		}
	};

	if (isLoading) {
		return <ResourceLoader />;
	}

	return (
		<>
			<ResourceHeader
				title={type === 'client' ? 'Clients' : 'Fournisseurs'}
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
				rows={
					contacts?.map((contact: ContactDtoType) => ({
						item: contact,
						data: {
							ref: contact.ref,
							name: contact.name,
							phone: contact.phone,
							address: contact.address,
						},
					})) || []
				}
				onEdit={handleOpenFormPopup}
				onDelete={handleOpenDeletePopup}
				pagination={pagination}
				onPageChange={handlePageChange}
				onRowsPerPageChange={handleRowsPerPageChange}
			/>

			{openFormPopup && (
				<ResourceFormPopup
					onClose={handleClosePopup}
					title={
						selectedContact
							? `Modifier ${selectedContact.ref}`
							: `Nouveau ${type === 'client' ? 'client' : 'fournisseur'}`
					}
				>
					<ContactForm
						init={selectedContact}
						onClose={handleClosePopup}
						type={type}
					/>
				</ResourceFormPopup>
			)}

			{openDeletePopup && (
				<ResourceDeleteConfirmation
					onClose={handleClosePopup}
					title={`Supprimer ${selectedContact?.ref}`}
					description={`Voulez-vous vraiment supprimer ce ${
						type === 'client' ? 'client' : 'fournisseur'
					} ?`}
					onDelete={handleDelete}
				/>
			)}
		</>
	);
}
