import {
	Box,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Button,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	CreateTransactionDto,
	type CreateTransactionDtoType,
	type TransactionDtoType,
} from '../../../../shared/dtos/transaction.dto';
import ResourceForm from './ResourceForm';
import { useCreateTransaction } from '../../hooks/ressources/useTransactions';
import { useUpdateTransaction } from '../../hooks/ressources/useTransactions';

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
			<TextField
				fullWidth
				label='Date'
				type='date'
				{...register('date')}
				margin='normal'
				error={!!errors.date}
				helperText={errors.date?.message as string}
				required
				InputLabelProps={{ shrink: true }}
			/>
			<FormControl fullWidth margin='normal'>
				<InputLabel>Compte</InputLabel>
				<Select
					{...register('fromId')}
					label='Compte'
					error={!!errors.fromId}
					required
					defaultValue=''
				></Select>
			</FormControl>
			<FormControl fullWidth margin='normal'>
				<InputLabel>Type</InputLabel>
				<Select
					{...register('type')}
					label='Type'
					error={!!errors.type}
					required
					defaultValue='EXPENSE'
				>
					<MenuItem value='INCOME'>Revenus</MenuItem>
					<MenuItem value='EXPENSE'>Dépenses</MenuItem>
				</Select>
			</FormControl>
			<TextField
				fullWidth
				label='Montant'
				type='number'
				{...register('amount', { valueAsNumber: true })}
				margin='normal'
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
		</ResourceForm>
	);
}
