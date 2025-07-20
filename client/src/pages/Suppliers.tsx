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
		<Box>
			<ResourceHeader
				title='Fournisseurs'
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
						{suppliers?.data.map((supplier) => (
							<TableRow key={supplier.id}>
								<TableCell>{supplier.name}</TableCell>
								<TableCell>{supplier.phone}</TableCell>
								<TableCell>{supplier.address}</TableCell>
								<TableCell align='right'>
									<IconButton
										onClick={() => handleOpenFormPopup(supplier)}
										size='small'
									>
										<EditIcon />
									</IconButton>
									<IconButton
										onClick={() => handleOpenDeletePopup(supplier)}
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
					title={
						selectedSupplier
							? 'Modifier le fournisseur'
							: 'Ajouter un fournisseur'
					}
				>
					<SupplierForm init={selectedSupplier} onClose={handleClosePopup} />
				</ResourceFormPopup>
			)}

			{openDeletePopup && (
				<ResourceDeleteConfirmation
					onClose={handleClosePopup}
					title='Supprimer le fournisseur'
					description='Voulez-vous vraiment supprimer ce fournisseur ?'
					onDelete={handleDelete}
				/>
			)}
		</Box>
	);
}
