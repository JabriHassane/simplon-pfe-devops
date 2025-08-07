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
import dayjs from 'dayjs';
import ResourceFormPopup from '../../shared/ResourceFormPopup';
import ResourceForm from '../ResourceForm';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	TRANSACTION_METHODS,
	type TransactionMethod,
} from '../../../../../shared/constants';
import { DICT } from '../../../i18n/fr';
import type { UserDto } from '../../../../../shared/dtos/user.dto';
import { TransactionDto } from '../../../../../shared/dtos/transaction.dto';

interface Props {
	init: TransactionDto | null;
	onClose: () => void;
	onSubmit: (data: TransactionDto) => void;
}

function PaymentFormPopup({ init, onClose, onSubmit }: Props) {
	const {
		register,
		handleSubmit,
		formState: { isValid, errors },
		control,
		setValue,
	} = useForm({
		resolver: zodResolver(TransactionDto),
		defaultValues: {
			date: init?.date || '',
			agentId: init?.agent?.id,
			agent: init?.agent,
			amount: init?.amount || 0,
			method: init?.method as TransactionMethod,
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
							init={init?.agent?.name}
							onChange={(agent) => {
								setValue('agent', agent as UserDto);
							}}
							resourceType='user'
							error={!!errors.agent}
							helperText={errors.agent?.message}
						/>
					</Grid>

					<Grid size={4}>
						<FormControl fullWidth>
							<InputLabel>Mode de paiement</InputLabel>
							<Select
								{...register('method')}
								label='Mode de paiement'
								error={!!errors.method}
								required
								defaultValue={init?.method}
							>
								{TRANSACTION_METHODS.map((method) => (
									<MenuItem key={method} value={method}>
										{DICT.methods[method]}
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

export default PaymentFormPopup;
