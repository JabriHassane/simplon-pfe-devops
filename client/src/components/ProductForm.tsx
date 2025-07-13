import {
	Box,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	CreateProductDto,
	type CreateProductDtoType,
	type ProductDtoType,
} from '../../../shared/dtos/product.dto';
import { useProductCategories } from '../hooks/ressources/useProductCategories';
import ResourceForm from './ResourceForm';
import {
	useCreateProduct,
	useUpdateProduct,
} from '../hooks/ressources/useProducts';

interface Props {
	init: ProductDtoType | null;
	onClose: () => void;
}

export default function ProductForm({ init, onClose }: Props) {
	const { data: categories = [] } = useProductCategories();

	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm({
		resolver: zodResolver(CreateProductDto),
		defaultValues: init || undefined,
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	const createProductMutation = useCreateProduct(onClose);
	const updateProductMutation = useUpdateProduct(onClose);

	const onSubmit = async (data: CreateProductDtoType) => {
		if (init) {
			await updateProductMutation.mutateAsync({
				id: init.id,
				data,
			});
		} else {
			await createProductMutation.mutateAsync(data);
		}
	};

	return (
		<ResourceForm
			onSubmit={handleSubmit(onSubmit)}
			isValid={isValid}
			isLoading={
				createProductMutation.isPending || updateProductMutation.isPending
			}
		>
			<TextField
				fullWidth
				label='Nom du produit'
				{...register('name')}
				margin='normal'
				variant='outlined'
				error={!!errors.name}
				helperText={errors.name?.message as string}
				required
			/>

			<TextField
				fullWidth
				label='Prix'
				type='number'
				{...register('price', { valueAsNumber: true })}
				margin='normal'
				variant='outlined'
				error={!!errors.price}
				helperText={errors.price?.message as string}
				required
			/>

			<TextField
				fullWidth
				label='Inventaire'
				type='number'
				{...register('inventory', { valueAsNumber: true })}
				margin='normal'
				variant='outlined'
				error={!!errors.inventory}
				helperText={errors.inventory?.message as string}
				required
			/>

			<TextField
				fullWidth
				label="URL de l'image (optionnel)"
				{...register('image')}
				margin='normal'
				variant='outlined'
				error={!!errors.image}
				helperText={errors.image?.message as string}
			/>

			{categories.length > 0 ? (
				<FormControl fullWidth margin='normal'>
					<InputLabel>Catégorie</InputLabel>
					<Select
						{...register('categoryId')}
						label='Catégorie'
						error={!!errors.categoryId}
						required
					>
						{categories.map((category) => (
							<MenuItem key={category.id} value={category.id}>
								{category.name}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			) : (
				<TextField
					fullWidth
					label='ID de la catégorie'
					{...register('categoryId')}
					margin='normal'
					variant='outlined'
					error={!!errors.categoryId}
					helperText={errors.categoryId?.message as string}
					required
				/>
			)}
		</ResourceForm>
	);
}
