import { Box, Chip } from '@mui/material';
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
import { formatDate } from '../utils/date.utils';
import ResourceTable from '../components/shared/ResourceTable';

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
		if (type === 'sale') {
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

			<ResourceTable
				headers={[
					{ id: 'ref', name: 'Ref' },
					{ id: 'date', name: 'Date' },
					{ id: 'from', name: 'Compte source' },
					{ id: 'to', name: 'Compte destination' },
					{ id: 'type', name: 'Type' },
					{ id: 'amount', name: 'Montant' },
				]}
				rows={transactions?.data.map((transaction) => ({
					item: transaction,
					data: {
						ref: transaction.ref,
						date: formatDate(transaction.date),
						from: transaction.from?.name || 'N/A',
						to: transaction.to?.name || 'N/A',
						type: (
							<Chip
								label={DICT.transactionType[transaction.type]}
								color={getTypeColor(transaction.type)}
								size='small'
								sx={{ px: 0.5 }}
							/>
						),
						amount: formatPrice(transaction.amount),
					},
				}))}
				onEdit={handleOpenFormPopup}
				onDelete={handleOpenDeletePopup}
			/>

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
