import { TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	CreateCategoryDto,
	type CreateCategoryDtoType,
	type CategoryDtoType,
} from '../../../../shared/dtos/category.dto';
import {
	useCreateCategory,
	useUpdateCategory,
} from '../../hooks/ressources/useCategories';
import ResourceForm from './ResourceForm';

interface CategoryFormProps {
	init: CategoryDtoType | null;
	onClose: () => void;
}

export default function CategoryForm({ init, onClose }: CategoryFormProps) {
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm({
		resolver: zodResolver(CreateCategoryDto),
		defaultValues: init || undefined,
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	const createCategoryMutation = useCreateCategory(onClose);
	const updateCategoryMutation = useUpdateCategory(onClose);

	const onSubmit = async (data: CreateCategoryDtoType) => {
		if (init) {
			await updateCategoryMutation.mutateAsync({
				id: init.id,
				data,
			});
		} else {
			await createCategoryMutation.mutateAsync(data);
		}
	};

	return (
		<ResourceForm
			onSubmit={handleSubmit(onSubmit)}
			isValid={isValid}
			isLoading={
				createCategoryMutation.isPending || updateCategoryMutation.isPending
			}
		>
			<TextField
				fullWidth
				label='Nom de la catégorie'
				{...register('name')}
				error={!!errors.name}
				helperText={errors.name?.message as string}
				required
			/>
		</ResourceForm>
	);
}
