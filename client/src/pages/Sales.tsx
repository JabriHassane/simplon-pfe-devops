import { Box, Chip } from '@mui/material';
import { useState } from 'react';
import SaleForm from '../components/forms/SaleForm';
import { useDeleteSale, useSales } from '../hooks/ressources/useSales';
import type { SaleDtoType } from '../../../shared/dtos/sale.dto';
import { formatDate } from '../utils/date.utils';
import ResourceDeleteConfirmation from '../components/shared/ResourceDeleteConfirmation';
import ResourceFormPopup from '../components/shared/ResourceFormPopup';
import ResourceLoader from '../components/shared/ResourceLoader';
import ResourceHeader from '../components/shared/ResourceHeader';
import useCrud from '../hooks/useCrud';
import { DICT } from '../i18n/fr';
import type { SaleStatus } from '../../../shared/constants';
import { formatDiscount, formatPrice } from '../utils/price.utils';
import ResourceTable from '../components/shared/ResourceTable';
import OrderFilters, {
	type OrderFiltersData,
} from '../components/shared/OrderFilters';

export default function Sales() {
	const [filters, setFilters] = useState<OrderFiltersData>({});

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

	const handleFiltersChange = (newFilters: OrderFiltersData) => {
		setFilters(newFilters);
	};

	const handleClearFilters = () => {
		setFilters({});
	};

	if (isLoading) {
		return <ResourceLoader />;
	}

	const getStatusColor = (status: SaleStatus) => {
		switch (status) {
			case 'pending':
				return 'secondary';
			case 'partially_paid':
				return 'info';
			case 'paid':
				return 'primary';
			case 'cancelled':
				return 'error';
		}
	};

	return (
		<Box>
			<ResourceHeader
				title='Ventes'
				handleAdd={() => handleOpenFormPopup(null)}
				error={!!error}
			/>

			<OrderFilters
				onFiltersChange={handleFiltersChange}
				onClearFilters={handleClearFilters}
			/>

			<ResourceTable
				headers={[
					{ id: 'ref', name: 'Ref' },
					{ id: 'date', name: 'Date' },
					{ id: 'agent', name: 'Agent' },
					{ id: 'client', name: 'Client' },
					{ id: 'articles', name: 'Articles' },
					{ id: 'total', name: 'Total' },
					{ id: 'remise', name: 'Remise' },
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
							remise: formatDiscount(sale.discountAmount, sale.discountType),
							statut: (
								<Chip
									key={sale.id}
									label={DICT.orderStatus[sale.status]}
									color={getStatusColor(sale.status)}
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

			{openFormPopup && (
				<ResourceFormPopup
					onClose={handleClosePopup}
					title={
						selectedSale ? `Modifier ${selectedSale.ref}` : 'Nouvelle vente'
					}
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
