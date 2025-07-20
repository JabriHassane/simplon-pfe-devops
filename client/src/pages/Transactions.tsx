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
	useTransactions,
	useDeleteTransaction,
} from '../hooks/ressources/useTransactions';
import TransactionForm from '../components/forms/TransactionForm';
import type { TransactionDtoType } from '../../../shared/dtos/transaction.dto';
import ResourceFormPopup from '../components/shared/ResourceFormPopup';
import ResourceDeleteConfirmation from '../components/shared/ResourceDeleteConfirmation';
import ResourceLoader from '../components/shared/ResourceLoader';
import ResourceHeader from '../components/shared/ResourceHeader';
import { DICT } from '../i18n/fr';
import { formatPrice } from '../utils/price.utils';
import useCrud from '../hooks/useCrud';
import type { TransactionType } from '../../../shared/constants';

export default function Transactions() {
	const {
		openFormPopup,
		openDeletePopup,
		selectedResource: selectedTransaction,
		handleOpenFormPopup,
		handleOpenDeletePopup,
		handleClosePopup,
	} = useCrud<TransactionDtoType>();

	const { data: transactions, isLoading, error } = useTransactions();
	const deleteTransactionMutation = useDeleteTransaction(handleClosePopup);

	const handleDelete = () => {
		if (selectedTransaction) {
			deleteTransactionMutation.mutate(selectedTransaction.id);
		}
	};

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

	if (isLoading) {
		return <ResourceLoader />;
	}

	return (
		<Box>
			<ResourceHeader
				title='Transactions'
				handleAdd={() => handleOpenFormPopup(null)}
				error={!!error}
			/>
			<TableContainer>
				<Table size='small'>
					<TableHead>
						<TableRow>
							<TableCell>Reference</TableCell>
							<TableCell>Date</TableCell>
							<TableCell>Account</TableCell>
							<TableCell>Type</TableCell>
							<TableCell>Amount</TableCell>
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
								<TableCell>
									<Chip
										label={DICT.transactionType[transaction.type]}
										color={getTypeColor(transaction.type)}
										size='small'
										sx={{ px: 0.5 }}
									/>
								</TableCell>
								<TableCell>{formatPrice(transaction.amount)}</TableCell>

								<TableCell align='right'>
									<IconButton
										onClick={() => handleOpenFormPopup(transaction)}
										size='small'
									>
										<EditIcon />
									</IconButton>
									<IconButton
										onClick={() => handleOpenDeletePopup(transaction)}
										size='small'
										disabled={deleteTransactionMutation.isPending}
									>
										{deleteTransactionMutation.isPending ? (
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
					onClose={handleClosePopup}
					title={
						selectedTransaction
							? 'Modifier la transaction'
							: 'Nouvelle transaction'
					}
				>
					<TransactionForm
						init={selectedTransaction}
						onClose={handleClosePopup}
					/>
				</ResourceFormPopup>
			)}

			{openDeletePopup && (
				<ResourceDeleteConfirmation
					onClose={handleClosePopup}
					title='Supprimer la transaction'
					description='Voulez-vous vraiment supprimer cette transaction ?'
					onDelete={handleDelete}
				/>
			)}
		</Box>
	);
}
