import {
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Grid,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	CreateTransactionDto,
	UpdateTransactionDto,
	type TransactionDto,
} from '../../../../shared/dtos/transaction.dto';
import ResourceForm from './ResourceForm';
import { useCreateTransaction } from '../../hooks/ressources/useTransactions';
import { useUpdateTransaction } from '../../hooks/ressources/useTransactions';
import { OPERATION_TYPES, TRANSFER_ACTORS } from '../../../../shared/constants';
import { DICT } from '../../i18n/fr';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ResourcePickerField from '../shared/ResourcePickerField';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import useAutoFocus from '../../hooks/useAutoFocus';

interface TransactionFormProps {
	init: TransactionDto | null;
	onClose: () => void;
	transferType?: 'cash' | 'deposit' | null;
}

export default function TransactionForm({
	init,
	onClose,
	transferType,
}: TransactionFormProps) {
	const [user] = useContext(AuthContext);

	const ref = useAutoFocus(!init);

	const {
		register,
		handleSubmit,
		control,
		setValue,
		watch,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(CreateTransactionDto),
		defaultValues: {
			date: init?.date || dayjs().toISOString(),
			agentId: init?.agentId || user?.id,
			amount: init?.amount,
			type: init?.type || 'receive',
			method: init?.method || 'cash',
			transferActor: init?.transferActor,
		},
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	const createTransactionMutation = useCreateTransaction(onClose);
	const updateTransactionMutation = useUpdateTransaction(onClose);

	const onSubmit = async (data: CreateTransactionDto) => {
		if (init) {
			await updateTransactionMutation.mutateAsync({
				id: init.id,
				data: data as UpdateTransactionDto,
			});
		} else {
			await createTransactionMutation.mutateAsync(data as CreateTransactionDto);
		}
	};

	const type = watch('type');

	return (
		<ResourceForm
			onSubmit={handleSubmit(onSubmit)}
			isLoading={
				createTransactionMutation.isPending ||
				updateTransactionMutation.isPending
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

				{!transferType && (
					<>
						<Grid size={4}>
							<FormControl fullWidth required>
								<InputLabel>Type</InputLabel>
								<Select
									{...register('type')}
									label='Type'
									error={!!errors.type}
									defaultValue='receive'
								>
									{OPERATION_TYPES.map((type) => (
										<MenuItem key={type} value={type}>
											{DICT.transactionType[type]}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>

						<Grid size={4}>
							<FormControl fullWidth required>
								<InputLabel>{type === 'send' ? 'Vers' : 'Depuis'}</InputLabel>
								<Select
									{...register('transferActor')}
									label={type === 'send' ? 'Vers' : 'Depuis'}
									error={!!errors.transferActor}
									defaultValue='Nabil'
								>
									{TRANSFER_ACTORS.map((actor) => (
										<MenuItem key={actor} value={actor}>
											{actor}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>

						<Grid size={4}>
							<TextField
								fullWidth
								label='Montant'
								type='number'
								{...register('amount', { valueAsNumber: true })}
								error={!!errors.amount}
								helperText={errors.amount?.message as string}
								required
								inputRef={(element: any) => (ref.current = element)}
								slotProps={{
									htmlInput: {
										min: 0,
										step: 1,
									},
								}}
							/>
						</Grid>
					</>
				)}
			</Grid>
		</ResourceForm>
	);
}
