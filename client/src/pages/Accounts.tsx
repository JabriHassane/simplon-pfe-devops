import { useState } from 'react';
import {
	Typography,
	Box, Table,
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
	IconButton
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
} from '../hooks/ressources/useAccounts';
import AccountForm from '../components/AccountForm';
import type { AccountDtoType } from '../../../shared/dtos/account.dto';

export default function Accounts() {
	const [openDialog, setOpenDialog] = useState(false);
	const [selectedAccount, setSelectedAccount] = useState<AccountDtoType | null>(
		null
	);

	// TanStack Query hooks
	const { data: accounts = [], isLoading, error } = useAccounts();
	const createAccountMutation = useCreateAccount();
	const updateAccountMutation = useUpdateAccount(() => setOpenDialog(false));
	const deleteAccountMutation = useDeleteAccount();

	const handleSubmit = async (data: any) => {
		if (selectedAccount) {
			await updateAccountMutation.mutateAsync({
				id: selectedAccount.id,
				data,
			});
		} else {
			await createAccountMutation.mutateAsync(data);
		}
	};

	const handleDelete = async (id: string) => {
		if (window.confirm('Êtes-vous sûr de vouloir supprimer ce compte?')) {
			await deleteAccountMutation.mutateAsync(id);
		}
	};

	const handleEdit = (account: AccountDtoType) => {
		setSelectedAccount(account);
	};

	const handleAdd = () => {
		setSelectedAccount(null);
		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setSelectedAccount(null);
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
				<Typography variant='h4'>Comptes</Typography>
				<Button
					variant='contained'
					startIcon={<AddIcon />}
					onClick={handleAdd}
					disableElevation
				>
					Ajouter un compte
				</Button>
			</Box>

			{error && (
				<Alert severity='error' sx={{ mb: 2 }}>
					Erreur lors de la récupération des comptes
				</Alert>
			)}

			{(createAccountMutation.error ||
				updateAccountMutation.error ||
				deleteAccountMutation.error) && (
				<Alert severity='error' sx={{ mb: 2 }}>
					{createAccountMutation.error?.message ||
						updateAccountMutation.error?.message ||
						deleteAccountMutation.error?.message ||
						'Une erreur est survenue'}
				</Alert>
			)}

			<TableContainer>
				<Table size='small'>
					<TableHead>
						<TableRow>
							<TableCell>Nom</TableCell>
							<TableCell>Référence</TableCell>
							<TableCell>Solde</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{accounts.map((account) => (
							<TableRow key={account.id}>
								<TableCell>{account.name}</TableCell>
								<TableCell>{account.ref}</TableCell>
								<TableCell>{account.balance}</TableCell>
								<TableCell>
									<IconButton onClick={() => handleEdit(account)} size='small'>
										<EditIcon />
									</IconButton>
									<IconButton
										onClick={() => handleDelete(account.id)}
										size='small'
										color='error'
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
				onClose={handleCloseDialog}
				maxWidth='sm'
				fullWidth
			>
				<DialogTitle>
					<Typography variant='h6' sx={{ fontWeight: 600 }}>
						{selectedAccount ? 'Modifier le compte' : 'Ajouter un compte'}
					</Typography>
				</DialogTitle>

				<DialogContent sx={{ p: 0 }}>
					<AccountForm
						init={selectedAccount}
						onSubmit={handleSubmit}
						isLoading={
							createAccountMutation.isPending || updateAccountMutation.isPending
						}
					/>
				</DialogContent>
			</Dialog>
		</Box>
	);
}
