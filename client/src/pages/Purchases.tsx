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
	Chip,
} from '@mui/material';
import {
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
} from '@mui/icons-material';
import {
	usePurchases,
	useCreatePurchase,
	useUpdatePurchase,
	useDeletePurchase,
} from '../hooks/ressources/usePurchases';
import { useSnackbar } from '../hooks/ressources/useSnackbar';
import PurchaseForm from '../components/PurchaseForm';
import type { PurchaseDtoType } from '../../../shared/dtos/purchase.dto';
import { formatDate } from '../utils/date.utils';

export default function Purchases() {
	const [openDialog, setOpenDialog] = useState(false);
	const [selectedPurchase, setSelectedPurchase] =
		useState<PurchaseDtoType | null>(null);

	// TanStack Query hooks
	const {
		data: purchases = [],
		isLoading: purchasesLoading,
		error: purchasesError,
	} = usePurchases();

	const createPurchaseMutation = useCreatePurchase();
	const updatePurchaseMutation = useUpdatePurchase(() => setOpenDialog(false));
	const deletePurchaseMutation = useDeletePurchase();

	// Snackbar hook
	const { showSuccess, showError } = useSnackbar();

	const isLoading = purchasesLoading;
	const error = purchasesError;

	const handleSubmit = async (data: any) => {
		try {
			if (selectedPurchase) {
				await updatePurchaseMutation.mutateAsync({
					id: selectedPurchase.id,
					data,
				});
				showSuccess('Achat modifié avec succès');
			} else {
				await createPurchaseMutation.mutateAsync(data);
				showSuccess('Achat créé avec succès');
			}
			setOpenDialog(false);
			setSelectedPurchase(null);
		} catch (err) {
			console.error('Error saving purchase:', err);
			showError("Échec de la sauvegarde de l'achat");
		}
	};

	const handleDelete = async (id: string) => {
		if (window.confirm('Êtes-vous sûr de vouloir supprimer cet achat ?')) {
			try {
				await deletePurchaseMutation.mutateAsync(id);
				showSuccess('Achat supprimé avec succès');
			} catch (err) {
				console.error('Error deleting purchase:', err);
				showError("Échec de la suppression de l'achat");
			}
		}
	};

	const handleEdit = (purchase: PurchaseDtoType) => {
		setSelectedPurchase(purchase);
		setOpenDialog(true);
	};

	const handleAdd = () => {
		setSelectedPurchase(null);
		setOpenDialog(true);
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(amount);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'PENDING':
				return 'warning';
			case 'CONFIRMED':
				return 'info';
			case 'RECEIVED':
				return 'success';
			case 'CANCELLED':
				return 'error';
			default:
				return 'default';
		}
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
				<Typography variant='h4'>Purchases</Typography>
				<Button variant='contained' startIcon={<AddIcon />} onClick={handleAdd}>
					New Purchase
				</Button>
			</Box>

			{error && (
				<Alert severity='error' sx={{ mb: 2 }}>
					Failed to fetch data
				</Alert>
			)}

			{(createPurchaseMutation.error ||
				updatePurchaseMutation.error ||
				deletePurchaseMutation.error) && (
				<Alert severity='error' sx={{ mb: 2 }}>
					{createPurchaseMutation.error?.message ||
						updatePurchaseMutation.error?.message ||
						deletePurchaseMutation.error?.message ||
						'An error occurred'}
				</Alert>
			)}

			<TableContainer>
				<Table size='small'>
					<TableHead>
						<TableRow>
							<TableCell>ID Achat</TableCell>
							<TableCell>Fournisseur</TableCell>
							<TableCell>Articles</TableCell>
							<TableCell>Total</TableCell>
							<TableCell>Réduction</TableCell>
							<TableCell>Statut</TableCell>
							<TableCell>Date</TableCell>
							<TableCell>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{purchases.map((purchase) => (
							<TableRow key={purchase.id}>
								<TableCell>{purchase.ref}</TableCell>
								<TableCell>{formatDate(purchase.date)}</TableCell>
								<TableCell>{purchase.agent?.name || 'N/A'}</TableCell>
								<TableCell>{purchase.supplier?.name || 'N/A'}</TableCell>
								<TableCell>{purchase.items?.length || 0} articles</TableCell>
								<TableCell>{formatCurrency(purchase.totalPrice)}</TableCell>
								<TableCell>
									{purchase.discountAmount > 0
										? `${purchase.discountAmount}${
												purchase.discountType === 'percentage' ? '%' : ''
										  }`
										: 'Aucune'}
								</TableCell>
								<TableCell>
									<Chip
										label={purchase.status}
										color={getStatusColor(purchase.status) as any}
										size='small'
									/>
								</TableCell>
								<TableCell align='right'>
									<IconButton onClick={() => handleEdit(purchase)} size='small'>
										<EditIcon />
									</IconButton>
									<IconButton
										onClick={() => handleDelete(purchase.id)}
										size='small'
										color='error'
										disabled={deletePurchaseMutation.isPending}
									>
										{deletePurchaseMutation.isPending ? (
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
				onClose={() => setOpenDialog(false)}
				maxWidth='md'
				fullWidth
			>
				<DialogTitle>
					{selectedPurchase ? 'Modifier la commande' : 'Nouvelle commande'}
				</DialogTitle>
				<DialogContent>
					<PurchaseForm
						init={selectedPurchase}
						onSubmit={handleSubmit}
						isLoading={
							createPurchaseMutation.isPending ||
							updatePurchaseMutation.isPending
						}
					/>
				</DialogContent>
			</Dialog>
		</Box>
	);
}
