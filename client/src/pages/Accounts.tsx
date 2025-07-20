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
import AccountForm from '../components/forms/AccountForm';
import type { AccountDtoType } from '../../../shared/dtos/account.dto';
import ResourceFormPopup from '../components/shared/ResourceFormPopup';
import ResourceHeader from '../components/shared/ResourceHeader';
import ResourceLoader from '../components/shared/ResourceLoader';
import ResourceDeleteConfirmation from '../components/shared/ResourceDeleteConfirmation';
import useCrud from '../hooks/useCrud';

export default function Accounts() {
	const {
		openFormPopup,
		openDeletePopup,
		selectedResource: selectedAccount,
		handleOpenFormPopup,
		handleOpenDeletePopup,
		handleClosePopup,
	} = useCrud<AccountDtoType>();

	const { data: accounts, isLoading, error } = useAccounts();
	const deleteAccountMutation = useDeleteAccount(handleClosePopup);

	const handleDelete = () => {
		if (selectedAccount) {
			deleteAccountMutation.mutate(selectedAccount.id);
		}
	};

	if (isLoading) {
		return <ResourceLoader />;
	}

	return (
		<Box>
			<ResourceHeader
				title='Comptes'
				handleAdd={() => handleOpenFormPopup(null)}
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
						{accounts?.data.map((account) => (
							<TableRow key={account.id}>
								<TableCell>{account.name}</TableCell>
								<TableCell>{account.ref}</TableCell>
								<TableCell>{account.balance}</TableCell>
								<TableCell align='right'>
									<IconButton
										onClick={() => handleOpenFormPopup(account)}
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
					onClose={handleClosePopup}
					title={selectedAccount ? 'Modifier le compte' : 'Ajouter un compte'}
				>
					<AccountForm init={selectedAccount} onClose={handleClosePopup} />
				</ResourceFormPopup>
			)}

			{openDeletePopup && (
				<ResourceDeleteConfirmation
					onClose={handleClosePopup}
					title='Supprimer le compte'
					description='Voulez-vous vraiment supprimer ce compte ?'
					onDelete={handleDelete}
				/>
			)}
		</Box>
	);
}
