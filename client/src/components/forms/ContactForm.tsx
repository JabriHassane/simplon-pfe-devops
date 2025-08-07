import { Grid, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	CreateContactDto,
	type ContactDto,
} from '../../../../shared/dtos/contact.dto';
import ResourceForm from './ResourceForm';
import {
	useCreateContact,
	useUpdateContact,
} from '../../hooks/ressources/useContacts';

interface ContactFormProps {
	init: ContactDto | null;
	onClose: () => void;
	type: 'client' | 'supplier';
}

export default function ContactForm({ init, onClose, type }: ContactFormProps) {
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm({
		resolver: zodResolver(CreateContactDto),
		defaultValues: {
			type,
			name: init?.name || '',
			phone: init?.phone || '',
			address: init?.address || '',
		},
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	const createContactMutation = useCreateContact(onClose);
	const updateContactMutation = useUpdateContact(onClose);

	const onSubmit = async (data: CreateContactDto) => {
		if (init) {
			await updateContactMutation.mutateAsync({
				id: init.id,
				data,
			});
		} else {
			await createContactMutation.mutateAsync(data);
		}
	};

	return (
		<ResourceForm
			onSubmit={handleSubmit(onSubmit)}
			isValid={isValid}
			isLoading={
				createContactMutation.isPending || updateContactMutation.isPending
			}
		>
			<Grid container spacing={2}>
				<Grid size={6}>
					<TextField
						fullWidth
						label='Nom du contact'
						{...register('name')}
						variant='outlined'
						error={!!errors.name}
						helperText={errors.name?.message as string}
						required
					/>
				</Grid>
				<Grid size={6}>
					<TextField
						fullWidth
						label='Téléphone'
						{...register('phone')}
						variant='outlined'
						error={!!errors.phone}
						helperText={errors.phone?.message as string}
					/>
				</Grid>
				<Grid size={12}>
					<TextField
						fullWidth
						label='Adresse'
						{...register('address')}
						variant='outlined'
						multiline
						rows={3}
						error={!!errors.address}
						helperText={errors.address?.message as string}
					/>
				</Grid>
			</Grid>
		</ResourceForm>
	);
}
