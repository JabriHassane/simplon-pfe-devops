import { TextField, Grid } from '@mui/material';
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
import { OrderPayments } from './OrderPayments';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../../../contexts/AuthContext';
import useAutoFocus from '../../../hooks/useAutoFocus';

interface OrderFormProps {
	init: OrderDto | null;
	onClose: () => void;
	type: 'sale' | 'purchase';
}

export default function OrderForm({ init, onClose, type }: OrderFormProps) {
	const [user] = useContext(AuthContext);

	const ref = useAutoFocus(!init);

	const methods = useForm({
		resolver: zodResolver(CreateOrderDto),
		defaultValues: {
			date: init?.date || dayjs().toISOString(),
			agentId: init?.agentId || user?.id,
			contactId: init?.contactId,
			payments: init?.payments || [],
			type: init?.type || type,
			totalPrice: init?.totalPrice,
			receiptNumber: init?.receiptNumber,
			invoiceNumber: init?.invoiceNumber,
		},
	});

	const {
		register,
		handleSubmit,
		control,
		setValue,
		formState: { errors },
		watch,
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

	const totalPrice = watch('totalPrice') || 0;
	const formPayments = watch('payments') || [];
	const totalPaid = formPayments.reduce(
		(acc: number, payment: { amount?: number }) => acc + (payment.amount || 0),
		0
	);
	const totalDue = totalPrice - totalPaid;

	useEffect(() => {
		setValue('totalPaid', totalPaid);
		setValue('totalDue', totalDue);
	}, [totalPaid]);

	return (
		<FormProvider {...methods}>
			<ResourceForm
				onSubmit={handleSubmit(onSubmit)}
				isLoading={
					createOrderMutation.isPending || updateOrderMutation.isPending
				}
			>
				<Grid container spacing={2}>
					<Grid size={12}>
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
						<ResourcePickerField
							label='Agent'
							init={init?.agent?.name || user?.name}
							onChange={({ id }) => setValue('agentId', id)}
							resourceType='user'
							error={!!errors.agentId}
							helperText={errors.agentId?.message as string}
							required
						/>
					</Grid>

					<Grid size={6}>
						<ResourcePickerField
							label='Contact'
							init={init?.contact?.name}
							onChange={({ id }) => setValue('contactId', id)}
							resourceType='contact'
							error={!!errors.contactId}
							helperText={errors.contactId?.message as string}
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
							inputRef={(element: any) => (ref.current = element)}
						/>
					</Grid>

					<Grid size={4}>
						<TextField
							fullWidth
							label='Montant payé'
							type='number'
							variant='outlined'
							value={totalPaid}
							slotProps={{
								input: {
									readOnly: true,
								},
							}}
						/>
					</Grid>

					<Grid size={4}>
						<TextField
							fullWidth
							label='Reste à payer'
							type='number'
							value={totalDue}
							slotProps={{
								input: {
									readOnly: true,
								},
							}}
							variant='outlined'
						/>
					</Grid>

					<Grid size={12}>
						<OrderPayments showRef={!!init?.id} />
					</Grid>
				</Grid>
			</ResourceForm>
		</FormProvider>
	);
}
