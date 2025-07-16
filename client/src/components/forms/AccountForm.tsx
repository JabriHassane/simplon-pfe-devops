import { Box, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	CreateAccountDto,
	type CreateAccountDtoType,
	type AccountDtoType,
} from '../../../../shared/dtos/account.dto';
import {
	useCreateAccount,
	useUpdateAccount,
} from '../../hooks/ressources/useAccounts';
import ResourceForm from './ResourceForm';

interface AccountFormProps {
	init: AccountDtoType | null;
	onClose: () => void;
}

export default function AccountForm({ init, onClose }: AccountFormProps) {
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm({
		resolver: zodResolver(CreateAccountDto),
		defaultValues: init || undefined,
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	const createAccountMutation = useCreateAccount(onClose);
	const updateAccountMutation = useUpdateAccount(onClose);

	const onSubmit = async (data: CreateAccountDtoType) => {
		if (init) {
			await updateAccountMutation.mutateAsync({
				id: init.id,
				data,
			});
		} else {
			await createAccountMutation.mutateAsync(data);
		}
	};

	return (
		<ResourceForm
			onSubmit={handleSubmit(onSubmit)}
			isValid={isValid}
			isLoading={
				createAccountMutation.isPending || updateAccountMutation.isPending
			}
		>
			<TextField
				fullWidth
				label='Nom du compte'
				{...register('name')}
				margin='normal'
				error={!!errors.name}
				helperText={errors.name?.message as string}
				required
			/>
		</ResourceForm>
	);
}
