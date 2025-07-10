import {
	Box,
	TextField,
	Button,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	CreateUserDto,
	type CreateUserDtoType,
} from '../../../shared/dtos/user.dto';

interface UserFormProps {
	onSubmit: (data: any) => void;
	onCancel?: () => void;
	init?: CreateUserDtoType | null;
	isLoading?: boolean;
}

export default function UserForm({
	onSubmit,
	onCancel,
	init,
	isLoading = false,
}: UserFormProps) {
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm({
		resolver: zodResolver(CreateUserDto),
		defaultValues: init || undefined,
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	return (
		<Box component='form' onSubmit={handleSubmit(onSubmit)}>
			<TextField
				fullWidth
				label="Nom d'utilisateur"
				{...register('name')}
				margin='normal'
				variant='outlined'
				error={!!errors.name}
				helperText={errors.name?.message as string}
				required
			/>

			<TextField
				fullWidth
				label='Mot de passe'
				type='password'
				{...register('password')}
				margin='normal'
				variant='outlined'
				error={!!errors.password}
				helperText={errors.password?.message as string}
				required
			/>

			<FormControl fullWidth margin='normal'>
				<InputLabel>Rôle</InputLabel>
				<Select
					{...register('role')}
					label='Rôle'
					error={!!errors.role}
					required
				>
					<MenuItem value='super_admin'>Super Admin</MenuItem>
					<MenuItem value='admin'>Admin</MenuItem>
					<MenuItem value='agent'>Agent</MenuItem>
				</Select>
			</FormControl>

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
