import { useState } from 'react';
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
	CircularProgress,
	Alert,
	Dialog,
	DialogTitle,
	DialogContent,
	IconButton,
	Divider,
} from '@mui/material';
import {
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
} from '@mui/icons-material';
import {
	useAccounts,
	useCreateAccount,
	useUpdateAccount,
	useDeleteAccount,
	type Account,
} from '../hooks/useAccounts';
import AccountForm from '../components/AccountForm';

export default function Accounts() {
	const [openDialog, setOpenDialog] = useState(false);
	const [editingAccount, setEditingAccount] = useState<Account | null>(null);

	// TanStack Query hooks
	const { data: accounts = [], isLoading, error } = useAccounts();
	const createAccountMutation = useCreateAccount();
	const updateAccountMutation = useUpdateAccount();
	const deleteAccountMutation = useDeleteAccount();

	const handleSubmit = async (data: any) => {
		try {
			if (editingAccount) {
				await updateAccountMutation.mutateAsync({
					id: editingAccount.id,
					data,
				});
			} else {
				await createAccountMutation.mutateAsync(data);
			}
			setOpenDialog(false);
			setEditingAccount(null);
		} catch (err) {
			console.error('Error saving account:', err);
		}
	};

	const handleDelete = async (id: string) => {
		if (window.confirm('Are you sure you want to delete this account?')) {
			try {
				await deleteAccountMutation.mutateAsync(id);
			} catch (err) {
				console.error('Error deleting account:', err);
			}
		}
	};

	const handleEdit = (account: Account) => {
		setEditingAccount(account);
		setOpenDialog(true);
	};

	const handleAdd = () => {
		setEditingAccount(null);
		setOpenDialog(true);
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('fr-FR', {
			style: 'currency',
			currency: 'MAD',
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('fr-FR');
	};

	const getBalanceColor = (balance: number) => {
		if (balance > 0) return 'success';
		if (balance < 0) return 'error';
		return 'default';
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

	const headers = [
		'Nom du compte',
		'Référence',
		'Solde',
		'Date de création',
		'Actions',
	];

	return (
		<Box>
			<Box
				display='flex'
				justifyContent='space-between'
				alignItems='center'
				mb={3}
			>
				<Typography variant='h4'>Comptes</Typography>
				<Button variant='contained' startIcon={<AddIcon />} onClick={handleAdd}>
					Ajouter
				</Button>
			</Box>

			{error && (
				<Alert severity='error' sx={{ mb: 3 }}>
					Failed to fetch accounts
				</Alert>
			)}

			{(createAccountMutation.error ||
				updateAccountMutation.error ||
				deleteAccountMutation.error) && (
				<Alert severity='error' sx={{ mb: 3 }}>
					{createAccountMutation.error?.message ||
						updateAccountMutation.error?.message ||
						deleteAccountMutation.error?.message ||
						'An error occurred'}
				</Alert>
			)}

			<TableContainer>
				<Table size='small'>
					<TableHead>
						<TableRow>
							{headers.map((header, i) => (
								<TableCell
									align={i === 0 ? 'left' : 'right'}
									key={i}
									sx={{ fontWeight: 600, paddingY: 1.5 }}
								>
									{header}
								</TableCell>
							))}
						</TableRow>
					</TableHead>

					<TableBody>
						{accounts.map((account) => (
							<TableRow key={account.id} hover>
								<TableCell>{account.name}</TableCell>

								<TableCell align='right'>{account.ref}</TableCell>

								<TableCell align='right'>
									{formatCurrency(account.balance)}
								</TableCell>

								<TableCell align='right'>
									{formatDate(account.createdAt)}
								</TableCell>

								<TableCell align='right'>
									<IconButton
										size='small'
										onClick={() => handleEdit(account)}
									>
										<EditIcon />
									</IconButton>
									<IconButton
										size='small'
										onClick={() => handleDelete(account.id)}
										disabled={deleteAccountMutation.isPending}
									>
										{deleteAccountMutation.isPending ? (
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
					{editingAccount ? 'Edit Account' : 'Add New Account'}
				</DialogTitle>
				<DialogContent>
					<AccountForm
						initialData={
							editingAccount
								? {
										name: editingAccount.name,
										balance: editingAccount.balance,
								  }
								: undefined
						}
						onSubmit={handleSubmit}
						onCancel={() => setOpenDialog(false)}
						isLoading={
							createAccountMutation.isPending || updateAccountMutation.isPending
						}
					/>
				</DialogContent>
			</Dialog>
		</Box>
	);
}
