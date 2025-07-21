import { Box } from '@mui/material';
import {
	useCategories,
	useDeleteCategory,
} from '../hooks/ressources/useCategories';
import type { CategoryDtoType } from '../../../shared/dtos/category.dto';
import ResourceFormPopup from '../components/shared/ResourceFormPopup';
import ResourceHeader from '../components/shared/ResourceHeader';
import ResourceLoader from '../components/shared/ResourceLoader';
import ResourceDeleteConfirmation from '../components/shared/ResourceDeleteConfirmation';
import useCrud from '../hooks/useCrud';
import ResourceTable from '../components/shared/ResourceTable';
import CategoryForm from '../components/forms/CategoryForm';

export default function Categories() {
	const {
		openFormPopup,
		openDeletePopup,
		selectedResource: selectedCategory,
		handleOpenFormPopup,
		handleOpenDeletePopup,
		handleClosePopup,
	} = useCrud<CategoryDtoType>();

	const { data: categories, isLoading, error } = useCategories();
	const deleteCategoryMutation = useDeleteCategory(handleClosePopup);

	const handleDelete = () => {
		if (selectedCategory) {
			deleteCategoryMutation.mutate(selectedCategory.id);
		}
	};

	if (isLoading) {
		return <ResourceLoader />;
	}

	return (
		<Box>
			<ResourceHeader
				title='Catégories'
				handleAdd={() => handleOpenFormPopup(null)}
				error={!!error}
			/>

			<ResourceTable
				headers={[
					{ id: 'ref', name: 'Ref' },
					{ id: 'name', name: 'Nom' },
				]}
				rows={categories?.data.map((category) => ({
					item: category,
					data: {
						ref: category.ref,
						name: category.name,
					},
				}))}
				onEdit={handleOpenFormPopup}
				onDelete={handleOpenDeletePopup}
			/>

			{openFormPopup && (
				<ResourceFormPopup
					onClose={handleClosePopup}
					title={
						selectedCategory
							? `Modifier ${selectedCategory.ref}`
							: 'Nouvelle catégorie'
					}
				>
					<CategoryForm init={selectedCategory} onClose={handleClosePopup} />
				</ResourceFormPopup>
			)}

			{openDeletePopup && (
				<ResourceDeleteConfirmation
					onClose={handleClosePopup}
					title={`Supprimer ${selectedCategory?.ref}`}
					description='Voulez-vous vraiment supprimer cette catégorie ?'
					onDelete={handleDelete}
				/>
			)}
		</Box>
	);
}
