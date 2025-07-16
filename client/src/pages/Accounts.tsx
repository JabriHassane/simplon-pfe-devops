import { useState } from 'react';
import {
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	IconButton,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAccounts, useDeleteAccount } from '../hooks/ressources/useAccounts';
import AccountForm from '../components/AccountForm';
import type { AccountDtoType } from '../../../shared/dtos/account.dto';
import ResourceFormPopup from '../components/ResourceFormPopup';
import ResourceHeader from '../components/ResourceHeader';
import ResourceLoader from '../components/ResourceLoader';
import ResourceDeleteConfirmation from '../components/ResourceDeleteConfirmation';

export default function Accounts() {
	const [openFormPopup, setOpenFormPopup] = useState(false);
	const [openDeletePopup, setOpenDeletePopup] = useState(false);
	const [selectedAccount, setSelectedAccount] = useState<AccountDtoType | null>(
		null
	);

	const { data: accounts = [], isLoading, error } = useAccounts();
	const deleteAccountMutation = useDeleteAccount();

	const handleDelete = () => {
		if (selectedAccount) {
			deleteAccountMutation.mutate(selectedAccount.id);
		}
	};

	const handleOpenDeletePopup = (account: AccountDtoType) => {
		setSelectedAccount(account);
		setOpenDeletePopup(true);
	};

	const handleOpenEditPopup = (account: AccountDtoType) => {
		setSelectedAccount(account);
		setOpenFormPopup(true);
	};

	const handleOpenAddPopup = () => {
		setSelectedAccount(null);
		setOpenFormPopup(true);
	};

	const handleCloseFormPopup = () => {
		setOpenFormPopup(false);
		setSelectedAccount(null);
	};

	if (isLoading) {
		return <ResourceLoader />;
	}

	return (
		<Box>
			<ResourceHeader
				title='Comptes'
				handleAdd={handleOpenAddPopup}
				error={!!error}
			/>

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
									<IconButton
										onClick={() => handleOpenEditPopup(account)}
										size='small'
									>
										<EditIcon />
									</IconButton>
									<IconButton
										onClick={() => handleOpenDeletePopup(account)}
										size='small'
									>
										<DeleteIcon />
									</IconButton>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			{openFormPopup && (
				<ResourceFormPopup
					onClose={handleCloseFormPopup}
					title={selectedAccount ? 'Modifier le compte' : 'Ajouter un compte'}
				>
					<AccountForm init={selectedAccount} onClose={handleCloseFormPopup} />
				</ResourceFormPopup>
			)}

			{openDeletePopup && (
				<ResourceDeleteConfirmation
					onClose={() => setOpenDeletePopup(false)}
					title='Supprimer le compte'
					description='Voulez-vous vraiment supprimer ce compte ?'
					onDelete={handleDelete}
				/>
			)}
		</Box>
	);
}
