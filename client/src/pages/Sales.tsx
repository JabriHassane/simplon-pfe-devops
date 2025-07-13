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
import { useSnackbar } from '../hooks/ressources/useSnackbar';
import OrderForm from '../components/OrderForm';
import {
	useCreateOrder,
	useDeleteOrder,
	useOrders,
	useUpdateOrder,
} from '../hooks/ressources/useOrders';
import type { OrderDtoType } from '../../../shared/dtos/order.dto';
import { formatDate } from '../utils/date.utils';

export default function Sales() {
	const [openDialog, setOpenDialog] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<OrderDtoType | null>(null);

	// TanStack Query hooks
	const {
		data: orders = [],
		isLoading: ordersLoading,
		error: ordersError,
	} = useOrders();

	const createOrderMutation = useCreateOrder();
	const updateOrderMutation = useUpdateOrder(() => setOpenDialog(false));
	const deleteOrderMutation = useDeleteOrder();

	// Snackbar hook
	const { showSuccess, showError } = useSnackbar();

	const isLoading = ordersLoading;
	const error = ordersError;

	const handleSubmit = async (data: any) => {
		try {
			if (selectedOrder) {
				await updateOrderMutation.mutateAsync({ id: selectedOrder.id, data });
				showSuccess('Order updated successfully');
			} else {
				await createOrderMutation.mutateAsync(data);
				showSuccess('Order created successfully');
			}
			setOpenDialog(false);
			setSelectedOrder(null);
		} catch (err) {
			console.error('Error saving order:', err);
			showError('Failed to save order');
		}
	};

	const handleDelete = async (id: string) => {
		if (window.confirm('Are you sure you want to delete this order?')) {
			try {
				await deleteOrderMutation.mutateAsync(id);
				showSuccess('Order deleted successfully');
			} catch (err) {
				console.error('Error deleting order:', err);
				showError('Failed to delete order');
			}
		}
	};

	const handleEdit = (order: OrderDtoType) => {
		setSelectedOrder(order);
		setOpenDialog(true);
	};

	const handleAdd = () => {
		setSelectedOrder(null);
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
			case 'SHIPPED':
				return 'primary';
			case 'DELIVERED':
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
				<Typography variant='h4'>Sales</Typography>
				<Button variant='contained' startIcon={<AddIcon />} onClick={handleAdd}>
					New Sale
				</Button>
			</Box>

			{error && (
				<Alert severity='error' sx={{ mb: 2 }}>
					Failed to fetch data
				</Alert>
			)}

			{(createOrderMutation.error ||
				updateOrderMutation.error ||
				deleteOrderMutation.error) && (
				<Alert severity='error' sx={{ mb: 2 }}>
					{createOrderMutation.error?.message ||
						updateOrderMutation.error?.message ||
						deleteOrderMutation.error?.message ||
						'An error occurred'}
				</Alert>
			)}

			<TableContainer>
				<Table size='small'>
					<TableHead>
						<TableRow>
							<TableCell>Ref</TableCell>
							<TableCell>Date</TableCell>
							<TableCell>Agent</TableCell>
							<TableCell>Client</TableCell>
							<TableCell>Articles</TableCell>
							<TableCell>Total</TableCell>
							<TableCell>Remise</TableCell>
							<TableCell>Statut</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{orders.map((order) => (
							<TableRow key={order.id}>
								<TableCell>{order.ref}</TableCell>
								<TableCell>{formatDate(order.date)}</TableCell>
								<TableCell>{order.agent?.name || 'N/A'}</TableCell>
								<TableCell>{order.client?.name || 'N/A'}</TableCell>
								<TableCell>{order.items?.length || 0} items</TableCell>
								<TableCell>{formatCurrency(order.totalPrice)}</TableCell>
								<TableCell>
									{order.discountAmount > 0
										? `${order.discountAmount}${
												order.discountType === 'percentage' ? '%' : ''
										  }`
										: 'None'}
								</TableCell>
								<TableCell>
									<Chip
										label={order.status}
										color={getStatusColor(order.status) as any}
										size='small'
									/>
								</TableCell>
								<TableCell align='right'>
									<IconButton onClick={() => handleEdit(order)} size='small'>
										<EditIcon />
									</IconButton>
									<IconButton
										onClick={() => handleDelete(order.id)}
										size='small'
										disabled={deleteOrderMutation.isPending}
									>
										{deleteOrderMutation.isPending ? (
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
					{selectedOrder ? 'Modifier la commande' : 'Nouvelle commande'}
				</DialogTitle>
				<DialogContent>
					<OrderForm
						init={selectedOrder}
						onSubmit={handleSubmit}
						isLoading={
							createOrderMutation.isPending || updateOrderMutation.isPending
						}
					/>
				</DialogContent>
			</Dialog>
		</Box>
	);
}
