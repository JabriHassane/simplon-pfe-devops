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
import { useForm, useFieldArray } from 'react-hook-form';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateOrderDto } from '../utils/validation';
import ResourcePickerField from './ResourcePickerField';

interface OrderFormProps {
	onSubmit: (data: any) => void;
	onCancel?: () => void;
	initialData?: any;
	clients: Array<{ id: string; name: string }>;
	products: Array<{ id: string; name: string; price: number }>;
	isLoading?: boolean;
}

export default function OrderForm({
	onSubmit,
	onCancel,
	initialData,
	clients,
	products,
	isLoading = false,
}: OrderFormProps) {
	const [selectedClient, setSelectedClient] = useState<
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
		resolver: zodResolver(CreateOrderDto.shape.body),
		defaultValues: initialData || {
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

	return (
		<Box component='form' onSubmit={handleSubmit(onSubmit)}>
			<ResourcePickerField
				label='Client'
				value={watch('clientId') || ''}
				onChange={(value) => {
					setValue('clientId', value);
					const client = clients.find((c) => c.id === value);
					setSelectedClient(client || undefined);
				}}
				resourceType='client'
				error={!!errors.clientId}
				helperText={errors.clientId?.message as string}
				required
				selectedResource={selectedClient}
			/>

			<Typography variant='h6' sx={{ mt: 3, mb: 2 }}>
				Order Items
			</Typography>

			{fields.map((item, index) => (
				<Box
					key={item.id}
					sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}
				>
					<Box sx={{ flex: 2 }}>
						<ResourcePickerField
							label='Product'
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
						/>
					</Box>
					<TextField
						label='Qty'
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
						label='Price'
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
				Add Item
			</Button>

			<Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
				<TextField
					label='Discount Amount'
					type='number'
					{...register('discountAmount', { valueAsNumber: true })}
					sx={{ flex: 1 }}
					inputProps={{ min: 0, step: 0.01 }}
					error={!!errors.discountAmount}
					helperText={errors.discountAmount?.message as string}
				/>
				<FormControl sx={{ flex: 1 }}>
					<InputLabel>Discount Type</InputLabel>
					<Select
						{...register('discountType')}
						label='Discount Type'
						error={!!errors.discountType}
						defaultValue='fixed'
					>
						<MenuItem value='fixed'>Fixed Amount</MenuItem>
						<MenuItem value='percentage'>Percentage</MenuItem>
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

			<Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
				{onCancel && (
					<Button
						variant='outlined'
						onClick={onCancel}
						fullWidth
						size='large'
						disabled={isLoading}
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
					{isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'}
				</Button>
			</Box>
		</Box>
	);
}
