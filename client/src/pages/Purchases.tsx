import { useState } from 'react';
import {
	Typography,
	Box,
	Paper,
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
	type Purchase,
} from '../hooks/usePurchases';
import { useSuppliers, type Supplier } from '../hooks/useSuppliers';
import { useProducts, type Product } from '../hooks/useProducts';
import PurchaseForm from '../components/PurchaseForm';

export default function Purchases() {
	const [openDialog, setOpenDialog] = useState(false);
	const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);

	// TanStack Query hooks
	const {
		data: purchases = [],
		isLoading: purchasesLoading,
		error: purchasesError,
	} = usePurchases();
	const {
		data: suppliers = [],
		isLoading: suppliersLoading,
		error: suppliersError,
	} = useSuppliers();
	const {
		data: products = [],
		isLoading: productsLoading,
		error: productsError,
	} = useProducts();
	const createPurchaseMutation = useCreatePurchase();
	const updatePurchaseMutation = useUpdatePurchase();
	const deletePurchaseMutation = useDeletePurchase();

	const isLoading = purchasesLoading || suppliersLoading || productsLoading;
	const error = purchasesError || suppliersError || productsError;

	const handleSubmit = async (data: any) => {
		try {
			if (editingPurchase) {
				await updatePurchaseMutation.mutateAsync({
					id: editingPurchase.id,
					data,
				});
			} else {
				await createPurchaseMutation.mutateAsync(data);
			}
			setOpenDialog(false);
			setEditingPurchase(null);
		} catch (err) {
			console.error('Error saving purchase:', err);
		}
	};

	const handleDelete = async (id: string) => {
		if (window.confirm('Are you sure you want to delete this purchase?')) {
			try {
				await deletePurchaseMutation.mutateAsync(id);
			} catch (err) {
				console.error('Error deleting purchase:', err);
			}
		}
	};

	const handleEdit = (purchase: Purchase) => {
		setEditingPurchase(purchase);
		setOpenDialog(true);
	};

	const handleAdd = () => {
		setEditingPurchase(null);
		setOpenDialog(true);
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString();
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
								<TableCell>{purchase.id}</TableCell>
								<TableCell>{purchase.supplier?.name || 'N/A'}</TableCell>
								<TableCell>{purchase.items?.length || 0} items</TableCell>
								<TableCell>{formatCurrency(purchase.totalAmount)}</TableCell>
								<TableCell>
									{purchase.discountAmount > 0
										? `${purchase.discountAmount}${
												purchase.discountType === 'PERCENTAGE' ? '%' : ''
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
								<TableCell>{formatDate(purchase.createdAt)}</TableCell>
								<TableCell>
									<IconButton
										onClick={() => handleEdit(purchase)}
										size='small'
									>
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
					{editingPurchase ? 'Edit Purchase' : 'New Purchase'}
				</DialogTitle>
				<DialogContent>
					<PurchaseForm
						initialData={editingPurchase}
						suppliers={suppliers}
						products={products}
						onSubmit={handleSubmit}
						onCancel={() => setOpenDialog(false)}
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
