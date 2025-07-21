import { Box, Chip } from '@mui/material';
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

export default function Sales() {
	const {
		openFormPopup,
		openDeletePopup,
		selectedResource: selectedSale,
		handleOpenFormPopup,
		handleOpenDeletePopup,
		handleClosePopup,
	} = useCrud<SaleDtoType>();

	const { data: sales, isLoading, error } = useSales();

	const deleteSaleMutation = useDeleteSale(handleClosePopup);

	const handleDelete = () => {
		if (selectedSale) {
			deleteSaleMutation.mutate(selectedSale.id);
		}
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
									label={DICT.saleStatus[sale.status]}
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
					title={selectedSale ? 'Modifier la vente' : 'Nouvelle vente'}
				>
					<SaleForm init={selectedSale} onClose={handleClosePopup} />
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
