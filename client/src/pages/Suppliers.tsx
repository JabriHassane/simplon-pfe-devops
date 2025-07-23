import { Box } from '@mui/material';
import {
	useSuppliers,
	useDeleteSupplier,
} from '../hooks/ressources/useSuppliers';
import SupplierForm from '../components/forms/SupplierForm';
import type { SupplierDtoType } from '../../../shared/dtos/supplier.dto';
import ResourceFormPopup from '../components/shared/ResourceFormPopup';
import ResourceHeader from '../components/shared/ResourceHeader';
import ResourceLoader from '../components/shared/ResourceLoader';
import ResourceDeleteConfirmation from '../components/shared/ResourceDeleteConfirmation';
import useCrud from '../hooks/useCrud';
import ResourceTable from '../components/shared/ResourceTable';

export default function Suppliers() {
	const {
		openFormPopup,
		openDeletePopup,
		selectedResource: selectedSupplier,
		handleOpenFormPopup,
		handleOpenDeletePopup,
		handleClosePopup,
	} = useCrud<SupplierDtoType>();

	const { data: suppliers, isLoading, error } = useSuppliers();
	const deleteSupplierMutation = useDeleteSupplier(handleClosePopup);

	const handleDelete = () => {
		if (selectedSupplier) {
			deleteSupplierMutation.mutate(selectedSupplier.id);
		}
	};

	if (isLoading) {
		return <ResourceLoader />;
	}

	return (
		<>
			<ResourceHeader
				title='Fournisseurs'
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
				rows={suppliers?.data.map((supplier) => ({
					item: supplier,
					data: {
						ref: supplier.ref,
						name: supplier.name,
						phone: supplier.phone,
						address: supplier.address,
					},
				}))}
				onEdit={handleOpenFormPopup}
				onDelete={handleOpenDeletePopup}
			/>

			{openFormPopup && (
				<ResourceFormPopup
					onClose={handleClosePopup}
					title={
						selectedSupplier
							? `Modifier ${selectedSupplier.ref}`
							: 'Nouveau fournisseur'
					}
				>
					<SupplierForm init={selectedSupplier} onClose={handleClosePopup} />
				</ResourceFormPopup>
			)}

			{openDeletePopup && (
				<ResourceDeleteConfirmation
					onClose={handleClosePopup}
					title={`Supprimer ${selectedSupplier?.ref}`}
					description='Voulez-vous vraiment supprimer ce fournisseur ?'
					onDelete={handleDelete}
				/>
			)}
		</>
	);
}
