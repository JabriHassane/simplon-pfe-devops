import { Controller, useFormContext } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';
import {
	Box,
	Typography,
	Button,
	IconButton,
	TextField,
	Grid,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import ResourcePickerField from '../../shared/ResourcePickerField';
import type { CreateOrderDtoType } from '../../../../../shared/dtos/order.dto';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

export const OrderPayments = () => {
	const {
		register,
		watch,
		setValue,
		formState: { errors },
		control,
	} = useFormContext<CreateOrderDtoType>();

	const { fields, remove, append } = useFieldArray({
		control,
		name: 'payments',
	});

	const handleAddItem = () => {
		append({ date: '', amount: 0, accountId: '' });
	};

	return (
		<>
			<Box
				display='flex'
				gap={2}
				alignItems='center'
				justifyContent='space-between'
				mb={2}
			>
				<Typography variant='h6'>Paiements</Typography>

				<Button
					onClick={handleAddItem}
					variant='contained'
					disableElevation
					startIcon={<Add />}
				>
					Ajouter
				</Button>
			</Box>

			{fields.map((_, index) => (
				<Grid key={index} container>
					<Grid size={4}>
						<Controller
							name={`payments.${index}.date`}
							control={control}
							render={({ field }) => (
								<DatePicker
									label='Date'
									value={dayjs(field.value)}
									onChange={(date) => field.onChange(date?.toISOString())}
									slotProps={{
										textField: {
											error: !!errors.payments?.[index]?.date,
											helperText: errors.payments?.[index]?.date
												?.message as string,
										},
									}}
								/>
							)}
						/>
					</Grid>

					<Grid size={4}>
						<ResourcePickerField
							label='Compte'
							value={watch(`payments.${index}.accountId`) || ''}
							onChange={(value) => {
								setValue(`payments.${index}.accountId`, value);
							}}
							resourceType='account'
							error={!!errors.payments?.[index]?.accountId}
							helperText={errors.payments?.[index]?.accountId?.message}
							required
						/>
					</Grid>

					<Grid size={4}>
						<TextField
							label='Montant'
							type='number'
							{...register(`payments.${index}.amount`, { valueAsNumber: true })}
							slotProps={{
								htmlInput: {
									min: 1,
								},
							}}
							error={!!errors.payments?.[index]?.amount}
							helperText={errors.payments?.[index]?.amount?.message}
							required
						/>
					</Grid>

					<IconButton
						onClick={() => remove(index)}
						disabled={fields.length === 1}
					>
						<Delete />
					</IconButton>
				</Grid>
			))}
		</>
	);
};
