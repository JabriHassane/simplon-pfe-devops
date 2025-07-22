import { useFormContext } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';
import { Box, Typography, Button, IconButton, TextField } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import ResourcePickerField from '../../shared/ResourcePickerField';
import type { CreateOrderDtoType } from '../../../../../shared/dtos/order.dto';

export const OrderItems = () => {
	const {
		register,
		watch,
		setValue,
		formState: { errors },
		control,
	} = useFormContext<CreateOrderDtoType>();

	const { fields, remove, append } = useFieldArray({
		control,
		name: 'items',
	});

	const handleAddItem = () => {
		append({ articleId: '', articleName: '', quantity: 1, price: 0 });
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
				<Typography variant='h6'>Articles</Typography>

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
				<Box
					key={index}
					sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}
				>
					<ResourcePickerField
						label='Article'
						value={watch(`items.${index}.articleId`)}
						onChange={({ id }) => {
							setValue(`items.${index}.articleId`, id);
						}}
						resourceType='article'
						error={!!errors.items?.[index]?.articleId}
						helperText={errors.items?.[index]?.articleId?.message}
						required
					/>

					<TextField
						label='Quantité'
						type='number'
						{...register(`items.${index}.quantity`, { valueAsNumber: true })}
						sx={{ flex: 1 }}
						slotProps={{
							htmlInput: {
								min: 1,
							},
						}}
						error={!!errors.items?.[index]?.quantity}
						helperText={errors.items?.[index]?.quantity?.message}
						required
					/>

					<TextField
						label='Prix'
						type='number'
						{...register(`items.${index}.price`, { valueAsNumber: true })}
						sx={{ flex: 1 }}
						slotProps={{
							htmlInput: {
								min: 0,
							},
						}}
						error={!!errors.items?.[index]?.price}
						helperText={errors.items?.[index]?.price?.message}
						required
					/>

					<IconButton
						onClick={() => remove(index)}
						disabled={fields.length === 1}
					>
						<Delete />
					</IconButton>
				</Box>
			))}
		</>
	);
};
