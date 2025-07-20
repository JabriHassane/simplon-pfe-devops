import {
	Box,
	TextField,
	Button,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Typography,
	IconButton,
} from '@mui/material';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ResourcePickerField from '../shared/ResourcePickerField';
import {
	CreateSaleDto,
	type CreateSaleDtoType,
	type SaleDtoType,
} from '../../../../shared/dtos/sale.dto';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import ResourceForm from './ResourceForm';
import { useCreateSale, useUpdateSale } from '../../hooks/ressources/useSales';
import { Add } from '@mui/icons-material';

interface SaleFormProps {
	init: SaleDtoType | null;
	onClose: () => void;
}

export default function SaleForm({ init, onClose }: SaleFormProps) {
	const {
		register,
		handleSubmit,
		control,
		watch,
		setValue,
		formState: { errors, isValid },
	} = useForm({
		resolver: zodResolver(CreateSaleDto),
		defaultValues: init || {
			clientId: '',
			items: [{ productId: '', quantity: 1, price: 0 }],
			discountAmount: 0,
			discountType: 'fixed',
			note: '',
		},
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'items',
	});

	const createSaleMutation = useCreateSale(onClose);
	const updateSaleMutation = useUpdateSale(onClose);

	const onSubmit = async (data: CreateSaleDtoType) => {
		if (init) {
			await updateSaleMutation.mutateAsync({
				id: init.id,
				data,
			});
		} else {
			await createSaleMutation.mutateAsync(data);
		}
	};

	return (
		<ResourceForm
			onSubmit={handleSubmit(onSubmit)}
			isValid={isValid}
			isLoading={createSaleMutation.isPending || updateSaleMutation.isPending}
		>
			<Box display='flex' gap={2} alignItems='center'>
				<Controller
					name='date'
					control={control}
					render={({ field }) => (
						<DatePicker
							label='Date'
							value={dayjs(field.value)}
							onChange={(date) => field.onChange(date?.toISOString())}
							slotProps={{
								textField: {
									error: !!errors.date,
									helperText: errors.date?.message as string,
								},
							}}
						/>
					)}
				/>

				<ResourcePickerField
					label='Client'
					value={watch('clientId') || ''}
					onChange={(value) => {
						setValue('clientId', value);
					}}
					resourceType='client'
					error={!!errors.clientId}
					helperText={errors.clientId?.message as string}
					required
				/>
			</Box>

			<Box display='flex' gap={2} alignItems='center'>
				<TextField
					fullWidth
					margin='normal'
					label='Numéro de reçu'
					{...register('receiptNumber')}
					variant='outlined'
					error={!!errors.receiptNumber}
					helperText={errors.receiptNumber?.message as string}
					required
				/>
				<TextField
					fullWidth
					margin='normal'
					label='Numéro de facture'
					{...register('invoiceNumber')}
					variant='outlined'
					error={!!errors.invoiceNumber}
					helperText={errors.invoiceNumber?.message as string}
					required
				/>
			</Box>

			<FormControl fullWidth margin='normal'>
				<InputLabel>Statut</InputLabel>
				<Select
					{...register('status')}
					label='Statut'
					error={!!errors.status}
					required
				>
					<MenuItem value='pending'>En attente</MenuItem>
					<MenuItem value='partially_paid'>Règlement</MenuItem>
					<MenuItem value='paid'>Payé</MenuItem>
					<MenuItem value='cancelled'>Annulé</MenuItem>
				</Select>
			</FormControl>

			<Box
				display='flex'
				gap={2}
				alignItems='center'
				justifyContent='space-between'
				mt={2}
				mb={4}
			>
				<Typography variant='h6'>Articles</Typography>

				<Button
					onClick={() => append({ productId: '', quantity: 1, price: 0 })}
					variant='contained'
					disableElevation
					startIcon={<Add />}
				>
					Ajouter
				</Button>
			</Box>

			{fields.map((item, index) => (
				<Box
					key={item.id}
					sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}
				>
					<Box sx={{ flex: 2 }}>
						<ResourcePickerField
							label='Produit'
							value={watch(`items.${index}.productId`) || ''}
							onChange={(value) => {
								setValue(`items.${index}.productId`, value);
							}}
							resourceType='product'
							error={!!errors.items?.[index]?.productId}
							helperText={errors.items?.[index]?.productId?.message}
							required
						/>
					</Box>

					<TextField
						label='Quantité'
						type='number'
						{...register(`items.${index}.quantity`, { valueAsNumber: true })}
						sx={{ flex: 1 }}
						inputProps={{ min: 1 }}
						error={!!errors.items?.[index]?.quantity}
						helperText={errors.items?.[index]?.quantity?.message}
						required
					/>

					<TextField
						label='Prix'
						type='number'
						{...register(`items.${index}.price`, { valueAsNumber: true })}
						sx={{ flex: 1 }}
						inputProps={{ min: 0, step: 0.01 }}
						error={!!errors.items?.[index]?.price}
						helperText={errors.items?.[index]?.price?.message}
						required
					/>

					<IconButton
						onClick={() => remove(index)}
						disabled={fields.length === 1}
					>
						×
					</IconButton>
				</Box>
			))}

			<Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
				<TextField
					label='Remise'
					type='number'
					{...register('discountAmount', { valueAsNumber: true })}
					sx={{ flex: 1 }}
					inputProps={{ min: 0, step: 0.01 }}
					error={!!errors.discountAmount}
					helperText={errors.discountAmount?.message as string}
				/>
				<FormControl sx={{ flex: 1 }}>
					<InputLabel>Type de remise</InputLabel>
					<Select
						{...register('discountType')}
						label='Type de remise'
						error={!!errors.discountType}
						defaultValue='fixed'
					>
						<MenuItem value='fixed'>Montant fixe</MenuItem>
						<MenuItem value='percentage'>Pourcentage</MenuItem>
					</Select>
				</FormControl>
			</Box>

			<TextField
				fullWidth
				label='Note'
				{...register('note')}
				margin='normal'
				variant='outlined'
				multiline
				rows={3}
				error={!!errors.note}
				helperText={errors.note?.message as string}
			/>
		</ResourceForm>
	);
}
