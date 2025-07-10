import { Box, TextField, Button } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateSupplierDto } from '../../../shared/dtos/supplier.dto';

interface SupplierFormProps {
	onSubmit: (data: any) => void;
	init?: {
		name: string;
		phone: string;
		address: string;
	} | null;
	isLoading?: boolean;
}

export default function SupplierForm({
	onSubmit,
	init,
	isLoading = false,
}: SupplierFormProps) {
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm({
		resolver: zodResolver(CreateSupplierDto),
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
			<Box
				sx={{
					px: 2,
					pt: 0.5,
					pb: 1.5,
					borderTop: '1.5px solid #e0e0e0',
					borderBottom: '1.5px solid #e0e0e0',
				}}
			>
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
			</Box>

			<Box p={2}>
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
