import { Box, TextField, Button } from '@mui/material';
import { CreateClientDto } from '../utils/validation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface ClientFormProps {
	onSubmit: (data: any) => void;
	onCancel?: () => void;
	initialData?: any;
	isLoading?: boolean;
}

export default function ClientForm({
	onSubmit,
	onCancel,
	initialData,
	isLoading = false,
}: ClientFormProps) {
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm({
		resolver: zodResolver(CreateClientDto.shape.body),
		defaultValues: initialData || {
			name: '',
			phone: '',
			address: '',
		},
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	// console.log(errors);

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
					size='large'
					disabled={isLoading || !isValid}
					fullWidth
				>
					{isLoading ? 'Enregistrement...' : initialData ? 'Modifier' : 'Créer'}
				</Button>
			</Box>
		</Box>
	);
}
