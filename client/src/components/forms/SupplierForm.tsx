import { Box, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	CreateSupplierDto,
	type CreateSupplierDtoType,
	type SupplierDtoType,
} from '../../../../shared/dtos/supplier.dto';
import ResourceForm from './ResourceForm';
import {
	useCreateSupplier,
	useUpdateSupplier,
} from '../../hooks/ressources/useSuppliers';

interface SupplierFormProps {
	init: SupplierDtoType | null;
	onClose: () => void;
}

export default function SupplierForm({ init, onClose }: SupplierFormProps) {
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm({
		resolver: zodResolver(CreateSupplierDto),
		defaultValues: init || undefined,
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	const createSupplierMutation = useCreateSupplier(onClose);
	const updateSupplierMutation = useUpdateSupplier(onClose);

	const onSubmit = async (data: CreateSupplierDtoType) => {
		if (init) {
			await updateSupplierMutation.mutateAsync({
				id: init.id,
				data,
			});
		} else {
			await createSupplierMutation.mutateAsync(data);
		}
	};

	return (
		<ResourceForm
			onSubmit={handleSubmit(onSubmit)}
			isValid={isValid}
			isLoading={
				createSupplierMutation.isPending || updateSupplierMutation.isPending
			}
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
		</ResourceForm>
	);
}
