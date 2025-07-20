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
import { useTransactions } from '../hooks/ressources/useTransactions';
import { useState } from 'react';
import type { SaleStatus, TransactionType } from '../../../shared/constants';
import { formatPrice } from '../utils/price.utils';

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
						{sales?.data.map((sale) => (
							<Row
								key={sale.id}
								sale={sale}
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

interface RowProps {
	sale: SaleDtoType;
	onOpenFormPopup: any;
	onOpenDeletePopup: any;
}

function Row({ sale, onOpenFormPopup, onOpenDeletePopup }: RowProps) {
	const [open, setOpen] = useState(false);

	const { data: transactions, isLoading, error } = useTransactions();

	const getTypeColor = (type: TransactionType) => {
		switch (type) {
			case 'sale':
				return 'success';
			case 'purchase':
				return 'warning';
			case 'transfer':
				return 'info';
		}
	};

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
		<>
			<TableRow>
				<TableCell>
					<IconButton
						aria-label='expand row'
						size='small'
						onClick={() => setOpen(!open)}
					>
						{open ? <ArrowDropUp /> : <ArrowDropDown />}
					</IconButton>
				</TableCell>
				<TableCell>{sale.ref}</TableCell>
				<TableCell>{formatDate(sale.date)}</TableCell>
				<TableCell>{sale.agent?.name || 'N/A'}</TableCell>
				<TableCell>{sale.client?.name || 'N/A'}</TableCell>
				<TableCell>{sale.items?.length || 0} items</TableCell>
				<TableCell>{formatPrice(sale.totalPrice)}</TableCell>
				<TableCell>
					{sale.discountAmount > 0
						? `${sale.discountAmount}${
								sale.discountType === 'percentage' ? '%' : ''
						  }`
						: 'None'}
				</TableCell>
				<TableCell>
					<Chip
						label={DICT.saleStatus[sale.status]}
						color={getStatusColor(sale.status)}
						size='small'
						sx={{ px: 0.5 }}
					/>
				</TableCell>
				<TableCell align='right'>
					<IconButton onClick={() => onOpenFormPopup(sale)} size='small'>
						<EditIcon />
					</IconButton>
					<IconButton onClick={() => onOpenDeletePopup(sale)} size='small'>
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
