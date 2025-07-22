import {
	Box,
	TextField,
	Button,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Typography,
	IconButton,
	Grid,
} from '@mui/material';
import {
	useForm,
	useFieldArray,
	Controller,
	useFormContext,
	FormProvider,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ResourcePickerField from '../../shared/ResourcePickerField';
import {
	CreateSaleDto,
	type CreateSaleDtoType,
	type SaleDtoType,
} from '../../../../../shared/dtos/sale.dto';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import ResourceForm from '../ResourceForm';
import {
	useCreateSale,
	useUpdateSale,
} from '../../../hooks/ressources/useSales';
import { Add, Delete } from '@mui/icons-material';
import { ORDER_STATUSES } from '../../../../../shared/constants';
import { DICT } from '../../../i18n/fr';
import { OrderItems } from './OrderItems';
import { OrderPayments } from './OrderPayments';

interface SaleFormProps {
	init: SaleDtoType | null;
	onClose: () => void;
}

export default function SaleForm({ init, onClose }: SaleFormProps) {
	const methods = useForm({
		resolver: zodResolver(CreateSaleDto),
		defaultValues: {
			date: init?.date || '',
			agentId: init?.agentId || '',
			clientId: init?.client?.id || '',
			items: init?.items || [
				{ articleId: '', articleName: '', quantity: 1, price: 0 },
			],
			payments: init?.payments || [],
			note: init?.note || '',
			status: init?.status || 'pending',
		},
	});

	const {
		register,
		handleSubmit,
		control,
		watch,
		setValue,
		formState: { errors, isValid },
	} = methods;

	const createSaleMutation = useCreateSale(onClose);
	const updateSaleMutation = useUpdateSale(onClose);

	const onSubmit = async (data: CreateSaleDtoType) => {
		if (init) {
			await updateSaleMutation.mutateAsync({
				id: init.id,
				data,
			});
		} else {
			await createSaleMutation.mutateAsync(data);
		}
	};

	return (
		<FormProvider {...methods}>
			<ResourceForm
				onSubmit={handleSubmit(onSubmit)}
				isValid={isValid}
				isLoading={createSaleMutation.isPending || updateSaleMutation.isPending}
			>
				<Grid container spacing={2} my={3}>
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
						<FormControl fullWidth>
							<InputLabel>Statut</InputLabel>
							<Select
								{...register('status')}
								label='Statut'
								error={!!errors.status}
								required
								defaultValue='pending'
							>
								{ORDER_STATUSES.map((status) => (
									<MenuItem key={status} value={status}>
										{DICT.orderStatus[status]}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Grid>
					<Grid size={6}>
						<ResourcePickerField
							label='Client'
							value={watch('clientId') || ''}
							onChange={(value) => {
								setValue('clientId', value);
							}}
							resourceType='client'
							error={!!errors.clientId}
							helperText={errors.clientId?.message as string}
							required
						/>
					</Grid>
					<Grid size={6}>
						<ResourcePickerField
							label='Agent'
							value={watch('agentId') || ''}
							onChange={(value) => {
								setValue('agentId', value);
							}}
							resourceType='user'
							error={!!errors.agentId}
							helperText={errors.agentId?.message as string}
							required
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
					<Grid size={12}>
						<TextField
							fullWidth
							label='Note'
							{...register('note')}
							variant='outlined'
							multiline
							rows={3}
							error={!!errors.note}
							helperText={errors.note?.message as string}
						/>
					</Grid>
				</Grid>

				<OrderItems />
				<OrderPayments />
			</ResourceForm>
		</FormProvider>
	);
}

