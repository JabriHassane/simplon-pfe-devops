import { Box } from '@mui/material';
import { useAccounts, useDeleteAccount } from '../hooks/ressources/useAccounts';
import AccountForm from '../components/forms/AccountForm';
import type { AccountDtoType } from '../../../shared/dtos/account.dto';
import ResourceFormPopup from '../components/shared/ResourceFormPopup';
import ResourceHeader from '../components/shared/ResourceHeader';
import ResourceLoader from '../components/shared/ResourceLoader';
import ResourceDeleteConfirmation from '../components/shared/ResourceDeleteConfirmation';
import useCrud from '../hooks/useCrud';
import { formatPrice } from '../utils/price.utils';
import ResourceTable from '../components/shared/ResourceTable';

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

			<ResourceTable
				headers={[
					{ id: 'ref', name: 'Ref' },
					{ id: 'name', name: 'Nom' },
					{ id: 'balance', name: 'Solde' },
				]}
				rows={accounts?.data.map((account) => ({
					item: account,
					data: {
						ref: account.ref,
						name: account.name,
						balance: formatPrice(account.balance),
					},
				}))}
				onEdit={handleOpenFormPopup}
				onDelete={handleOpenDeletePopup}
			/>

			{openFormPopup && (
				<ResourceFormPopup
					onClose={handleClosePopup}
					title={
						selectedAccount
							? `Modifier ${selectedAccount.ref}`
							: 'Nouveau compte'
					}
				>
					<AccountForm init={selectedAccount} onClose={handleClosePopup} />
				</ResourceFormPopup>
			)}

			{openDeletePopup && (
				<ResourceDeleteConfirmation
					onClose={handleClosePopup}
					title={`Supprimer ${selectedAccount?.ref}`}
					description='Voulez-vous vraiment supprimer ce compte ?'
					onDelete={handleDelete}
				/>
			)}
		</Box>
	);
}
