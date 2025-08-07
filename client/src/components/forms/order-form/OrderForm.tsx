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
	CreateOrderDto,
	type OrderDto,
} from '../../../../../shared/dtos/order.dto';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import ResourceForm from '../ResourceForm';
import {
	useCreateOrder,
	useUpdateOrder,
} from '../../../hooks/ressources/useOrders';
import { ORDER_STATUSES } from '../../../../../shared/constants';
import { DICT } from '../../../i18n/fr';
import { OrderPayments } from './OrderPayments';

interface OrderFormProps {
	init: OrderDto | null;
	onClose: () => void;
	type: 'sale' | 'purchase';
}

export default function OrderForm({ init, onClose, type }: OrderFormProps) {
	const methods = useForm({
		resolver: zodResolver(CreateOrderDto),
		defaultValues: {
			date: init?.date || dayjs().toISOString(),
			agentId: init?.agentId || '',
			contactId: init?.contactId || '',
			payments: init?.payments || [],
			note: init?.note || '',
			status: init?.status || 'pending',
			type: init?.type || type,
		},
	});

	const {
		register,
		handleSubmit,
		control,
		setValue,
		formState: { errors, isValid },
	} = methods;

	const createOrderMutation = useCreateOrder(onClose);
	const updateOrderMutation = useUpdateOrder(onClose);

	const onSubmit = async (data: CreateOrderDto) => {
		if (init) {
			await updateOrderMutation.mutateAsync({
				id: init.id,
				data,
			});
		} else {
			await createOrderMutation.mutateAsync(data);
		}
	};

	return (
		<FormProvider {...methods}>
			<ResourceForm
				onSubmit={handleSubmit(onSubmit)}
				isValid={isValid}
				isLoading={
					createOrderMutation.isPending || updateOrderMutation.isPending
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
							init={init?.contact?.name}
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
							init={init?.agent?.name}
							onChange={({ id }) => {
								setValue('agentId', id);
							}}
							resourceType='user'
							error={!!errors.agentId}
							helperText={errors.agentId?.message as string}
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

					<Grid size={4}>
						<TextField
							fullWidth
							label='Prix total'
							type='number'
							{...register('totalPrice', { valueAsNumber: true })}
							variant='outlined'
							error={!!errors.totalPrice}
							helperText={errors.totalPrice?.message as string}
							required
						/>
					</Grid>

					<Grid size={4}>
						<TextField
							fullWidth
							label='Montant payé'
							type='number'
							{...register('totalPaid', { valueAsNumber: true })}
							variant='outlined'
							error={!!errors.totalPaid}
							helperText={errors.totalPaid?.message as string}
							required
						/>
					</Grid>

					<Grid size={4}>
						<TextField
							fullWidth
							label='Reste à payer'
							type='number'
							{...register('totalDue', { valueAsNumber: true })}
							variant='outlined'
							error={!!errors.totalDue}
							helperText={errors.totalDue?.message as string}
							required
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

					<Grid size={12}>
						<OrderPayments />
					</Grid>
				</Grid>
			</ResourceForm>
		</FormProvider>
	);
}
