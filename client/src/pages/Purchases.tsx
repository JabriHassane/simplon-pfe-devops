import { useState } from 'react';
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
export default function Purchases() {
	const [openFormPopup, setOpenFormPopup] = useState(false);
	const [openDeletePopup, setOpenDeletePopup] = useState(false);
	const [selectedPurchase, setSelectedPurchase] =
		useState<PurchaseDtoType | null>(null);

	const { data: purchases = [], isLoading, error } = usePurchases();
	const deletePurchaseMutation = useDeletePurchase(() => setOpenDeletePopup(false));

	const handleDelete = () => {
		if (selectedPurchase) {
			deletePurchaseMutation.mutate(selectedPurchase.id);
		}
	};

	const handleOpenDeletePopup = (purchase: PurchaseDtoType) => {
		setSelectedPurchase(purchase);
		setOpenDeletePopup(true);
	};

	const handleOpenEditPopup = (purchase: PurchaseDtoType) => {
		setSelectedPurchase(purchase);
		setOpenFormPopup(true);
	};

	const handleOpenAddPopup = () => {
		setSelectedPurchase(null);
		setOpenFormPopup(true);
	};

	const handleCloseFormPopup = () => {
		setOpenFormPopup(false);
		setSelectedPurchase(null);
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
				handleAdd={handleOpenAddPopup}
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
						{purchases.map((purchase) => (
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
										label={purchase.status}
										color={getStatusColor(purchase.status) as any}
										size='small'
									/>
								</TableCell>
								<TableCell align='right'>
									<IconButton
										onClick={() => handleOpenEditPopup(purchase)}
										size='small'
									>
										<EditIcon />
									</IconButton>
									<IconButton
										onClick={() => handleOpenDeletePopup(purchase)}
										size='small'
										color='error'
										disabled={deletePurchaseMutation.isPending}
									>
										{deletePurchaseMutation.isPending ? (
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
					onClose={() => setOpenFormPopup(false)}
					title={selectedPurchase ? "Modifier l'achat" : 'Nouvel achat'}
				>
					<PurchaseForm
						init={selectedPurchase}
						onClose={handleCloseFormPopup}
					/>
				</ResourceFormPopup>
			)}

			{openDeletePopup && (
				<ResourceDeleteConfirmation
					onClose={() => setOpenDeletePopup(false)}
					title="Supprimer l'achat"
					description='Voulez-vous vraiment supprimer cet achat ?'
					onDelete={handleDelete}
				/>
			)}
		</Box>
	);
}
