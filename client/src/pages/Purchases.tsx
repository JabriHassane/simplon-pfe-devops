import {
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	IconButton, Chip
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
	usePurchases,
	useDeletePurchase,
} from '../hooks/ressources/usePurchases';
import PurchaseForm from '../components/forms/PurchaseForm';
import type { PurchaseDtoType } from '../../../shared/dtos/purchase.dto';
import { formatDate } from '../utils/date.utils';
import ResourceFormPopup from '../components/shared/ResourceFormPopup';
import ResourceDeleteConfirmation from '../components/shared/ResourceDeleteConfirmation';
import ResourceLoader from '../components/shared/ResourceLoader';
import ResourceHeader from '../components/shared/ResourceHeader';
import useCrud from '../hooks/useCrud';
import { DICT } from '../i18n/fr';

export default function Purchases() {
	const {
		openFormPopup,
		openDeletePopup,
		selectedResource: selectedPurchase,
		handleOpenFormPopup,
		handleOpenDeletePopup,
		handleClosePopup,
	} = useCrud<PurchaseDtoType>();

	const { data: purchases, isLoading, error } = usePurchases();
	const deletePurchaseMutation = useDeletePurchase(handleClosePopup);

	const handleDelete = () => {
		if (selectedPurchase) {
			deletePurchaseMutation.mutate(selectedPurchase.id);
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
			case 'RECEIVED':
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
				title='Achats'
				handleAdd={() => handleOpenFormPopup(null)}
				error={!!error}
			/>

			<TableContainer>
				<Table size='small'>
					<TableHead>
						<TableRow>
							<TableCell>ID Achat</TableCell>
							<TableCell>Fournisseur</TableCell>
							<TableCell>Articles</TableCell>
							<TableCell>Total</TableCell>
							<TableCell>Réduction</TableCell>
							<TableCell>Statut</TableCell>
							<TableCell>Date</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{purchases?.data.map((purchase) => (
							<TableRow key={purchase.id}>
								<TableCell>{purchase.ref}</TableCell>
								<TableCell>{formatDate(purchase.date)}</TableCell>
								<TableCell>{purchase.agent?.name || 'N/A'}</TableCell>
								<TableCell>{purchase.supplier?.name || 'N/A'}</TableCell>
								<TableCell>{purchase.items?.length || 0} articles</TableCell>
								<TableCell>{formatCurrency(purchase.totalPrice)}</TableCell>
								<TableCell>
									{purchase.discountAmount > 0
										? `${purchase.discountAmount}${
												purchase.discountType === 'percentage' ? '%' : ''
										  }`
										: 'Aucune'}
								</TableCell>
								<TableCell>
									<Chip
										label={DICT.saleStatus[purchase.status]}
										color={getStatusColor(purchase.status)}
										size='small'
										sx={{ px: 0.5 }}
									/>
								</TableCell>
								<TableCell align='right'>
									<IconButton
										onClick={() => handleOpenFormPopup(purchase)}
										size='small'
									>
										<EditIcon />
									</IconButton>
									<IconButton
										onClick={() => handleOpenDeletePopup(purchase)}
										size='small'
									>
										<DeleteIcon />
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
					title={selectedPurchase ? "Modifier l'achat" : 'Nouvel achat'}
				>
					<PurchaseForm init={selectedPurchase} onClose={handleClosePopup} />
				</ResourceFormPopup>
			)}

			{openDeletePopup && (
				<ResourceDeleteConfirmation
					onClose={handleClosePopup}
					title="Supprimer l'achat"
					description='Voulez-vous vraiment supprimer cet achat ?'
					onDelete={handleDelete}
				/>
			)}
		</Box>
	);
}
