import { Box, Chip, TablePagination } from '@mui/material';
import { useState } from 'react';
import SaleForm from '../components/forms/order-form/SaleForm';
import { useDeleteSale, useSales } from '../hooks/ressources/useSales';
import type { SaleDtoType } from '../../../shared/dtos/sale.dto';
import { formatDate } from '../utils/date.utils';
import ResourceDeleteConfirmation from '../components/shared/ResourceDeleteConfirmation';
import ResourceFormPopup from '../components/shared/ResourceFormPopup';
import ResourceLoader from '../components/shared/ResourceLoader';
import ResourceHeader from '../components/shared/ResourceHeader';
import useCrud from '../hooks/useCrud';
import { DICT } from '../i18n/fr';
import { ORDER_STATUS_COLOR_MAP } from '../../../shared/constants';
import { formatPrice } from '../utils/price.utils';
import ResourceTable from '../components/shared/ResourceTable';
import OrderFilters, {
	type OrderFiltersData,
} from '../components/shared/OrderFilters';

export default function Sales() {
	const [filters, setFilters] = useState<OrderFiltersData>({});
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	const {
		openFormPopup,
		openDeletePopup,
		selectedResource: selectedSale,
		handleOpenFormPopup,
		handleOpenDeletePopup,
		handleClosePopup,
	} = useCrud<SaleDtoType>();

	const {
		data: sales,
		isLoading,
		error,
	} = useSales({
		page: page + 1, // API uses 1-based pagination
		limit: rowsPerPage,
		search: filters.ref,
		dateFrom: filters.dateFrom,
		dateTo: filters.dateTo,
		agentId: filters.agentId,
		clientId: filters.clientId,
		status: filters.status,
	});

	const deleteSaleMutation = useDeleteSale(handleClosePopup);

	const handleDelete = () => {
		if (selectedSale) {
			deleteSaleMutation.mutate(selectedSale.id);
		}
	};

	const handleFiltersChange = (newFilters: Partial<OrderFiltersData>) => {
		setFilters({
			...filters,
			...newFilters,
		});
		// Reset to first page when filters change
		setPage(0);
	};

	const handlePageChange = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleRowsPerPageChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
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

			<OrderFilters filters={filters} onFiltersChange={handleFiltersChange} />

			<ResourceTable
				headers={[
					{ id: 'ref', name: 'Ref' },
					{ id: 'date', name: 'Date' },
					{ id: 'agent', name: 'Agent' },
					{ id: 'client', name: 'Client' },
					{ id: 'articles', name: 'Articles' },
					{ id: 'total', name: 'Total' },
					{ id: 'paid', name: 'Payé' },
					{ id: 'due', name: 'Reste' },
					{ id: 'statut', name: 'Statut' },
				]}
				rows={
					sales?.data.map((sale) => ({
						item: sale,
						data: {
							ref: sale.ref,
							date: formatDate(sale.date),
							agent: sale.agent?.name,
							client: sale.client?.name,
							articles: sale.items?.length,
							total: formatPrice(sale.totalPrice),
							paid: formatPrice(sale.totalPaid),
							due: formatPrice(sale.totalDue),
							statut: (
								<Chip
									key={sale.id}
									label={DICT.orderStatus[sale.status]}
									color={ORDER_STATUS_COLOR_MAP[sale.status]}
									size='small'
									sx={{ px: 0.5 }}
								/>
							),
						},
					})) || []
				}
				onEdit={handleOpenFormPopup}
				onDelete={handleOpenDeletePopup}
			/>

			{sales?.pagination && (
				<TablePagination
					component='div'
					count={sales.pagination.total}
					page={page}
					onPageChange={handlePageChange}
					rowsPerPage={rowsPerPage}
					onRowsPerPageChange={handleRowsPerPageChange}
					rowsPerPageOptions={[5, 10, 25, 50]}
					labelRowsPerPage='Lignes par page:'
					labelDisplayedRows={({ from, to, count }) =>
						`${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
					}
					sx={{ mt: 2 }}
				/>
			)}

			{openFormPopup && (
				<ResourceFormPopup
					onClose={handleClosePopup}
					title={
						selectedSale ? `Modifier ${selectedSale.ref}` : 'Nouvelle vente'
					}
					width='md'
				>
					<SaleForm init={selectedSale} onClose={handleClosePopup} />
				</ResourceFormPopup>
			)}

			{openDeletePopup && (
				<ResourceDeleteConfirmation
					onClose={handleClosePopup}
					title={`Supprimer ${selectedSale?.ref}`}
					description='Voulez-vous vraiment supprimer cette vente ?'
					onDelete={handleDelete}
				/>
			)}
		</Box>
	);
}
