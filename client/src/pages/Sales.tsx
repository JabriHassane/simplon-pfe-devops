import {
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	IconButton,
	CircularProgress,
	Chip,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import OrderForm from '../components/forms/OrderForm';
import { useDeleteOrder, useOrders } from '../hooks/ressources/useOrders';
import type { OrderDtoType } from '../../../shared/dtos/order.dto';
import { formatDate } from '../utils/date.utils';
import ResourceDeleteConfirmation from '../components/shared/ResourceDeleteConfirmation';
import ResourceFormPopup from '../components/shared/ResourceFormPopup';
import ResourceLoader from '../components/shared/ResourceLoader';
import ResourceHeader from '../components/shared/ResourceHeader';
import useCrud from '../hooks/useCrud';

export default function Sales() {
	const {
		openFormPopup,
		openDeletePopup,
		selectedResource: selectedOrder,
		handleOpenFormPopup,
		handleOpenDeletePopup,
		handleClosePopup,
	} = useCrud<OrderDtoType>();

	const { data: orders, isLoading, error } = useOrders();
	const deleteOrderMutation = useDeleteOrder(handleClosePopup);

	const handleDelete = () => {
		if (selectedOrder) {
			deleteOrderMutation.mutate(selectedOrder.id);
		}
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
		return <ResourceLoader />;
	}

	return (
		<Box>
			<ResourceHeader
				title='Ventes'
				handleAdd={() => handleOpenFormPopup(null)}
				error={!!error}
			/>

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
						{orders?.data.map((order) => (
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
									<IconButton
										onClick={() => handleOpenFormPopup(order)}
										size='small'
									>
										<EditIcon />
									</IconButton>
									<IconButton
										onClick={() => handleOpenDeletePopup(order)}
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

			{openFormPopup && (
				<ResourceFormPopup
					onClose={handleClosePopup}
					title={selectedOrder ? 'Modifier la vente' : 'Nouvelle vente'}
				>
					<OrderForm init={selectedOrder} onClose={handleClosePopup} />
				</ResourceFormPopup>
			)}

			{openDeletePopup && (
				<ResourceDeleteConfirmation
					onClose={handleClosePopup}
					title='Supprimer la vente'
					description='Voulez-vous vraiment supprimer cette vente ?'
					onDelete={handleDelete}
				/>
			)}
		</Box>
	);
}
