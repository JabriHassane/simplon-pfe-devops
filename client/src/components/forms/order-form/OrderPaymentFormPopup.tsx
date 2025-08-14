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
import { TRANSACTION_METHODS } from '../../../../../shared/constants';
import { DICT } from '../../../i18n/fr';
import type { UserDto } from '../../../../../shared/dtos/user.dto';
import { TransactionDto } from '../../../../../shared/dtos/transaction.dto';
import { useContext } from 'react';
import { AuthContext } from '../../../contexts/AuthContext';
import { CreatePaymentDto } from '../../../../../shared/dtos/order.dto';
import useAutoFocus from '../../../hooks/useAutoFocus';

interface Props {
	init: TransactionDto | null;
	onClose: () => void;
	onSubmit: (data: CreatePaymentDto) => void;
	totalDue: number;
}

function PaymentFormPopup({ init, onClose, onSubmit, totalDue }: Props) {
	const [user] = useContext(AuthContext);

	const ref = useAutoFocus(!init);

	const {
		register,
		handleSubmit,
		formState: { errors },
		control,
		setValue,
	} = useForm({
		resolver: zodResolver(CreatePaymentDto),
		defaultValues: {
			ref: init?.ref,
			date: init?.date || dayjs().toISOString(),
			agentId: init?.agentId || user?.id,
			agent: init?.agent || user,
			amount: init?.amount || totalDue || undefined,
			method: init?.method || 'cash',
			cashingTransactionId: init?.cashingTransactionId,
			depositTransactionId: init?.depositTransactionId,
		},
	});

	return (
		<ResourceFormPopup
			onClose={onClose}
			title={init ? `Modifier ${init.ref || 'le paiement'}` : 'Nouveau paiement'}
		>
			<ResourceForm onSubmit={handleSubmit(onSubmit)}>
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
											required: true,
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
							init={init?.agent?.name || user?.name}
							onChange={(user) => {
								setValue('agentId', user.id);
								setValue('agent', user as UserDto);
							}}
							resourceType='user'
							error={!!errors.agentId}
							helperText={errors.agentId?.message}
							required
						/>
					</Grid>

					<Grid size={6}>
						<FormControl fullWidth required>
							<InputLabel>Méthode</InputLabel>
							<Select
								{...register('method')}
								label='Méthode'
								error={!!errors.method}
								required
								defaultValue={init?.method || 'cash'}
							>
								{TRANSACTION_METHODS.map((method) => (
									<MenuItem key={method} value={method}>
										{DICT.methods[method]}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Grid>

					<Grid size={6}>
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
							inputRef={(element) => (ref.current = element)}
						/>
					</Grid>
				</Grid>
			</ResourceForm>
		</ResourceFormPopup>
	);
}

export default PaymentFormPopup;
