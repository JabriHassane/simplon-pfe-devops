import {
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Grid,
} from '@mui/material';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ResourcePickerField from '../../shared/ResourcePickerField';
import {
	type CreatePurchaseDtoType,
	CreatePurchaseDto,
} from '../../../../../shared/dtos/purchase.dto';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import ResourceForm from '../ResourceForm';
import {
	useCreatePurchase,
	useUpdatePurchase,
} from '../../../hooks/ressources/usePurchases';
import { ORDER_STATUSES } from '../../../../../shared/constants';
import { DICT } from '../../../i18n/fr';
import { OrderPayments } from './OrderPayments';
import type { PurchaseDtoType } from '../../../../../shared/dtos/purchase.dto';

interface PurchaseFormProps {
	init: PurchaseDtoType | null;
	onClose: () => void;
}

export default function PurchaseForm({ init, onClose }: PurchaseFormProps) {
	const methods = useForm({
		resolver: zodResolver(CreatePurchaseDto),
		defaultValues: {
			date: init?.date || '',
			agentId: init?.agentId || '',
			contactId: init?.contact?.id || '',
			payments: init?.payments || [],
			note: init?.note || '',
			status: init?.status || 'pending',
		},
	});

	const {
		register,
		handleSubmit,
		control,
		setValue,
		formState: { errors, isValid },
	} = methods;

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
		<FormProvider {...methods}>
			<ResourceForm
				onSubmit={handleSubmit(onSubmit)}
				isValid={isValid}
				isLoading={
					createPurchaseMutation.isPending || updatePurchaseMutation.isPending
				}
			>
				<Grid container spacing={2}>
					<Grid size={6}>
						<Controller
							name='date'
							control={control}
							render={({ field }) => (
								<DatePicker
									sx={{ width: '100%' }}
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
					</Grid>

					<Grid size={6}>
						<FormControl fullWidth>
							<InputLabel>Statut</InputLabel>
							<Select
								{...register('status')}
								label='Statut'
								error={!!errors.status}
								required
								defaultValue='pending'
							>
								{ORDER_STATUSES.map((status) => (
									<MenuItem key={status} value={status}>
										{DICT.orderStatus[status]}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Grid>

					<Grid size={6}>
						<ResourcePickerField
							label='Contact'
							value={init?.contact?.name}
							onChange={({ id }) => {
								setValue('contactId', id);
							}}
							resourceType='contact'
							error={!!errors.contactId}
							helperText={errors.contactId?.message as string}
							required
						/>
					</Grid>

					<Grid size={6}>
						<ResourcePickerField
							label='Agent'
							value={init?.agent?.name}
							onChange={({ id }) => {
								setValue('agentId', id);
							}}
							resourceType='user'
							error={!!errors.agentId}
							helperText={errors.agentId?.message as string}
							required
						/>
					</Grid>

					<Grid size={6}>
						<TextField
							fullWidth
							label='Numéro de reçu'
							{...register('receiptNumber')}
							variant='outlined'
							error={!!errors.receiptNumber}
							helperText={errors.receiptNumber?.message as string}
						/>
					</Grid>

					<Grid size={6}>
						<TextField
							fullWidth
							label='Numéro de facture'
							{...register('invoiceNumber')}
							variant='outlined'
							error={!!errors.invoiceNumber}
							helperText={errors.invoiceNumber?.message as string}
						/>
					</Grid>

					<Grid size={12}>
						<TextField
							fullWidth
							label='Note'
							{...register('note')}
							variant='outlined'
							multiline
							rows={3}
							error={!!errors.note}
							helperText={errors.note?.message as string}
						/>
					</Grid>
				</Grid>

				<OrderPayments init={init?.payments} />
			</ResourceForm>
		</FormProvider>
	);
}
