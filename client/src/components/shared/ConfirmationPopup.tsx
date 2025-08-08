import { Button, Box, Divider, TextField } from '@mui/material';
import ResourceFormPopup from './ResourceFormPopup';
import { useVerifyPassword } from '../../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { VerifyPasswordDto } from '../../../../shared/dtos/auth.dto';

interface ResourceConfirmationDialogProps {
	onClose: () => void;
	title: string;
	description: string;
	onDelete: () => void;
	requirePassword?: boolean;
}

function ConfirmationPopup({
	onClose,
	title,
	description,
	onDelete,
	requirePassword = false,
}: ResourceConfirmationDialogProps) {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<VerifyPasswordDto>({
		resolver: zodResolver(VerifyPasswordDto),
		mode: 'onChange',
	});

	const verifyPasswordMutation = useVerifyPassword(onDelete);

	const handleDelete = async (data: VerifyPasswordDto) => {
		await verifyPasswordMutation.mutateAsync(data);
	};

	return (
		<ResourceFormPopup
			onClose={onClose}
			title={title}
			description={description}
		>
			{requirePassword && (
				<>
					<Divider />
					<Box p={2}>
						<TextField
							fullWidth
							label='Mot de passe'
							type='password'
							{...register('password')}
							error={!!errors.password}
							helperText={errors.password?.message}
							placeholder='Entrez votre mot de passe pour confirmer'
							variant='outlined'
						/>
					</Box>
				</>
			)}

			<Divider />

			<Box display='flex' gap={2} justifyContent='end' p={2}>
				<Button
					onClick={requirePassword ? handleSubmit(handleDelete) : onDelete}
					variant='outlined'
					color='error'
					size='large'
					disableElevation
					fullWidth
					disabled={requirePassword && !isValid}
				>
					Oui
				</Button>
				<Button
					onClick={onClose}
					variant='contained'
					color='primary'
					size='large'
					disableElevation
					fullWidth
				>
					Non
				</Button>
			</Box>
		</ResourceFormPopup>
	);
}

export default ConfirmationPopup;
