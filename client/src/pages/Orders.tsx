import { Chip } from '@mui/material';
import OrderForm from '../components/forms/order-form/OrderForm';
import { useDeleteOrder, useOrders } from '../hooks/ressources/useOrders';
import type { OrderDto } from '../../../shared/dtos/order.dto';
import { formatDate } from '../utils/date.utils';
import ConfirmationPopup from '../components/shared/ConfirmationPopup';
import ResourceFormPopup from '../components/shared/ResourceFormPopup';
import ResourceLoader from '../components/shared/ResourceLoader';
import ResourceHeader from '../components/shared/ResourceHeader';
import usePopups from '../hooks/usePopups';
import { DICT } from '../i18n/fr';
import { ORDER_STATUS_COLOR_MAP } from '../../../shared/constants';
import { formatPrice } from '../utils/price.utils';
import ResourceTable from '../components/shared/ResourceTable';
import OrderFilters, {
	type OrderFiltersData,
} from '../components/shared/OrderFilters';
import usePagination from '../hooks/usePagination';
import useFilters from '../hooks/useFilters';

interface OrdersPageProps {
	type: 'sale' | 'purchase';
}

export default function Orders({ type }: OrdersPageProps) {
	const {
		openFormPopup,
		openDeletePopup,
		selectedResource: selectedOrder,
		handleOpenFormPopup,
		handleOpenDeletePopup,
		handleClosePopup,
	} = usePopups<OrderDto>();

	const { page, rowsPerPage, handlePageChange, handleRowsPerPageChange } =
		usePagination();

	const { filters, handleFiltersChange } = useFilters<OrderFiltersData>(() => {
		handlePageChange(0);
	});

	const { data, isLoading, error } = useOrders({
		page: page + 1,
		pageSize: rowsPerPage,
		...filters,
		type,
	});

	const { data: orders, pagination } = data || {};

	const deleteOrderMutation = useDeleteOrder(handleClosePopup);

	const handleDelete = () => {
		if (selectedOrder) {
			deleteOrderMutation.mutateAsync(selectedOrder.id);
		}
	};

	if (isLoading) {
		return <ResourceLoader />;
	}

	return (
		<>
			<ResourceHeader
				title={type === 'sale' ? 'Ventes' : 'Achats'}
				handleAdd={() => handleOpenFormPopup(null)}
				error={!!error}
			/>

			<OrderFilters
				type={type}
				filters={filters}
				onFiltersChange={handleFiltersChange}
			/>

			<ResourceTable
				headers={[
					{ id: 'ref', name: 'Ref' },
					{ id: 'date', name: 'Date' },
					{ id: 'agent', name: 'Agent' },
					{ id: 'contact', name: type === 'sale' ? 'Client' : 'Fournisseur' },
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
								total: formatPrice(order.totalPrice),
								paid: formatPrice(order.totalPaid),
								due: formatPrice(order.totalPrice - order.totalPaid),
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
