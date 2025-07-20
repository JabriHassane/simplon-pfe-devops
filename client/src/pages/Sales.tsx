import {
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	IconButton,
	Chip,
	Collapse,
	Typography,
} from '@mui/material';
import {
	Edit as EditIcon,
	Delete as DeleteIcon,
	ArrowDropDown,
	ArrowDropUp,
} from '@mui/icons-material';
import OrderForm from '../components/forms/OrderForm';
import { useDeleteOrder, useOrders } from '../hooks/ressources/useOrders';
import type { OrderDtoType } from '../../../shared/dtos/order.dto';
import { formatDate } from '../utils/date.utils';
import ResourceDeleteConfirmation from '../components/shared/ResourceDeleteConfirmation';
import ResourceFormPopup from '../components/shared/ResourceFormPopup';
import ResourceLoader from '../components/shared/ResourceLoader';
import ResourceHeader from '../components/shared/ResourceHeader';
import useCrud from '../hooks/useCrud';
import { DICT } from '../i18n/fr';
import { useTransactions } from '../hooks/ressources/useTransactions';
import { useState } from 'react';
import type { TransactionType } from '../../../shared/constants';
import { formatPrice } from '../utils/price.utils';

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
							<Row
								key={order.id}
								order={order}
								onOpenDeletePopup={handleOpenDeletePopup}
								onOpenFormPopup={handleOpenFormPopup}
							/>
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

interface RowProps {
	order: OrderDtoType;
	onOpenFormPopup: any;
	onOpenDeletePopup: any;
}

function Row({ order, onOpenFormPopup, onOpenDeletePopup }: RowProps) {
	const [open, setOpen] = useState(false);

	const { data: transactions, isLoading, error } = useTransactions();

	const getTypeColor = (type: TransactionType) => {
		if (type === 'order') {
			return 'success';
		}
		if (type === 'purchase') {
			return 'warning';
		}
		if (type === 'transfer') {
			return 'info';
		}
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

	return (
		<>
			<TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
				<TableCell>
					<IconButton
						aria-label='expand row'
						size='small'
						onClick={() => setOpen(!open)}
					>
						{open ? <ArrowDropUp /> : <ArrowDropDown />}
					</IconButton>
				</TableCell>
				<TableCell>{order.ref}</TableCell>
				<TableCell>{formatDate(order.date)}</TableCell>
				<TableCell>{order.agent?.name || 'N/A'}</TableCell>
				<TableCell>{order.client?.name || 'N/A'}</TableCell>
				<TableCell>{order.items?.length || 0} items</TableCell>
				<TableCell>{formatPrice(order.totalPrice)}</TableCell>
				<TableCell>
					{order.discountAmount > 0
						? `${order.discountAmount}${
								order.discountType === 'percentage' ? '%' : ''
						  }`
						: 'None'}
				</TableCell>
				<TableCell>
					<Chip
						label={DICT.orderStatus[order.status]}
						color={getStatusColor(order.status)}
						size='small'
						sx={{ px: 0.5 }}
					/>
				</TableCell>
				<TableCell align='right'>
					<IconButton onClick={() => onOpenFormPopup(order)} size='small'>
						<EditIcon />
					</IconButton>
					<IconButton onClick={() => onOpenDeletePopup(order)} size='small'>
						<DeleteIcon />
					</IconButton>
				</TableCell>
			</TableRow>

			<TableRow>
				<TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
					<Collapse in={open} timeout='auto' unmountOnExit>
						<Box my={2}>
							<Typography variant='h6' gutterBottom component='div'>
								Paiements
							</Typography>
							<Table size='small' aria-label='purchases'>
								<TableHead>
									<TableRow>
										<TableCell>Ref</TableCell>
										<TableCell>Date</TableCell>
										<TableCell>Compte</TableCell>
										<TableCell>Montant</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{transactions?.data.map((transaction) => (
										<TableRow key={transaction.id}>
											<TableCell>{transaction.ref}</TableCell>
											<TableCell>
												{new Date(transaction.date).toLocaleDateString()}
											</TableCell>
											<TableCell>{transaction.fromId || 'N/A'}</TableCell>
											<TableCell>{formatPrice(transaction.amount)}</TableCell>

											{/* <TableCell align='right'>
												<IconButton
													onClick={() => onOpenFormPopup(transaction)}
													size='small'
												>
													<EditIcon />
												</IconButton>
												<IconButton
													onClick={() => onOpenDeletePopup(transaction)}
													size='small'
												>
													<DeleteIcon />
												</IconButton>
											</TableCell> */}
										</TableRow>
									))}
								</TableBody>
							</Table>
						</Box>
					</Collapse>
				</TableCell>
			</TableRow>
		</>
	);
}
