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
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import ResourcePickerField from '../shared/ResourcePickerField';
import {
	CreatePurchaseDto,
	type CreatePurchaseDtoType,
	type PurchaseDtoType,
} from '../../../../shared/dtos/purchase.dto';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import { useProducts } from '../../hooks/ressources/useProducts';
import { useSuppliers } from '../../hooks/ressources/useSuppliers';
import ResourceForm from './ResourceForm';
import { useCreatePurchase } from '../../hooks/ressources/usePurchases';
import { useUpdatePurchase } from '../../hooks/ressources/usePurchases';

interface PurchaseFormProps {
	init: PurchaseDtoType | null;
	onClose: () => void;
}

export default function PurchaseForm({ init, onClose }: PurchaseFormProps) {
	const { data: suppliers = [], isLoading: suppliersLoading } = useSuppliers();
	const { data: products = [], isLoading: productsLoading } = useProducts();

	const [selectedSupplier, setSelectedSupplier] = useState<
		| {
				id: string;
				name: string;
				email?: string;
		  }
		| undefined
	>(undefined);

	const [selectedProducts, setSelectedProducts] = useState<{
		[key: number]: { id: string; name: string; price: number };
	}>({});

	const {
		register,
		handleSubmit,
		control,
		watch,
		setValue,
		formState: { errors, isValid },
	} = useForm({
		resolver: zodResolver(CreatePurchaseDto),
		defaultValues: init || undefined,
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'items',
	});

	const createPurchaseMutation = useCreatePurchase(onClose);
	const updatePurchaseMutation = useUpdatePurchase(onClose);

	const onSubmit = async (data: CreatePurchaseDtoType) => {
		if (init) {
			await updatePurchaseMutation.mutateAsync({
				id: init.id,
				data,
			});
		} else {
			await createPurchaseMutation.mutateAsync(data);
		}
	};

	return (
		<ResourceForm
			onSubmit={handleSubmit(onSubmit)}
			isValid={isValid}
			isLoading={
				createPurchaseMutation.isPending || updatePurchaseMutation.isPending
			}
		>
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
				label='Fournisseur'
				value={watch('supplierId') || ''}
				onChange={(value) => {
					setValue('supplierId', value);
					const supplier = suppliers.find((c) => c.id === value);
					setSelectedSupplier(supplier || undefined);
				}}
				resourceType='supplier'
				error={!!errors.supplierId}
				helperText={errors.supplierId?.message as string}
				required
				selectedResource={selectedSupplier}
				disabled={suppliersLoading}
			/>

			<TextField
				fullWidth
				label='Numéro de reçu'
				{...register('receiptNumber')}
				margin='normal'
				variant='outlined'
				error={!!errors.receiptNumber}
				helperText={errors.receiptNumber?.message as string}
				required
			/>

			<TextField
				fullWidth
				label='Numéro de facture'
				{...register('invoiceNumber')}
				margin='normal'
				variant='outlined'
				error={!!errors.invoiceNumber}
				helperText={errors.invoiceNumber?.message as string}
				required
			/>

			<FormControl fullWidth margin='normal'>
				<InputLabel>Statut</InputLabel>
				<Select
					{...register('status')}
					label='Statut'
					error={!!errors.status}
					required
				>
					<MenuItem value='pending'>En attente</MenuItem>
					<MenuItem value='partially-paid'>Partiellement payé</MenuItem>
					<MenuItem value='paid'>Payé</MenuItem>
					<MenuItem value='cancelled'>Annulé</MenuItem>
				</Select>
			</FormControl>

			<Typography variant='h6' sx={{ mt: 3, mb: 2 }}>
				Articles
			</Typography>

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
								const product = products.find((p) => p.id === value);
								if (product) {
									setSelectedProducts((prev) => ({
										...prev,
										[index]: product,
									}));
									setValue(`items.${index}.price`, product.price);
								}
							}}
							resourceType='product'
							error={!!(errors.items as any)?.[index]?.productId}
							helperText={
								(errors.items as any)?.[index]?.productId?.message as string
							}
							required
							selectedResource={selectedProducts[index]}
							disabled={productsLoading}
						/>
					</Box>

					<TextField
						label='Quantité'
						type='number'
						{...register(`items.${index}.quantity`, { valueAsNumber: true })}
						sx={{ flex: 1 }}
						inputProps={{ min: 1 }}
						error={!!(errors.items as any)?.[index]?.quantity}
						helperText={
							(errors.items as any)?.[index]?.quantity?.message as string
						}
						required
					/>

					<TextField
						label='Prix'
						type='number'
						{...register(`items.${index}.price`, { valueAsNumber: true })}
						sx={{ flex: 1 }}
						inputProps={{ min: 0, step: 0.01 }}
						error={!!(errors.items as any)?.[index]?.price}
						helperText={
							(errors.items as any)?.[index]?.price?.message as string
						}
						required
					/>

					<IconButton
						onClick={() => remove(index)}
						color='error'
						disabled={fields.length === 1}
					>
						×
					</IconButton>
				</Box>
			))}

			<Button
				onClick={() => append({ productId: '', quantity: 1, price: 0 })}
				variant='outlined'
				sx={{ mb: 2 }}
			>
				Ajouter un article
			</Button>

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
