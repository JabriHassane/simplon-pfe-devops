import { Chip } from '@mui/material';
import {
	useTransactions,
	useDeleteTransaction,
} from '../hooks/ressources/useTransactions';
import TransactionForm from '../components/forms/TransactionForm';
import type { TransactionDto } from '../../../shared/dtos/transaction.dto';
import ResourceFormPopup from '../components/shared/ResourceFormPopup';
import ConfirmationPopup from '../components/shared/ConfirmationPopup';
import ResourceLoader from '../components/shared/ResourceLoader';
import ResourceHeader from '../components/shared/ResourceHeader';
import { DICT } from '../i18n/fr';
import { formatPrice } from '../utils/price.utils';
import usePopups from '../hooks/usePopups';
import {
	PAYMENT_METHODS_COLOR_MAP,
	TRANSACTION_TYPE_COLOR_MAP,
	type TransactionMethod,
} from '../../../shared/constants';
import { formatDate } from '../utils/date.utils';
import ResourceTable from '../components/shared/ResourceTable';
import TransactionFilters, {
	type TransactionFiltersData,
} from '../components/shared/TransactionFilters';
import usePagination from '../hooks/usePagination';
import useFilters from '../hooks/useFilters';

export default function Transactions() {
	const {
		openFormPopup,
		openDeletePopup,
		selectedResource: selectedTransaction,
		handleOpenFormPopup,
		handleOpenDeletePopup,
		handleClosePopup,
	} = usePopups<TransactionDto>();

	const { page, rowsPerPage, handlePageChange, handleRowsPerPageChange } =
		usePagination();

	const { filters, handleFiltersChange } = useFilters<TransactionFiltersData>(
		() => {
			handlePageChange(0);
		}
	);

	const { data, isLoading, error } = useTransactions({
		page: page + 1,
		pageSize: rowsPerPage,
		...filters,
	});

	const { data: transactions, pagination } = data || {};

	const deleteTransactionMutation = useDeleteTransaction(handleClosePopup);

	const handleDelete = () => {
		if (selectedTransaction) {
			deleteTransactionMutation.mutateAsync(selectedTransaction.id);
		}
	};

	if (isLoading) {
		return <ResourceLoader />;
	}

	return (
		<>
			<ResourceHeader
				title='Opérations'
				handleAdd={() => handleOpenFormPopup(null)}
				error={!!error}
			/>

			<TransactionFilters
				filters={filters}
				onFiltersChange={handleFiltersChange}
			/>

			<ResourceTable
				headers={[
					{ id: 'ref', name: 'Ref' },
					{ id: 'date', name: 'Date' },
					{ id: 'agent', name: 'Agent' },
					{ id: 'type', name: 'Opération' },
					{ id: 'method', name: 'Méthode' },
					{ id: 'amount', name: 'Montant' },
				]}
				rows={
					transactions?.map((transaction: TransactionDto) => ({
						item: transaction,
						data: {
							ref: transaction.ref,
							date: formatDate(transaction.date),
							agent: transaction.agent?.name || '-',
							type: (
								<Chip
									label={DICT.transactionType[transaction.type]}
									color={TRANSACTION_TYPE_COLOR_MAP[transaction.type]}
									size='small'
									sx={{ px: 0.5 }}
								/>
							),
							method: (
								<Chip
									label={DICT.methods[transaction.method as TransactionMethod]}
									color={
										PAYMENT_METHODS_COLOR_MAP[
											transaction.method as TransactionMethod
										]
									}
									size='small'
									sx={{ px: 0.5 }}
								/>
							),
							amount: formatPrice(transaction.amount),
						},
					})) || []
				}
				onEdit={handleOpenFormPopup}
				onDelete={handleOpenDeletePopup}
				pagination={pagination}
				onPageChange={handlePageChange}
				onRowsPerPageChange={handleRowsPerPageChange}
			/>

			{openFormPopup && (
				<ResourceFormPopup
					onClose={handleClosePopup}
					title={
						selectedTransaction
							? `Modifier ${selectedTransaction.ref}`
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
				<ConfirmationPopup
					onClose={handleClosePopup}
					title={`Supprimer ${selectedTransaction?.ref}`}
					description='Voulez-vous vraiment supprimer cette transaction ?'
					onDelete={handleDelete}
				/>
			)}
		</>
	);
}
