import { Box, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	CreateClientDto,
	type CreateClientDtoType,
	type ClientDtoType,
} from '../../../../shared/dtos/client.dto';
import ResourceForm from './ResourceForm';
import {
	useCreateClient,
	useUpdateClient,
} from '../../hooks/ressources/useClients';

interface ClientFormProps {
	init: ClientDtoType | null;
	onClose: () => void;
}

export default function ClientForm({ init, onClose }: ClientFormProps) {
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm({
		resolver: zodResolver(CreateClientDto),
		defaultValues: init || undefined,
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	const createClientMutation = useCreateClient(onClose);
	const updateClientMutation = useUpdateClient(onClose);

	const onSubmit = async (data: CreateClientDtoType) => {
		if (init) {
			await updateClientMutation.mutateAsync({
				id: init.id,
				data,
			});
		} else {
			await createClientMutation.mutateAsync(data);
		}
	};

	return (
		<ResourceForm
			onSubmit={handleSubmit(onSubmit)}
			isValid={isValid}
			isLoading={
				createClientMutation.isPending || updateClientMutation.isPending
			}
		>
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
		</ResourceForm>
	);
}
