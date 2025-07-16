import { useState } from 'react';
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

export default function Products() {
	const [openFormPopup, setOpenFormPopup] = useState(false);
	const [openDeletePopup, setOpenDeletePopup] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState<ProductDtoType | null>(
		null
	);

	const {
		data: products = [],
		isLoading: productsLoading,
		error: productsError,
	} = useProducts();

	const deleteProductMutation = useDeleteProduct(() => setOpenDeletePopup(false));

	const isLoading = productsLoading;
	const error = productsError;

	const handleDelete = () => {
		if (selectedProduct) {
			deleteProductMutation.mutate(selectedProduct.id);
		}
	};

	const handleOpenDeletePopup = (product: ProductDtoType) => {
		setSelectedProduct(product);
		setOpenDeletePopup(true);
	};

	const handleOpenEditPopup = (product: ProductDtoType) => {
		setSelectedProduct(product);
		setOpenFormPopup(true);
	};

	const handleOpenAddPopup = () => {
		setSelectedProduct(null);
		setOpenFormPopup(true);
	};

	const handleCloseFormPopup = () => {
		setOpenFormPopup(false);
		setSelectedProduct(null);
	};

	if (isLoading) {
		return <ResourceLoader />;
	}

	return (
		<Box>
			<ResourceHeader
				title='Produits'
				handleAdd={handleOpenAddPopup}
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
						{products.map((product) => (
							<TableRow key={product.id}>
								<TableCell>{product.name}</TableCell>
								<TableCell>{product.price}</TableCell>
								<TableCell>{product.inventory}</TableCell>
								<TableCell align='right'>
									<IconButton
										onClick={() => handleOpenEditPopup(product)}
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
					onClose={handleCloseFormPopup}
					title={selectedProduct ? 'Modifier le produit' : 'Ajouter un produit'}
				>
					<ProductForm init={selectedProduct} onClose={handleCloseFormPopup} />
				</ResourceFormPopup>
			)}

			{openDeletePopup && (
				<ResourceDeleteConfirmation
					onClose={() => setOpenDeletePopup(false)}
					title='Supprimer le produit'
					description='Voulez-vous vraiment supprimer ce produit ?'
					onDelete={handleDelete}
				/>
			)}
		</Box>
	);
}
