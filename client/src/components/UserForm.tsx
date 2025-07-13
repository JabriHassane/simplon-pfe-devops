import {
	Box,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	CreateUserDto,
	type CreateUserDtoType,
	type UserDtoType,
} from '../../../shared/dtos/user.dto';
import ResourceForm from './ResourceForm';
import { useCreateUser, useUpdateUser } from '../hooks/ressources/useUsers';

interface UserFormProps {
	init: UserDtoType | null;
	onClose: () => void;
}

export default function UserForm({ init, onClose }: UserFormProps) {
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
		control,
	} = useForm({
		resolver: zodResolver(CreateUserDto),
		defaultValues: init
			? {
					...init,
					role: 'agent' as const,
			  }
			: {
					name: '',
					role: 'agent' as const,
			  },
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	const createUserMutation = useCreateUser(onClose);
	const updateUserMutation = useUpdateUser(onClose);

	const onSubmit = async (data: CreateUserDtoType) => {
		if (init) {
			await updateUserMutation.mutateAsync({
				id: init.id,
				data,
			});
		} else {
			await createUserMutation.mutateAsync(data);
		}
	};

	return (
		<ResourceForm
			onSubmit={handleSubmit(onSubmit)}
			isValid={isValid}
			isLoading={createUserMutation.isPending || updateUserMutation.isPending}
		>
			<Box display='flex' gap={2}>
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
				<Controller
					name='role'
					control={control}
					defaultValue='agent'
					render={({ field }) => (
						<FormControl fullWidth margin='normal' error={!!errors.role}>
							<InputLabel>Rôle</InputLabel>
							<Select {...field} label='Rôle'>
								<MenuItem value='agent'>Agent</MenuItem>
								<MenuItem value='admin'>Admin</MenuItem>
								<MenuItem value='super_admin'>Super admin</MenuItem>
							</Select>
						</FormControl>
					)}
				/>
			</Box>

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
		</ResourceForm>
	);
}
