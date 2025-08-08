import { TextField, Grid } from '@mui/material';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ResourcePickerField from '../../shared/ResourcePickerField';
import {
	CreateOrderDto,
	CreatePaymentDto,
	PaymentDto,
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
import type { TransactionDto } from '../../../../../shared/dtos/transaction.dto';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../../../contexts/AuthContext';
import PaymentFormPopup from './OrderPaymentFormPopup';
import usePopups from '../../../hooks/usePopups';
import ConfirmationPopup from '../../shared/ConfirmationPopup';

interface OrderFormProps {
	init: OrderDto | null;
	onClose: () => void;
	type: 'sale' | 'purchase';
}

export default function OrderForm({ init, onClose, type }: OrderFormProps) {
	const [user] = useContext(AuthContext);

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

	console.log('payments', init?.payments);
	console.log('errors', errors);

	const createOrderMutation = useCreateOrder(onClose);
	const updateOrderMutation = useUpdateOrder(onClose);

	const {
		openFormPopup,
		openDeletePopup,
		selectedResource: selectedPayment,
		selectedIndex,
		handleOpenFormPopup,
		handleOpenDeletePopup,
		handleClosePopup,
	} = usePopups<TransactionDto>();

	const orderPayments = (watch('payments') || []) as TransactionDto[];

	const handlePaymentSubmit = (payment: CreatePaymentDto) => {
		const newPayments = [...orderPayments];
		if (selectedPayment) {
			newPayments[selectedIndex] = payment as TransactionDto;
		} else {
			newPayments.push(payment as TransactionDto);
		}
		setValue('payments', newPayments as PaymentDto[]);
		console.log(newPayments);
		handleClosePopup();
	};

	const handlePaymentRemove = () => {
		const newPayments = [...orderPayments];
		newPayments.splice(selectedIndex, 1);
		setValue('payments', newPayments as PaymentDto[]);
		handleClosePopup();
	};

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
		(acc, payment) => acc + (payment.amount || 0),
		0
	);
	const totalDue = totalPrice - totalPaid;

	useEffect(() => {
		setValue('totalPaid', totalPaid);
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
							label='Contact'
							init={init?.contact?.name}
							onChange={({ id }) => setValue('contactId', id)}
							resourceType='contact'
							error={!!errors.contactId}
							helperText={errors.contactId?.message as string}
							required
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
						<OrderPayments
							payments={orderPayments}
							onOpenFormPopup={handleOpenFormPopup}
							onOpenDeletePopup={handleOpenDeletePopup}
							showRef={!!init}
						/>
					</Grid>
				</Grid>
			</ResourceForm>

			{openFormPopup && (
				<PaymentFormPopup
					init={selectedPayment}
					onSubmit={handlePaymentSubmit}
					onClose={handleClosePopup}
				/>
			)}

			{openDeletePopup && (
				<ConfirmationPopup
					onClose={handleClosePopup}
					title={`Supprimer ${selectedPayment?.ref}`}
					description='Voulez-vous vraiment supprimer ce paiement ?'
					onDelete={handlePaymentRemove}
				/>
			)}
		</FormProvider>
	);
}
