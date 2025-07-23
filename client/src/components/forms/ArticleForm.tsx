import { Grid, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	CreateArticleDto,
	type CreateArticleDtoType,
	type ArticleDtoType,
} from '../../../../shared/dtos/article.dto';
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
	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors, isValid },
	} = useForm({
		resolver: zodResolver(CreateArticleDto),
		defaultValues: {
			name: init?.name || '',
			price: init?.price || 0,
			image: init?.image || '',
			categoryId: init?.categoryId || '',
		},
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
			<Grid container spacing={2}>
				<Grid size={6}>
					<TextField
						fullWidth
						label="Nom de l'article"
						{...register('name')}
						variant='outlined'
						error={!!errors.name}
						helperText={errors.name?.message as string}
						required
					/>
				</Grid>

				<Grid size={6}>
					<ResourcePickerField
						label='Catégorie'
						value={init?.category?.name}
						onChange={({ id }) => {
							setValue(`categoryId`, id);
						}}
						resourceType='category'
						error={!!errors.categoryId}
						helperText={errors.categoryId?.message as string}
					/>
				</Grid>

				<Grid size={6}>
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
				</Grid>

				<Grid size={6}>
					<TextField
						fullWidth
						label="URL de l'image (optionnel)"
						{...register('image')}
						variant='outlined'
						error={!!errors.image}
						helperText={errors.image?.message as string}
					/>
				</Grid>
			</Grid>
		</ResourceForm>
	);
}
