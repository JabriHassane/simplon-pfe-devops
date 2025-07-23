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
	type CreateTransactionDtoType,
	type TransactionDtoType,
} from '../../../../shared/dtos/transaction.dto';
import ResourceForm from './ResourceForm';
import { useCreateTransaction } from '../../hooks/ressources/useTransactions';
import { useUpdateTransaction } from '../../hooks/ressources/useTransactions';
import { OPERATION_TYPES } from '../../../../shared/constants';
import { DICT } from '../../i18n/fr';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

interface TransactionFormProps {
	init: TransactionDtoType | null;
	onClose: () => void;
}

export default function TransactionForm({
	init,
	onClose,
}: TransactionFormProps) {
	const {
		register,
		handleSubmit,
		control,
		formState: { errors, isValid },
	} = useForm({
		resolver: zodResolver(CreateTransactionDto),
		defaultValues: init || undefined,
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	const createTransactionMutation = useCreateTransaction(onClose);
	const updateTransactionMutation = useUpdateTransaction(onClose);

	const onSubmit = async (data: CreateTransactionDtoType) => {
		if (init) {
			await updateTransactionMutation.mutateAsync({
				id: init.id,
				data,
			});
		} else {
			await createTransactionMutation.mutateAsync(data);
		}
	};

	return (
		<ResourceForm
			onSubmit={handleSubmit(onSubmit)}
			isValid={isValid}
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
					<FormControl fullWidth required>
						<InputLabel>Type</InputLabel>
						<Select
							{...register('type')}
							label='Type'
							error={!!errors.type}
							defaultValue='cashing'
						>
							{OPERATION_TYPES.map((type) => (
								<MenuItem key={type} value={type}>
									{DICT.transactionType[type]}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Grid>

				<Grid size={6}>
					<TextField
						fullWidth
						label='Montant'
						type='number'
						{...register('amount', { valueAsNumber: true })}
						error={!!errors.amount}
						helperText={errors.amount?.message as string}
						required
						slotProps={{
							htmlInput: {
								min: 0,
								step: 1,
							},
						}}
					/>
				</Grid>
			</Grid>
		</ResourceForm>
	);
}
