import { Grid, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import ResourcePickerField from '../../shared/ResourcePickerField';
import {
	OrderItemDto,
	type OrderItemDtoType,
} from '../../../../../shared/dtos/order.dto';
import ResourceFormPopup from '../../shared/ResourceFormPopup';
import ResourceForm from '../ResourceForm';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ArticleDtoType } from '../../../../../shared/dtos/article.dto';

interface Props {
	init: OrderItemDtoType | null;
	onClose: () => void;
	onSubmit: (data: OrderItemDtoType) => void;
}

function OrderItemFormPopup({ init, onClose, onSubmit }: Props) {
	const {
		register,
		handleSubmit,
		formState: { isValid, errors },
		setValue,
	} = useForm({
		resolver: zodResolver(OrderItemDto),
		defaultValues: {
			articleId: init?.article?.id,
			article: init?.article,
			articleName: init?.article?.name,
			quantity: init?.quantity,
			price: init?.price,
		},
	});

	console.log(errors);

	return (
		<ResourceFormPopup
			onClose={onClose}
			title={
				init
					? `Modifier ${init.article?.name || init.articleName}`
					: 'Nouvel article'
			}
		>
			<ResourceForm onSubmit={handleSubmit(onSubmit)} isValid={isValid}>
				<Grid container spacing={2}>
					<Grid size={12}>
						<ResourcePickerField
							label='Article'
							value={init?.article?.name}
							onChange={(article) => {
								setValue('article', article as ArticleDtoType);
							}}
							resourceType='article'
							error={!!errors.article}
							helperText={errors.article?.message}
						/>
					</Grid>

					<Grid size={6}>
						<TextField
							label='Quantité'
							type='number'
							{...register('quantity', { valueAsNumber: true })}
							slotProps={{
								htmlInput: {
									min: 1,
								},
							}}
							error={!!errors.quantity}
							helperText={errors.quantity?.message}
							fullWidth
						/>
					</Grid>

					<Grid size={6}>
						<TextField
							label='Prix'
							type='number'
							{...register('price', { valueAsNumber: true })}
							slotProps={{
								htmlInput: {
									min: 1,
								},
							}}
							error={!!errors.price}
							helperText={errors.price?.message}
							fullWidth
						/>
					</Grid>
				</Grid>
			</ResourceForm>
		</ResourceFormPopup>
	);
}

export default OrderItemFormPopup;
