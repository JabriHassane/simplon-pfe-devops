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
} from '../../../shared/dtos/transaction.dto';

interface TransactionFormProps {
	onSubmit: (data: any) => void;
	init: CreateTransactionDtoType | null;
	isLoading?: boolean;
}

export default function TransactionForm({
	onSubmit,
	init,
	isLoading = false,
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

	return (
		<Box component='form' onSubmit={handleSubmit(onSubmit)}>
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
				<InputLabel>Account</InputLabel>
				<Select
					{...register('fromId')}
					label='Account'
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
					<MenuItem value='INCOME'>Income</MenuItem>
					<MenuItem value='EXPENSE'>Expense</MenuItem>
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

			<Button
				type='submit'
				variant='contained'
				disabled={isLoading || !isValid}
				fullWidth
				size='large'
			>
				{isLoading ? 'Saving...' : init ? 'Update' : 'Create'}
			</Button>
		</Box>
	);
}
