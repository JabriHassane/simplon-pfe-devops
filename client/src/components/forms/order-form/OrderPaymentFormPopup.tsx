import {
	FormControl,
	Grid,
	MenuItem,
	Select,
	InputLabel,
	TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Controller, useForm } from 'react-hook-form';
import ResourcePickerField from '../../shared/ResourcePickerField';
import {
	OrderPaymentDto,
	type OrderPaymentDtoType,
} from '../../../../../shared/dtos/order.dto';
import dayjs from 'dayjs';
import ResourceFormPopup from '../../shared/ResourceFormPopup';
import ResourceForm from '../ResourceForm';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	PAYMENT_METHODS,
	type PaymentMethod,
} from '../../../../../shared/constants';
import { DICT } from '../../../i18n/fr';
import type { AccountDtoType } from '../../../../../shared/dtos/account.dto';
import type { UserDtoType } from '../../../../../shared/dtos/user.dto';

interface Props {
	init: OrderPaymentDtoType | null;
	onClose: () => void;
	onSubmit: (data: OrderPaymentDtoType) => void;
}

function OrderPaymentFormPopup({ init, onClose, onSubmit }: Props) {
	const {
		register,
		handleSubmit,
		formState: { isValid, errors },
		control,
		setValue,
	} = useForm({
		resolver: zodResolver(OrderPaymentDto),
		defaultValues: {
			ref: init?.ref || '',
			date: init?.date || '',
			accountId: init?.account?.id,
			account: init?.account,
			agentId: init?.agent?.id,
			agent: init?.agent,
			amount: init?.amount || 0,
			paymentMethod: init?.paymentMethod as PaymentMethod,
		},
	});

	return (
		<ResourceFormPopup
			onClose={onClose}
			title={init ? `Modifier ${init.ref}` : 'Nouveau paiement'}
		>
			<ResourceForm onSubmit={handleSubmit(onSubmit)} isValid={isValid}>
				<Grid container spacing={2}>
					<Grid size={6}>
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
									sx={{ width: '100%' }}
								/>
							)}
						/>
					</Grid>

					<Grid size={6}>
						<ResourcePickerField
							label='Agent'
							value={init?.agent?.name}
							onChange={(agent) => {
								setValue('agent', agent as UserDtoType);
							}}
							resourceType='user'
							error={!!errors.agent}
							helperText={errors.agent?.message}
						/>
					</Grid>

					<Grid size={4}>
						<ResourcePickerField
							label='Compte'
							value={init?.account?.name}
							onChange={(account) => {
								setValue('account', account as AccountDtoType);
							}}
							resourceType='account'
							error={!!errors.account}
							helperText={errors.account?.message}
							required
						/>
					</Grid>

					<Grid size={4}>
						<FormControl fullWidth>
							<InputLabel>Mode de paiement</InputLabel>
							<Select
								{...register('paymentMethod')}
								label='Mode de paiement'
								error={!!errors.paymentMethod}
								required
								defaultValue={init?.paymentMethod}
							>
								{PAYMENT_METHODS.map((method) => (
									<MenuItem key={method} value={method}>
										{DICT.paymentMethods[method]}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Grid>

					<Grid size={4}>
						<TextField
							label='Montant'
							type='number'
							{...register('amount', { valueAsNumber: true })}
							slotProps={{
								htmlInput: {
									min: 1,
								},
							}}
							error={!!errors.amount}
							helperText={errors.amount?.message}
							required
							fullWidth
						/>
					</Grid>
				</Grid>
			</ResourceForm>
		</ResourceFormPopup>
	);
}

export default OrderPaymentFormPopup;
