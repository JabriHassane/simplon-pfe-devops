import {
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	IconButton,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useProducts, useDeleteProduct } from '../hooks/ressources/useProducts';
import ProductForm from '../components/forms/ProductForm';
import type { ProductDtoType } from '../../../shared/dtos/product.dto';
import ResourceFormPopup from '../components/shared/ResourceFormPopup';
import ResourceHeader from '../components/shared/ResourceHeader';
import ResourceLoader from '../components/shared/ResourceLoader';
import ResourceDeleteConfirmation from '../components/shared/ResourceDeleteConfirmation';
import useCrud from '../hooks/useCrud';

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

			<TableContainer>
				<Table size='small'>
					<TableHead>
						<TableRow>
							<TableCell>Nom</TableCell>
							<TableCell>Prix</TableCell>
							<TableCell>Stock</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{products?.data.map((product) => (
							<TableRow key={product.id}>
								<TableCell>{product.name}</TableCell>
								<TableCell>{product.price}</TableCell>
								<TableCell>{product.inventory}</TableCell>
								<TableCell align='right'>
									<IconButton
										onClick={() => handleOpenFormPopup(product)}
										size='small'
									>
										<EditIcon />
									</IconButton>
									<IconButton
										onClick={() => handleOpenDeletePopup(product)}
										size='small'
									>
										<DeleteIcon />
									</IconButton>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

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
