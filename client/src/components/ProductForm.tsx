import {
	Box,
	TextField,
	Button,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateProductDto } from '../utils/validation';

interface ProductCategory {
	id: string;
	name: string;
	description: string;
}

interface ProductFormProps {
	onSubmit: (data: any) => void;
	onCancel?: () => void;
	initialData?: {
		name: string;
		price: number;
		categoryId: string;
		inventory: number;
		image?: string;
	} | null;
	categories?: ProductCategory[];
	isLoading?: boolean;
}

export default function ProductForm({
	onSubmit,
	onCancel,
	initialData,
	categories = [],
	isLoading = false,
}: ProductFormProps) {
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm({
		resolver: zodResolver(CreateProductDto.shape.body),
		defaultValues: initialData || {
			name: '',
			price: 0,
			categoryId: '',
			inventory: 0,
		},
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	return (
		<Box component='form' onSubmit={handleSubmit(onSubmit)}>
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

			<Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
				{onCancel && (
					<Button
						type='button'
						variant='outlined'
						size='large'
						onClick={onCancel}
						fullWidth
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
					{isLoading ? 'Enregistrement...' : initialData ? 'Modifier' : 'Créer'}
				</Button>
			</Box>
		</Box>
	);
}
