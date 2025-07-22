import { Box, Chip } from '@mui/material';
import PurchaseForm from '../components/forms/PurchaseForm';
import {
	useDeletePurchase,
	usePurchases,
} from '../hooks/ressources/usePurchases';
import type { PurchaseDtoType } from '../../../shared/dtos/purchase.dto';
import { formatDate } from '../utils/date.utils';
import ResourceDeleteConfirmation from '../components/shared/ResourceDeleteConfirmation';
import ResourceFormPopup from '../components/shared/ResourceFormPopup';
import ResourceLoader from '../components/shared/ResourceLoader';
import ResourceHeader from '../components/shared/ResourceHeader';
import useCrud from '../hooks/useCrud';
import { DICT } from '../i18n/fr';
import { formatDiscount, formatPrice } from '../utils/price.utils';
import ResourceTable from '../components/shared/ResourceTable';
import {
	ORDER_STATUS_COLOR_MAP,
	type OrderStatus,
} from '../../../shared/constants';

export default function Purchases() {
	const {
		openFormPopup,
		openDeletePopup,
		selectedResource: selectedPurchase,
		handleOpenFormPopup,
		handleOpenDeletePopup,
		handleClosePopup,
	} = useCrud<PurchaseDtoType>();

	const { data: Purchases, isLoading, error } = usePurchases();

	const deletePurchaseMutation = useDeletePurchase(handleClosePopup);

	const handleDelete = () => {
		if (selectedPurchase) {
			deletePurchaseMutation.mutate(selectedPurchase.id);
		}
	};

	if (isLoading) {
		return <ResourceLoader />;
	}

	return (
		<Box>
			<ResourceHeader
				title='Achats'
				handleAdd={() => handleOpenFormPopup(null)}
				error={!!error}
			/>

			<ResourceTable
				headers={[
					{ id: 'ref', name: 'Ref' },
					{ id: 'date', name: 'Date' },
					{ id: 'agent', name: 'Agent' },
					{ id: 'supplier', name: 'Fournisseur' },
					{ id: 'articles', name: 'Articles' },
					{ id: 'total', name: 'Total' },
					{ id: 'remise', name: 'Remise' },
					{ id: 'statut', name: 'Statut' },
				]}
				rows={
					Purchases?.data.map((purchase) => ({
						item: purchase,
						data: {
							ref: purchase.ref,
							date: formatDate(purchase.date),
							agent: purchase.agent?.name,
							supplier: purchase.supplier?.name,
							articles: purchase.items?.length,
							total: formatPrice(purchase.totalPrice),
							remise: formatDiscount(
								purchase.discountAmount,
								purchase.discountType
							),
							statut: (
								<Chip
									key={purchase.id}
									label={DICT.orderStatus[purchase.status]}
									color={ORDER_STATUS_COLOR_MAP[purchase.status]}
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
						selectedPurchase
							? `Modifier ${selectedPurchase.ref}`
							: 'Nouvel achat'
					}
				>
					<PurchaseForm init={selectedPurchase} onClose={handleClosePopup} />
				</ResourceFormPopup>
			)}

			{openDeletePopup && (
				<ResourceDeleteConfirmation
					onClose={handleClosePopup}
					title={`Supprimer ${selectedPurchase?.ref}`}
					description='Voulez-vous vraiment supprimer cet achat ?'
					onDelete={handleDelete}
				/>
			)}
		</Box>
	);
}
