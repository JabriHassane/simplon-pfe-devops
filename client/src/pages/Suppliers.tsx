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
import {
	useSuppliers,
	useDeleteSupplier,
} from '../hooks/ressources/useSuppliers';
import SupplierForm from '../components/SupplierForm';
import type { SupplierDtoType } from '../../../shared/dtos/supplier.dto';
import ResourceFormPopup from '../components/ResourceFormPopup';

export default function Suppliers() {
	const [openDialog, setOpenDialog] = useState(false);
	const [selectedSupplier, setSelectedSupplier] =
		useState<SupplierDtoType | null>(null);

	// TanStack Query hooks
	const { data: suppliers = [], isLoading, error } = useSuppliers();
	const deleteSupplierMutation = useDeleteSupplier();

	const handleDelete = async (id: string) => {
		if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur?')) {
			await deleteSupplierMutation.mutateAsync(id);
		}
	};

	const handleEdit = (supplier: SupplierDtoType) => {
		setSelectedSupplier(supplier);
		setOpenDialog(true);
	};

	const handleAdd = () => {
		setSelectedSupplier(null);
		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setSelectedSupplier(null);
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
				<Typography variant='h4'>Fournisseurs</Typography>
				<Button
					variant='contained'
					startIcon={<AddIcon />}
					onClick={handleAdd}
					disableElevation
				>
					Ajouter un fournisseur
				</Button>
			</Box>

			{error && (
				<Alert severity='error' sx={{ mb: 2 }}>
					Erreur lors de la récupération des fournisseurs
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
						{suppliers.map((supplier) => (
							<TableRow key={supplier.id}>
								<TableCell>{supplier.name}</TableCell>
								<TableCell>{supplier.phone}</TableCell>
								<TableCell>{supplier.address}</TableCell>
								<TableCell align='right'>
									<IconButton onClick={() => handleEdit(supplier)} size='small'>
										<EditIcon />
									</IconButton>
									<IconButton
										onClick={() => handleDelete(supplier.id)}
										size='small'
										disabled={deleteSupplierMutation.isPending}
									>
										{deleteSupplierMutation.isPending ? (
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
				title={
					selectedSupplier
						? 'Modifier le fournisseur'
						: 'Ajouter un fournisseur'
				}
			>
				<SupplierForm init={selectedSupplier} onClose={handleCloseDialog} />
			</ResourceFormPopup>
		</Box>
	);
}
