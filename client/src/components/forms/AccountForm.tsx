import {
	MenuItem,
	FormControl,
	Select,
	TextField,
	InputLabel,
	Grid,
} from '@mui/material';
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
import { DICT } from '../../i18n/fr';
import {
	PAYMENT_METHODS,
	type PaymentMethod,
} from '../../../../shared/constants';

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
		defaultValues: {
			name: init?.name || '',
			paymentMethods: init?.paymentMethods || ['cash' as PaymentMethod],
		},
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
			<Grid container spacing={2}>
				<Grid size={6}>
					<TextField
						fullWidth
						label='Nom du compte'
						{...register('name')}
						error={!!errors.name}
						helperText={errors.name?.message as string}
						required
					/>
				</Grid>

				<Grid size={6}>
					<FormControl fullWidth>
						<InputLabel>Modes de paiements</InputLabel>
						<Select
							{...register('paymentMethods')}
							label='Modes de paiements'
							error={!!errors.paymentMethods}
							required
							defaultValue={init?.paymentMethods || []}
							multiple
						>
							{PAYMENT_METHODS.map((method) => (
								<MenuItem key={method} value={method}>
									{DICT.paymentMethods[method]}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Grid>
			</Grid>
		</ResourceForm>
	);
}
