import {
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Grid,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	CreateUserDto,
	UpdateUserDto,
	type UserDto,
} from '../../../../shared/dtos/user.dto';
import ResourceForm from './ResourceForm';
import { useCreateUser, useUpdateUser } from '../../hooks/ressources/useUsers';
import useAutoFocus from '../../hooks/useAutoFocus';

interface UserFormProps {
	init: UserDto | null;
	onClose: () => void;
}

export default function UserForm({ init, onClose }: UserFormProps) {
	const ref = useAutoFocus(!init);

	const {
		register,
		handleSubmit,
		formState: { errors },
		control,
	} = useForm({
		resolver: zodResolver(init ? UpdateUserDto : CreateUserDto),
		defaultValues: init
			? {
					...init,
					password: '',
			  }
			: {
					name: '',
					role: 'agent' as const,
					password: '',
			  },
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	const createUserMutation = useCreateUser(onClose);
	const updateUserMutation = useUpdateUser(onClose);

	const onSubmit = async (data: CreateUserDto | UpdateUserDto) => {
		if (init) {
			await updateUserMutation.mutateAsync({
				id: init.id,
				data,
			});
		} else {
			await createUserMutation.mutateAsync(data as CreateUserDto);
		}
	};

	return (
		<ResourceForm
			onSubmit={handleSubmit(onSubmit)}
			isLoading={createUserMutation.isPending || updateUserMutation.isPending}
		>
			<Grid container spacing={2}>
				<Grid size={6}>
					<TextField
						fullWidth
						label="Nom d'utilisateur"
						{...register('name')}
						variant='outlined'
						error={!!errors.name}
						helperText={errors.name?.message as string}
						required
						inputRef={(element: any) => (ref.current = element)}
					/>
				</Grid>

				<Grid size={6}>
					<Controller
						name='role'
						control={control}
						defaultValue='agent'
						disabled={init?.role === 'super_admin'}
						render={({ field }) => (
							<FormControl fullWidth error={!!errors.role} required>
								<InputLabel>Rôle</InputLabel>
								<Select {...field} label='Rôle'>
									<MenuItem value='agent'>Agent</MenuItem>
									<MenuItem value='admin'>Admin</MenuItem>
									<MenuItem value='super_admin'>Super admin</MenuItem>
								</Select>
							</FormControl>
						)}
					/>
				</Grid>

				<Grid size={12}>
					<TextField
						fullWidth
						label='Mot de passe'
						type='password'
						{...register('password')}
						variant='outlined'
						error={!!errors.password}
						helperText={errors.password?.message as string}
						required={!init}
						autoComplete='new-password'
					/>
				</Grid>
			</Grid>
		</ResourceForm>
	);
}
