import { Box } from '@mui/material';
import { useArticles, useDeleteArticle } from '../hooks/ressources/useArticles';
import ArticleForm from '../components/forms/ArticleForm';
import type { ArticleDtoType } from '../../../shared/dtos/article.dto';
import ResourceFormPopup from '../components/shared/ResourceFormPopup';
import ResourceHeader from '../components/shared/ResourceHeader';
import ResourceLoader from '../components/shared/ResourceLoader';
import ResourceDeleteConfirmation from '../components/shared/ResourceDeleteConfirmation';
import useCrud from '../hooks/useCrud';
import ResourceTable from '../components/shared/ResourceTable';
import { formatPrice } from '../utils/price.utils';

export default function Articles() {
	const {
		openFormPopup,
		openDeletePopup,
		selectedResource: selectedArticle,
		handleOpenFormPopup,
		handleOpenDeletePopup,
		handleClosePopup,
	} = useCrud<ArticleDtoType>();

	const { data: articles, isLoading, error } = useArticles();
	const deleteArticleMutation = useDeleteArticle(handleClosePopup);

	const handleDelete = () => {
		if (selectedArticle) {
			deleteArticleMutation.mutate(selectedArticle.id);
		}
	};

	if (isLoading) {
		return <ResourceLoader />;
	}

	return (
		<Box>
			<ResourceHeader
				title='Articles'
				handleAdd={() => handleOpenFormPopup(null)}
				error={!!error}
			/>

			<ResourceTable
				headers={[
					{ id: 'ref', name: 'Ref' },
					{ id: 'name', name: 'Nom' },
					{ id: 'category', name: 'Catégorie' },
					{ id: 'price', name: 'Prix' },
				]}
				rows={articles?.data.map((article) => ({
					item: article,
					data: {
						ref: article.ref,
						name: article.name,
						category: article.category?.name,
						price: formatPrice(article.price),
					},
				}))}
				onEdit={handleOpenFormPopup}
				onDelete={handleOpenDeletePopup}
			/>

			{openFormPopup && (
				<ResourceFormPopup
					onClose={handleClosePopup}
					title={
						selectedArticle
							? `Modifier ${selectedArticle.ref}`
							: 'Nouvel article'
					}
				>
					<ArticleForm init={selectedArticle} onClose={handleClosePopup} />
				</ResourceFormPopup>
			)}

			{openDeletePopup && (
				<ResourceDeleteConfirmation
					onClose={handleClosePopup}
					title={`Supprimer ${selectedArticle?.ref}`}
					description='Voulez-vous vraiment supprimer cet article ?'
					onDelete={handleDelete}
				/>
			)}
		</Box>
	);
}
