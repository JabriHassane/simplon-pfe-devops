import React, { useState } from 'react';
import {
	Typography,
	Box,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Button,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	Alert,
	CircularProgress,
} from '@mui/material';
import {
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
} from '@mui/icons-material';
import {
	useTransactions,
	useCreateTransaction,
	useUpdateTransaction,
	useDeleteTransaction,
} from '../hooks/ressources/useTransactions';
import { useAccounts } from '../hooks/ressources/useAccounts';
import TransactionForm from '../components/TransactionForm';
import type { TransactionDtoType } from '../../../shared/dtos/transaction.dto';

export default function Transactions() {
	const [openDialog, setOpenDialog] = useState(false);
	const [selectedTransaction, setSelectedTransaction] =
		useState<TransactionDtoType | null>(null);

	// TanStack Query hooks
	const {
		data: transactions = [],
		isLoading: transactionsLoading,
		error: transactionsError,
	} = useTransactions();
	const {
		data: accounts = [],
		isLoading: accountsLoading,
		error: accountsError,
	} = useAccounts();
	const createTransactionMutation = useCreateTransaction();
	const updateTransactionMutation = useUpdateTransaction(() =>
		setOpenDialog(false)
	);
	const deleteTransactionMutation = useDeleteTransaction();

	const isLoading = transactionsLoading || accountsLoading;
	const error = transactionsError || accountsError;

	const handleSubmit = async (data: any) => {
		if (selectedTransaction) {
			await updateTransactionMutation.mutateAsync({
				id: selectedTransaction.id,
				data,
			});
		} else {
			await createTransactionMutation.mutateAsync(data);
		}
	};

	const handleDelete = async (id: string) => {
		if (window.confirm('Are you sure you want to delete this transaction?')) {
			await deleteTransactionMutation.mutateAsync(id);
		}
	};

	const handleEdit = (transaction: TransactionDtoType) => {
		setSelectedTransaction(transaction);
		setOpenDialog(true);
	};

	const handleAdd = () => {
		setSelectedTransaction(null);
		setOpenDialog(true);
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(amount);
	};

	if (isLoading) {
		return (
			<Box
				display='flex'
				justifyContent='center'
				alignItems='center'
				minHeight='400px'
			>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box>
			<Box
				display='flex'
				justifyContent='space-between'
				alignItems='center'
				mb={3}
			>
							<Typography variant='h4'>Transactions</Typography>
			<Button variant='contained' startIcon={<AddIcon />} onClick={handleAdd}>
				Ajouter une transaction
			</Button>
			</Box>

			{error && (
				<Alert severity='error' sx={{ mb: 2 }}>
					Échec de la récupération des données
				</Alert>
			)}

			{(createTransactionMutation.error ||
				updateTransactionMutation.error ||
				deleteTransactionMutation.error) && (
				<Alert severity='error' sx={{ mb: 2 }}>
					{createTransactionMutation.error?.message ||
						updateTransactionMutation.error?.message ||
						deleteTransactionMutation.error?.message ||
						'Une erreur est survenue'}
				</Alert>
			)}

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
							<TableCell>Actions</TableCell>
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
										onClick={() => handleEdit(transaction)}
										size='small'
									>
										<EditIcon />
									</IconButton>
									<IconButton
										onClick={() => handleDelete(transaction.id)}
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

			<Dialog
				open={openDialog}
				onClose={() => setOpenDialog(false)}
				maxWidth='sm'
				fullWidth
			>
				<DialogTitle>
					<Typography variant='h6' sx={{ fontWeight: 600 }}>
						{selectedTransaction
							? 'Modifier la transaction'
							: 'Ajouter une transaction'}
					</Typography>
				</DialogTitle>

				<DialogContent sx={{ p: 0 }}>
					<TransactionForm
						init={selectedTransaction}
						onSubmit={handleSubmit}
						isLoading={
							createTransactionMutation.isPending ||
							updateTransactionMutation.isPending
						}
					/>
				</DialogContent>
			</Dialog>
		</Box>
	);
}
