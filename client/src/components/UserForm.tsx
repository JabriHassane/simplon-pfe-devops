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
import { CreateUserDto } from '../utils/validation';

interface UserFormProps {
	onSubmit: (data: any) => void;
	onCancel?: () => void;
	initialData?: {
		username: string;
		email: string;
		password: string;
		role: 'SUPER_ADMIN' | 'ADMIN' | 'AGENT';
	} | null;
	isLoading?: boolean;
}

export default function UserForm({
	onSubmit,
	onCancel,
	initialData,
	isLoading = false,
}: UserFormProps) {
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm({
		resolver: zodResolver(CreateUserDto.shape.body),
		defaultValues: initialData || {
			username: '',
			email: '',
			password: '',
			role: 'AGENT' as const,
		},
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	return (
		<Box component='form' onSubmit={handleSubmit(onSubmit)}>
			<TextField
				fullWidth
				label="Nom d'utilisateur"
				{...register('username')}
				margin='normal'
				variant='outlined'
				error={!!errors.username}
				helperText={errors.username?.message as string}
				required
			/>

			<TextField
				fullWidth
				label='Email'
				type='email'
				{...register('email')}
				margin='normal'
				variant='outlined'
				error={!!errors.email}
				helperText={errors.email?.message as string}
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
					<MenuItem value='SUPER_ADMIN'>Super Admin</MenuItem>
					<MenuItem value='ADMIN'>Admin</MenuItem>
					<MenuItem value='AGENT'>Agent</MenuItem>
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
					{isLoading ? 'Enregistrement...' : initialData ? 'Modifier' : 'Créer'}
				</Button>
			</Box>
		</Box>
	);
}
