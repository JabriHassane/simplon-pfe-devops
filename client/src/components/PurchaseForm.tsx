import {
	Box,
	TextField,
	Button,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreatePurchaseDto } from '../utils/validation';

interface PurchaseFormProps {
	onSubmit: (data: any) => void;
	onCancel?: () => void;
	initialData?: any;
	suppliers: Array<{ id: string; name: string }>;
	products: Array<{ id: string; name: string; price: number }>;
	isLoading?: boolean;
}

export default function PurchaseForm({
	onSubmit,
	onCancel,
	initialData,
	suppliers,
	products,
	isLoading = false,
}: PurchaseFormProps) {
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm({
		resolver: zodResolver(CreatePurchaseDto.shape.body),
		defaultValues: initialData || {
			date: new Date().toISOString().split('T')[0],
			supplierId: '',
			receiptNumber: '',
			invoiceNumber: '',
			items: [{ productId: '', price: 0, quantity: 1 }],
			status: 'pending' as const,
			discountAmount: 0,
			discountType: 'fixed' as const,
			note: '',
		},
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	return (
		<Box component='form' onSubmit={handleSubmit(onSubmit)}>
			<TextField
				fullWidth
				label='Date'
				type='date'
				{...register('date')}
				margin='normal'
				variant='outlined'
				error={!!errors.date}
				helperText={errors.date?.message as string}
				required
			/>

			<TextField
				fullWidth
				label='ID du fournisseur'
				{...register('supplierId')}
				margin='normal'
				variant='outlined'
				error={!!errors.supplierId}
				helperText={errors.supplierId?.message as string}
				required
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

			<TextField
				fullWidth
				label='Montant de remise'
				type='number'
				{...register('discountAmount', { valueAsNumber: true })}
				margin='normal'
				variant='outlined'
				error={!!errors.discountAmount}
				helperText={errors.discountAmount?.message as string}
			/>

			<FormControl fullWidth margin='normal'>
				<InputLabel>Type de remise</InputLabel>
				<Select
					{...register('discountType')}
					label='Type de remise'
					error={!!errors.discountType}
				>
					<MenuItem value='fixed'>Montant fixe</MenuItem>
					<MenuItem value='percentage'>Pourcentage</MenuItem>
				</Select>
			</FormControl>

			<TextField
				fullWidth
				label='Note (optionnel)'
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
