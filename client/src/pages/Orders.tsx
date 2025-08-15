import { Chip, Typography } from '@mui/material';
import OrderForm from '../components/forms/order-form/OrderForm';
import { useDeleteOrder, useOrders } from '../hooks/ressources/useOrders';
import type { OrderDto } from '../../../shared/dtos/order.dto';
import { formatDate } from '../utils/date.utils';
import ConfirmationPopup from '../components/shared/ConfirmationPopup';
import ResourceFormPopup from '../components/shared/ResourceFormPopup';
import ResourceHeader from '../components/shared/ResourceHeader';
import usePopups from '../hooks/usePopups';
import { DICT } from '../i18n/fr';
import {
	ORDER_STATUS_COLOR_MAP,
	PAGE_SIZE,
	type OrderStatus,
} from '../../../shared/constants';
import { formatPrice } from '../utils/price.utils';
import ResourceTable from '../components/shared/ResourceTable';
import OrderFilters from '../components/shared/OrderFilters';
import usePagination from '../hooks/usePagination';
import useFilters from '../hooks/useFilters';
import type { OrderFilterParams } from '../types/filters.types';
import { useState } from 'react';

interface OrdersPageProps {
	type: 'sale' | 'purchase';
	status?: OrderStatus;
}

export default function Orders({ type, status }: OrdersPageProps) {
	const [showFilters, setShowFilters] = useState(false);

	const {
		openFormPopup,
		openDeletePopup,
		selectedResource: selectedOrder,
		handleOpenFormPopup,
		handleOpenDeletePopup,
		handleClosePopup,
	} = usePopups<OrderDto>();

	const { page, rowsPerPage, handlePageChange, handleRowsPerPageChange } =
		usePagination(status === 'partially_paid' ? 5 : PAGE_SIZE);

	const { filters, handleFiltersChange } = useFilters<OrderFilterParams>(() => {
		handlePageChange(0);
	});

	const { data, error } = useOrders({
		page: page + 1,
		pageSize: rowsPerPage,
		...filters,
		status: status || filters.status,
		type,
	});

	const { data: orders, pagination } = data || {};

	const deleteOrderMutation = useDeleteOrder(handleClosePopup);

	const handleDelete = () => {
		if (selectedOrder) {
			deleteOrderMutation.mutateAsync(selectedOrder.id);
		}
	};

	return (
		<>
			<ResourceHeader
				title={
					type === 'sale'
						? status === 'partially_paid'
							? 'Ventes en cours'
							: 'Ventes'
						: status === 'partially_paid'
						? 'Achats en cours'
						: 'Achats'
				}
				handleAdd={status ? undefined : () => handleOpenFormPopup(null)}
				error={!!error}
				onToggleFilters={() => setShowFilters(!showFilters)}
			/>

			{showFilters && (
				<OrderFilters
					type={type}
					filters={filters}
					onFiltersChange={handleFiltersChange}
					hideStatus={status}
				/>
			)}

			<ResourceTable
				headers={[
					{ id: 'ref', name: 'Réf' },
					{ id: 'date', name: 'Date' },
					{ id: 'agent', name: 'Agent' },
					{ id: 'contact', name: type === 'sale' ? 'Client' : 'Fournisseur' },
					{ id: 'receiptNumber', name: 'Bon' },
					{ id: 'invoiceNumber', name: 'Facture' },
					{ id: 'total', name: 'Total' },
					{ id: 'paid', name: 'Payé' },
					{ id: 'due', name: 'Reste' },
					{ id: 'statut', name: 'Statut' },
				]}
				rows={
					orders?.map((order) => {
						const orderStatus =
							order.totalPrice === order.totalPaid ? 'paid' : 'partially_paid';

						return {
							item: order,
							data: {
								ref: order.ref,
								date: formatDate(order.date),
								agent: order.agent?.name,
								contact: order.contact?.name,
								receiptNumber: order.receiptNumber,
								invoiceNumber: order.invoiceNumber,
								total: formatPrice(order.totalPrice),
								paid: (
									<>
										<Typography
											variant='body2'
											fontWeight={orderStatus === 'paid' ? 'semibold' : 'normal'}
											color={
												orderStatus === 'paid'
													? ORDER_STATUS_COLOR_MAP[orderStatus]
													: undefined
											}
										>
											{formatPrice(order.totalPaid)}
										</Typography>
									</>
								),
								due: (
									<>
										<Typography
											variant='body2'
											color={
												orderStatus === 'partially_paid'
													? ORDER_STATUS_COLOR_MAP[orderStatus]
													: undefined
											}
										>
											{formatPrice(order.totalPrice - order.totalPaid)}
										</Typography>
									</>
								),
								statut: (
									<Chip
										key={order.id}
										label={DICT.orderStatus[orderStatus]}
										color={ORDER_STATUS_COLOR_MAP[orderStatus]}
										size='small'
										sx={{ px: 0.5 }}
									/>
								),
							},
						};
					}) || []
				}
				onEdit={handleOpenFormPopup}
				onDelete={handleOpenDeletePopup}
				isOrder
				pagination={pagination}
				onPageChange={handlePageChange}
				onRowsPerPageChange={handleRowsPerPageChange}
			/>

			{openFormPopup && (
				<ResourceFormPopup
					onClose={handleClosePopup}
					title={
						selectedOrder
							? `Modifier ${selectedOrder.ref}`
							: `Nouvelle ${type === 'sale' ? 'vente' : 'achat'}`
					}
					width='md'
				>
					<OrderForm
						init={selectedOrder}
						onClose={handleClosePopup}
						type={type}
					/>
				</ResourceFormPopup>
			)}

			{openDeletePopup && (
				<ConfirmationPopup
					onClose={handleClosePopup}
					title={`Supprimer ${selectedOrder?.ref}`}
					description={`Voulez-vous vraiment supprimer cette ${
						type === 'sale' ? 'vente' : 'achat'
					} ?`}
					onDelete={handleDelete}
				/>
			)}
		</>
	);
}
