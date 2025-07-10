import { Box, TextField, Button } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateClientDto } from '../../../shared/dtos/client.dto';

interface ClientFormProps {
	onSubmit: (data: any) => void;
	init?: any;
	isLoading?: boolean;
}

export default function ClientForm({
	onSubmit,
	init,
	isLoading = false,
}: ClientFormProps) {
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm({
		resolver: zodResolver(CreateClientDto),
		defaultValues: init || {
			name: '',
			phone: '',
			address: '',
		},
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	return (
		<Box component='form' onSubmit={handleSubmit(onSubmit)}>
			<TextField
				fullWidth
				label='Nom du client'
				{...register('name')}
				margin='normal'
				variant='outlined'
				error={!!errors.name}
				helperText={errors.name?.message as string}
				required
			/>

			<TextField
				fullWidth
				label='Téléphone'
				{...register('phone')}
				margin='normal'
				variant='outlined'
				error={!!errors.phone}
				helperText={errors.phone?.message as string}
				required
			/>

			<TextField
				fullWidth
				label='Adresse'
				{...register('address')}
				margin='normal'
				variant='outlined'
				multiline
				rows={3}
				error={!!errors.address}
				helperText={errors.address?.message as string}
			/>

			<Button
				type='submit'
				variant='contained'
				size='large'
				disabled={isLoading || !isValid}
				fullWidth
			>
				{isLoading ? 'Enregistrement...' : init ? 'Modifier' : 'Créer'}
			</Button>
		</Box>
	);
}
