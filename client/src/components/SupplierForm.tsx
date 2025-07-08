import { Box, TextField, Button } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateSupplierDto } from '../utils/validation';

interface SupplierFormProps {
	onSubmit: (data: any) => void;
	onCancel?: () => void;
	initialData?: {
		name: string;
		phone: string;
		address: string;
	} | null;
	isLoading?: boolean;
}

export default function SupplierForm({
	onSubmit,
	onCancel,
	initialData,
	isLoading = false,
}: SupplierFormProps) {
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm({
		resolver: zodResolver(CreateSupplierDto.shape.body),
		defaultValues: initialData || {
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
				label='Nom du fournisseur'
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
					{isLoading ? 'Enregistrement...' : initialData ? 'Modifier' : 'Créer'}
				</Button>
			</Box>
		</Box>
	);
}
