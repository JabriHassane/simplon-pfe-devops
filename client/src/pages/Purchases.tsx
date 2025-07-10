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
				showSuccess('Purchase updated successfully');
			} else {
				await createPurchaseMutation.mutateAsync(data);
				showSuccess('Purchase created successfully');
			}
			setOpenDialog(false);
			setSelectedPurchase(null);
		} catch (err) {
			console.error('Error saving purchase:', err);
			showError('Failed to save purchase');
		}
	};

	const handleDelete = async (id: string) => {
		if (window.confirm('Are you sure you want to delete this purchase?')) {
			try {
				await deletePurchaseMutation.mutateAsync(id);
				showSuccess('Purchase deleted successfully');
			} catch (err) {
				console.error('Error deleting purchase:', err);
				showError('Failed to delete purchase');
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
							<TableCell>Purchase ID</TableCell>
							<TableCell>Supplier</TableCell>
							<TableCell>Items</TableCell>
							<TableCell>Total</TableCell>
							<TableCell>Discount</TableCell>
							<TableCell>Status</TableCell>
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
								<TableCell>{purchase.items?.length || 0} items</TableCell>
								<TableCell>{formatCurrency(purchase.totalPrice)}</TableCell>
								<TableCell>
									{purchase.discountAmount > 0
										? `${purchase.discountAmount}${
												purchase.discountType === 'percentage' ? '%' : ''
										  }`
										: 'None'}
								</TableCell>
								<TableCell>
									<Chip
										label={purchase.status}
										color={getStatusColor(purchase.status) as any}
										size='small'
									/>
								</TableCell>
								<TableCell>
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
