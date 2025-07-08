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
import { CreateTransactionDto } from '../utils/validation';

interface TransactionFormProps {
	onSubmit: (data: any) => void;
	onCancel?: () => void;
	initialData?: any;
	accounts: Array<{ id: string; name: string }>;
	isLoading?: boolean;
}

export default function TransactionForm({
	onSubmit,
	onCancel,
	initialData,
	accounts,
	isLoading = false,
}: TransactionFormProps) {
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm({
		resolver: zodResolver(CreateTransactionDto.shape.body),
		defaultValues: initialData || {
			accountId: '',
			type: 'EXPENSE',
			amount: 0,
			description: '',
			reference: '',
			date: new Date().toISOString().split('T')[0],
		},
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
					{...register('accountId')}
					label='Account'
					error={!!errors.accountId}
					required
					defaultValue=''
				>
					{accounts.map((account) => (
						<MenuItem key={account.id} value={account.id}>
							{account.name}
						</MenuItem>
					))}
				</Select>
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
				label='Description'
				{...register('description')}
				margin='normal'
				error={!!errors.description}
				helperText={errors.description?.message as string}
				required
			/>
			<TextField
				fullWidth
				label='Reference'
				{...register('reference')}
				margin='normal'
				error={!!errors.reference}
				helperText={errors.reference?.message as string}
			/>
			<TextField
				fullWidth
				label='Amount'
				type='number'
				{...register('amount', { valueAsNumber: true })}
				margin='normal'
				error={!!errors.amount}
				helperText={errors.amount?.message as string}
				required
				inputProps={{ min: 0, step: 0.01 }}
			/>

			<Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
				{onCancel && (
					<Button
						variant='outlined'
						onClick={onCancel}
						fullWidth
						size='large'
						disabled={isLoading}
					>
						Cancel
					</Button>
				)}
				<Button
					type='submit'
					variant='contained'
					disabled={isLoading || !isValid}
					fullWidth
					size='large'
				>
					{isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'}
				</Button>
			</Box>
		</Box>
	);
}
