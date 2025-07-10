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
	useSuppliers,
	useCreateSupplier,
	useUpdateSupplier,
	useDeleteSupplier,
} from '../hooks/ressources/useSuppliers';
import SupplierForm from '../components/SupplierForm';
import type { SupplierDtoType } from '../../../shared/dtos/supplier.dto';

export default function Suppliers() {
	const [openDialog, setOpenDialog] = useState(false);
	const [selectedSupplier, setSelectedSupplier] =
		useState<SupplierDtoType | null>(null);

	// TanStack Query hooks
	const { data: suppliers = [], isLoading, error } = useSuppliers();
	const createSupplierMutation = useCreateSupplier();
	const updateSupplierMutation = useUpdateSupplier(() => setOpenDialog(false));
	const deleteSupplierMutation = useDeleteSupplier();

	// Snackbar hook
	const handleSubmit = async (data: any) => {
		if (selectedSupplier) {
			await updateSupplierMutation.mutateAsync({
				id: selectedSupplier.id,
				data,
			});
		} else {
			await createSupplierMutation.mutateAsync(data);
		}
	};

	const handleDelete = async (id: string) => {
		if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur?')) {
			await deleteSupplierMutation.mutateAsync(id);
		}
	};

	const handleEdit = (supplier: SupplierDtoType) => {
		setSelectedSupplier(supplier);
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

			{(createSupplierMutation.error ||
				updateSupplierMutation.error ||
				deleteSupplierMutation.error) && (
				<Alert severity='error' sx={{ mb: 2 }}>
					{createSupplierMutation.error?.message ||
						updateSupplierMutation.error?.message ||
						deleteSupplierMutation.error?.message ||
						'Une erreur est survenue'}
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
								<TableCell>
									<IconButton onClick={() => handleEdit(supplier)} size='small'>
										<EditIcon />
									</IconButton>
									<IconButton
										onClick={() => handleDelete(supplier.id)}
										size='small'
										color='error'
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

			<Dialog
				open={openDialog}
				onClose={handleCloseDialog}
				maxWidth='sm'
				fullWidth
			>
				<DialogTitle>
					<Typography variant='h6' sx={{ fontWeight: 600 }}>
						{selectedSupplier
							? 'Modifier le fournisseur'
							: 'Ajouter un fournisseur'}
					</Typography>
				</DialogTitle>

				<DialogContent sx={{ p: 0 }}>
					<SupplierForm
						init={
							selectedSupplier
								? {
										name: selectedSupplier.name,
										phone: selectedSupplier.phone,
										address: selectedSupplier.address,
								  }
								: undefined
						}
						onSubmit={handleSubmit}
						isLoading={
							createSupplierMutation.isPending ||
							updateSupplierMutation.isPending
						}
					/>
				</DialogContent>
			</Dialog>
		</Box>
	);
}
