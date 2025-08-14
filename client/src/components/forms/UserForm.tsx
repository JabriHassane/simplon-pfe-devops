import {
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Grid,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	CreateUserDto,
	UpdateUserDto,
	type UserDto,
} from '../../../../shared/dtos/user.dto';
import ResourceForm from './ResourceForm';
import { useCreateUser, useUpdateUser } from '../../hooks/ressources/useUsers';
import useAutoFocus from '../../hooks/useAutoFocus';
import { ROLES, type Role } from '../../../../shared/constants';
import { DICT } from '../../i18n/fr';

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
		setValue,
		watch,
	} = useForm({
		resolver: zodResolver(init ? UpdateUserDto : CreateUserDto),
		defaultValues: {
			name: init?.name,
			role: init?.role || 'agent',
			password: '',
		},
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	const role = watch('role');

	const createUserMutation = useCreateUser(onClose);
	const updateUserMutation = useUpdateUser(onClose);

	const onSubmit = async (data: CreateUserDto | UpdateUserDto) => {
		console.log(data);

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
					<FormControl fullWidth>
						<InputLabel>Rôle</InputLabel>
						<Select
							value={role || ''}
							onChange={(e) => setValue('role', e.target.value as Role)}
							label='Rôle'
							displayEmpty
							MenuProps={{
								PaperProps: {
									style: {
										maxHeight: 300,
									},
								},
							}}
							disabled={init?.ref === 'UTI-1'}
						>
							{ROLES.map((role) => (
								<MenuItem key={role} value={role}>
									{DICT.role[role]}
								</MenuItem>
							))}
						</Select>
					</FormControl>
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
