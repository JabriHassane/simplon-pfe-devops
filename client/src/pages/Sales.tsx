import React, { useState } from 'react';
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
	useOrders,
	useCreateOrder,
	useUpdateOrder,
	useDeleteOrder,
	type Order,
} from '../hooks/useOrders';
import { useClients, type Client } from '../hooks/useClients';
import { useProducts, type Product } from '../hooks/useProducts';
import OrderForm from '../components/OrderForm';

export default function Sales() {
	const [openDialog, setOpenDialog] = useState(false);
	const [editingOrder, setEditingOrder] = useState<Order | null>(null);

	// TanStack Query hooks
	const {
		data: orders = [],
		isLoading: ordersLoading,
		error: ordersError,
	} = useOrders();
	const {
		data: clients = [],
		isLoading: clientsLoading,
		error: clientsError,
	} = useClients();
	const {
		data: products = [],
		isLoading: productsLoading,
		error: productsError,
	} = useProducts();
	const createOrderMutation = useCreateOrder();
	const updateOrderMutation = useUpdateOrder();
	const deleteOrderMutation = useDeleteOrder();

	const isLoading = ordersLoading || clientsLoading || productsLoading;
	const error = ordersError || clientsError || productsError;

	const handleSubmit = async (data: any) => {
		try {
			if (editingOrder) {
				await updateOrderMutation.mutateAsync({ id: editingOrder.id, data });
			} else {
				await createOrderMutation.mutateAsync(data);
			}
			setOpenDialog(false);
			setEditingOrder(null);
		} catch (err) {
			console.error('Error saving order:', err);
		}
	};

	const handleDelete = async (id: string) => {
		if (window.confirm('Are you sure you want to delete this order?')) {
			try {
				await deleteOrderMutation.mutateAsync(id);
			} catch (err) {
				console.error('Error deleting order:', err);
			}
		}
	};

	const handleEdit = (order: Order) => {
		setEditingOrder(order);
		setOpenDialog(true);
	};

	const handleAdd = () => {
		setEditingOrder(null);
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
							<TableCell>Order ID</TableCell>
							<TableCell>Client</TableCell>
							<TableCell>Items</TableCell>
							<TableCell>Total</TableCell>
							<TableCell>Discount</TableCell>
							<TableCell>Status</TableCell>
							<TableCell>Date</TableCell>
							<TableCell>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{orders.map((order) => (
							<TableRow key={order.id}>
								<TableCell>{order.id}</TableCell>
								<TableCell>{order.client?.name || 'N/A'}</TableCell>
								<TableCell>{order.items?.length || 0} items</TableCell>
								<TableCell>{formatCurrency(order.totalAmount)}</TableCell>
								<TableCell>
									{order.discountAmount > 0
										? `${order.discountAmount}${
												order.discountType === 'PERCENTAGE' ? '%' : ''
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
								<TableCell>{formatDate(order.createdAt)}</TableCell>
								<TableCell>
									<IconButton onClick={() => handleEdit(order)} size='small'>
										<EditIcon />
									</IconButton>
									<IconButton
										onClick={() => handleDelete(order.id)}
										size='small'
										color='error'
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
				<DialogTitle>{editingOrder ? 'Edit Order' : 'New Sale'}</DialogTitle>
				<DialogContent>
					<OrderForm
						initialData={editingOrder}
						clients={clients}
						products={products}
						onSubmit={handleSubmit}
						onCancel={() => setOpenDialog(false)}
						isLoading={
							createOrderMutation.isPending || updateOrderMutation.isPending
						}
					/>
				</DialogContent>
			</Dialog>
		</Box>
	);
}
