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
	CreateArticleDto,
	type CreateArticleDtoType,
	type ArticleDtoType,
} from '../../../../shared/dtos/article.dto';
import { useCategories } from '../../hooks/ressources/useCategories';
import ResourceForm from './ResourceForm';
import {
	useCreateArticle,
	useUpdateArticle,
} from '../../hooks/ressources/useArticles';
import ResourcePickerField from '../shared/ResourcePickerField';

interface Props {
	init: ArticleDtoType | null;
	onClose: () => void;
}

export default function ArticleForm({ init, onClose }: Props) {
	const { data: categories } = useCategories();

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors, isValid },
	} = useForm({
		resolver: zodResolver(CreateArticleDto),
		defaultValues: init || undefined,
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	const createArticleMutation = useCreateArticle(onClose);
	const updateArticleMutation = useUpdateArticle(onClose);

	const onSubmit = async (data: CreateArticleDtoType) => {
		if (init) {
			await updateArticleMutation.mutateAsync({
				id: init.id,
				data,
			});
		} else {
			await createArticleMutation.mutateAsync(data);
		}
	};

	return (
		<ResourceForm
			onSubmit={handleSubmit(onSubmit)}
			isValid={isValid}
			isLoading={
				createArticleMutation.isPending || updateArticleMutation.isPending
			}
		>
			<TextField
				fullWidth
				label='Nom du article'
				{...register('name')}
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
				variant='outlined'
				error={!!errors.inventory}
				helperText={errors.inventory?.message as string}
				required
			/>

			<TextField
				fullWidth
				label="URL de l'image (optionnel)"
				{...register('image')}
				variant='outlined'
				error={!!errors.image}
				helperText={errors.image?.message as string}
			/>

			<ResourcePickerField
				label='Catégorie'
				value={watch(`categoryId`) || ''}
				onChange={(value) => {
					setValue(`categoryId`, value);
				}}
				resourceType='category'
				error={!!errors.categoryId}
				helperText={errors.categoryId?.message as string}
				required
			/>
		</ResourceForm>
	);
}
