import { useState } from 'react';
import {
	Typography,
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Button,
	CircularProgress,
	Alert,
	IconButton,
} from '@mui/material';
import {
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAccounts, useDeleteAccount } from '../hooks/ressources/useAccounts';
import AccountForm from '../components/AccountForm';
import type { AccountDtoType } from '../../../shared/dtos/account.dto';
import ResourceFormPopup from '../components/ResourceFormPopup';

export default function Accounts() {
	const [openDialog, setOpenDialog] = useState(false);
	const [selectedAccount, setSelectedAccount] = useState<AccountDtoType | null>(
		null
	);

	// TanStack Query hooks
	const { data: accounts = [], isLoading, error } = useAccounts();
	const deleteAccountMutation = useDeleteAccount();

	const handleDelete = async (id: string) => {
		if (window.confirm('Êtes-vous sûr de vouloir supprimer ce compte?')) {
			await deleteAccountMutation.mutateAsync(id);
		}
	};

	const handleEdit = (account: AccountDtoType) => {
		setSelectedAccount(account);
		setOpenDialog(true);
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
								<TableCell align='right'>
									<IconButton onClick={() => handleEdit(account)} size='small'>
										<EditIcon />
									</IconButton>
									<IconButton
										onClick={() => handleDelete(account.id)}
										size='small'
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

			<ResourceFormPopup
				open={openDialog}
				onClose={handleCloseDialog}
				title={selectedAccount ? 'Modifier le compte' : 'Ajouter un compte'}
			>
				<AccountForm init={selectedAccount} onClose={handleCloseDialog} />
			</ResourceFormPopup>
		</Box>
	);
}
