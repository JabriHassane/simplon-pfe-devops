import {
	Box
} from '@mui/material';
import { useProducts, useDeleteProduct } from '../hooks/ressources/useProducts';
import ProductForm from '../components/forms/ProductForm';
import type { ProductDtoType } from '../../../shared/dtos/product.dto';
import ResourceFormPopup from '../components/shared/ResourceFormPopup';
import ResourceHeader from '../components/shared/ResourceHeader';
import ResourceLoader from '../components/shared/ResourceLoader';
import ResourceDeleteConfirmation from '../components/shared/ResourceDeleteConfirmation';
import useCrud from '../hooks/useCrud';
import ResourceTable from '../components/shared/ResourceTable';

export default function Products() {
	const {
		openFormPopup,
		openDeletePopup,
		selectedResource: selectedProduct,
		handleOpenFormPopup,
		handleOpenDeletePopup,
		handleClosePopup,
	} = useCrud<ProductDtoType>();

	const { data: products, isLoading, error } = useProducts();
	const deleteProductMutation = useDeleteProduct(handleClosePopup);

	const handleDelete = () => {
		if (selectedProduct) {
			deleteProductMutation.mutate(selectedProduct.id);
		}
	};

	if (isLoading) {
		return <ResourceLoader />;
	}

	return (
		<Box>
			<ResourceHeader
				title='Produits'
				handleAdd={() => handleOpenFormPopup(null)}
				error={!!error}
			/>

			<ResourceTable
				headers={[
					{ id: 'ref', name: 'Ref' },
					{ id: 'name', name: 'Nom' },
					{ id: 'price', name: 'Prix' },
					{ id: 'inventory', name: 'Stock' },
				]}
				rows={products?.data.map((product) => ({
					item: product,
					data: {
						ref: product.ref,
						name: product.name,
						price: product.price,
						inventory: product.inventory,
					},
				}))}
				onEdit={handleOpenFormPopup}
				onDelete={handleOpenDeletePopup}
			/>

			{openFormPopup && (
				<ResourceFormPopup
					onClose={handleClosePopup}
					title={selectedProduct ? 'Modifier le produit' : 'Ajouter un produit'}
				>
					<ProductForm init={selectedProduct} onClose={handleClosePopup} />
				</ResourceFormPopup>
			)}

			{openDeletePopup && (
				<ResourceDeleteConfirmation
					onClose={handleClosePopup}
					title='Supprimer le produit'
					description='Voulez-vous vraiment supprimer ce produit ?'
					onDelete={handleDelete}
				/>
			)}
		</Box>
	);
}
