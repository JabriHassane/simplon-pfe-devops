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
	type Transaction,
} from '../hooks/useTransactions';
import { useAccounts, type Account } from '../hooks/useAccounts';
import TransactionForm from '../components/TransactionForm';

export default function Transactions() {
	const [openDialog, setOpenDialog] = useState(false);
	const [editingTransaction, setEditingTransaction] =
		useState<Transaction | null>(null);

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
	const updateTransactionMutation = useUpdateTransaction();
	const deleteTransactionMutation = useDeleteTransaction();

	const isLoading = transactionsLoading || accountsLoading;
	const error = transactionsError || accountsError;

	const handleSubmit = async (data: any) => {
		try {
			if (editingTransaction) {
				await updateTransactionMutation.mutateAsync({
					id: editingTransaction.id,
					data,
				});
			} else {
				await createTransactionMutation.mutateAsync(data);
			}
			setOpenDialog(false);
			setEditingTransaction(null);
		} catch (err) {
			console.error('Error saving transaction:', err);
		}
	};

	const handleDelete = async (id: string) => {
		if (window.confirm('Are you sure you want to delete this transaction?')) {
			try {
				await deleteTransactionMutation.mutateAsync(id);
			} catch (err) {
				console.error('Error deleting transaction:', err);
			}
		}
	};

	const handleEdit = (transaction: Transaction) => {
		setEditingTransaction(transaction);
		setOpenDialog(true);
	};

	const handleAdd = () => {
		setEditingTransaction(null);
		setOpenDialog(true);
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString();
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
					Add Transaction
				</Button>
			</Box>

			{error && (
				<Alert severity='error' sx={{ mb: 2 }}>
					Failed to fetch data
				</Alert>
			)}

			{(createTransactionMutation.error ||
				updateTransactionMutation.error ||
				deleteTransactionMutation.error) && (
				<Alert severity='error' sx={{ mb: 2 }}>
					{createTransactionMutation.error?.message ||
						updateTransactionMutation.error?.message ||
						deleteTransactionMutation.error?.message ||
						'An error occurred'}
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
								<TableCell>{formatDate(transaction.date)}</TableCell>
								<TableCell>{transaction.account?.name || 'N/A'}</TableCell>
								<TableCell>
									<Box
										sx={{
											px: 1,
											py: 0.5,
											borderRadius: 1,
											backgroundColor:
												transaction.type === 'INCOME'
													? 'success.light'
													: 'error.light',
											color:
												transaction.type === 'INCOME'
													? 'success.dark'
													: 'error.dark',
											display: 'inline-block',
										}}
									>
										{transaction.type}
									</Box>
								</TableCell>
								<TableCell>{transaction.description}</TableCell>
								<TableCell>{transaction.reference}</TableCell>
								<TableCell>{formatCurrency(transaction.amount)}</TableCell>
								<TableCell>
									<IconButton
										onClick={() => handleEdit(transaction)}
										size='small'
									>
										<EditIcon />
									</IconButton>
									<IconButton
										onClick={() => handleDelete(transaction.id)}
										size='small'
										color='error'
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
					{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
				</DialogTitle>
				<DialogContent>
					<TransactionForm
						initialData={editingTransaction}
						accounts={accounts}
						onSubmit={handleSubmit}
						onCancel={() => setOpenDialog(false)}
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
