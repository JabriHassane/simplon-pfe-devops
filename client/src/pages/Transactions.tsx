import { useState } from 'react';
import {
	Box, Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow, IconButton, CircularProgress
} from '@mui/material';
import {
	Edit as EditIcon,
	Delete as DeleteIcon
} from '@mui/icons-material';
import {
	useTransactions, useDeleteTransaction
} from '../hooks/ressources/useTransactions';
import TransactionForm from '../components/TransactionForm';
import type { TransactionDtoType } from '../../../shared/dtos/transaction.dto';
import ResourceFormPopup from '../components/ResourceFormPopup';
import ResourceDeleteConfirmation from '../components/ResourceDeleteConfirmation';
import ResourceLoader from '../components/ResourceLoader';
import ResourceHeader from '../components/ResourceHeader';

export default function Transactions() {
	const [openFormPopup, setOpenFormPopup] = useState(false);
	const [openDeletePopup, setOpenDeletePopup] = useState(false);
	const [selectedTransaction, setSelectedTransaction] =
		useState<TransactionDtoType | null>(null);

	const { data: transactions = [], isLoading, error } = useTransactions();
	const deleteTransactionMutation = useDeleteTransaction();

	const handleDelete = () => {
		if (selectedTransaction) {
			deleteTransactionMutation.mutate(selectedTransaction.id);
		}
	};

	const handleOpenDeletePopup = (transaction: TransactionDtoType) => {
		setSelectedTransaction(transaction);
		setOpenDeletePopup(true);
	};

	const handleOpenEditPopup = (transaction: TransactionDtoType) => {
		setSelectedTransaction(transaction);
		setOpenFormPopup(true);
	};

	const handleOpenAddPopup = () => {
		setSelectedTransaction(null);
		setOpenFormPopup(true);
	};

	const handleCloseFormPopup = () => {
		setOpenFormPopup(false);
		setSelectedTransaction(null);
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(amount);
	};

	if (isLoading) {
		return <ResourceLoader />;
	}

	return (
		<Box>
			<ResourceHeader
				title='Transactions'
				handleAdd={handleOpenAddPopup}
				error={!!error}
			/>
			<TableContainer>
				<Table size='small'>
					<TableHead>
						<TableRow>
							<TableCell>Date</TableCell>
							<TableCell>Account</TableCell>
							<TableCell>Type</TableCell>
							<TableCell>Description</TableCell>
							<TableCell>Reference</TableCell>
							<TableCell>Amount</TableCell>
						</TableRow>
					</TableHead>

					<TableBody>
						{transactions.map((transaction) => (
							<TableRow key={transaction.id}>
								<TableCell>
									{new Date(transaction.date).toLocaleDateString()}
								</TableCell>
								<TableCell>{transaction.fromId || 'N/A'}</TableCell>
								<TableCell>
									<Box
										sx={{
											px: 1,
											py: 0.5,
											borderRadius: 1,
											backgroundColor:
												transaction.type === 'purchase'
													? 'success.light'
													: 'error.light',
											color:
												transaction.type === 'purchase'
													? 'success.dark'
													: 'error.dark',
											display: 'inline-block',
										}}
									>
										{transaction.type}
									</Box>
								</TableCell>
								<TableCell>{transaction.ref}</TableCell>
								<TableCell>{formatCurrency(transaction.amount)}</TableCell>
								<TableCell align='right'>
									<IconButton
										onClick={() => handleOpenEditPopup(transaction)}
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
					onClose={() => setOpenFormPopup(false)}
					title={
						selectedTransaction
							? 'Modifier la transaction'
							: 'Nouvelle transaction'
					}
				>
					<TransactionForm
						init={selectedTransaction}
						onSubmit={handleCloseFormPopup}
						isLoading={false}
					/>
				</ResourceFormPopup>
			)}

			{openDeletePopup && (
				<ResourceDeleteConfirmation
					onClose={() => setOpenDeletePopup(false)}
					title='Supprimer la transaction'
					description='Voulez-vous vraiment supprimer cette transaction ?'
					onDelete={handleDelete}
				/>
			)}
		</Box>
	);
}
