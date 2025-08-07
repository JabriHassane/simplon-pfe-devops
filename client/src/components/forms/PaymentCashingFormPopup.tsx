import { PaymentCashingDto } from '../../../../shared/dtos/order.dto';
import ResourceFormPopup from '../shared/ResourceFormPopup';
import ResourcePickerField from '../shared/ResourcePickerField';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ResourceForm from './ResourceForm';
import {
	useCashPayment,
	useDepositPayment,
} from '../../hooks/ressources/useTransactions';
import { Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

function PaymentCashingFormPopup({
	onClose,
	title,
	paymentId,
	type,
}: {
	onClose: () => void;
	title: string;
	paymentId: string;
	type: 'cash' | 'deposit';
}) {
	const methods = useForm({
		resolver: zodResolver(PaymentCashingDto),
		defaultValues: {
			id: paymentId,
			date: dayjs().toISOString(),
			agentId: '',
		},
	});

	const {
		handleSubmit,
		control,
		setValue,
		formState: { errors, isValid },
	} = methods;

	const mutation =
		type === 'cash' ? useCashPayment(onClose) : useDepositPayment(onClose);

	const onSubmit = async (data: PaymentCashingDto) => {
		await mutation.mutateAsync(data);
	};

	return (
		<ResourceFormPopup onClose={onClose} title={title}>
			<FormProvider {...methods}>
				<ResourceForm
					onSubmit={handleSubmit(onSubmit)}
					isValid={isValid}
					isLoading={mutation.isPending}
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
							<ResourcePickerField
								label='Agent'
								onChange={({ id }) => {
									setValue('agentId', id);
								}}
								resourceType='user'
								error={!!errors.agentId}
								helperText={errors.agentId?.message as string}
								required
							/>
						</Grid>
					</Grid>
				</ResourceForm>
			</FormProvider>
		</ResourceFormPopup>
	);
}

export default PaymentCashingFormPopup;
