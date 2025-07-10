import { Box, Button, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	CreateAccountDto,
	type CreateAccountDtoType,
} from '../../../shared/dtos/account.dto';

interface AccountFormProps {
	onSubmit: (data: any) => void;
	onCancel?: () => void;
	init?: CreateAccountDtoType | null;
	isLoading?: boolean;
}

export default function AccountForm({
	onSubmit,
	onCancel,
	init,
	isLoading = false,
}: AccountFormProps) {
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm({
		resolver: zodResolver(CreateAccountDto),
		defaultValues: init || {
			name: '',
			balance: 0,
		},
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	return (
		<Box component='form' onSubmit={handleSubmit(onSubmit)}>
			<TextField
				fullWidth
				label='Nom du compte'
				{...register('name')}
				margin='normal'
				error={!!errors.name}
				helperText={errors.name?.message as string}
				required
				sx={{
					marginTop: 0,
				}}
			/>
			<TextField
				fullWidth
				label='Référence'
				{...register('balance')}
				margin='normal'
				error={!!errors.balance}
				helperText={errors.balance?.message as string}
				required
			/>

			<Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
				{onCancel && (
					<Button
						type='button'
						variant='outlined'
						size='large'
						onClick={onCancel}
						fullWidth
					>
						Cancel
					</Button>
				)}
				<Button
					type='submit'
					variant='contained'
					disabled={isLoading || !isValid}
					fullWidth
					size='large'
				>
					{isLoading ? 'Enregistrement...' : init ? 'Modifier' : 'Créer'}
				</Button>
			</Box>
		</Box>
	);
}
