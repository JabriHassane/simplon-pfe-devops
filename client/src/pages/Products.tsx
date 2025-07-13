import { useState } from 'react';
import {
	Typography,
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Button,
	IconButton,
	Alert,
	CircularProgress,
} from '@mui/material';
import {
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
} from '@mui/icons-material';
import { useProducts, useDeleteProduct } from '../hooks/ressources/useProducts';
import ProductForm from '../components/ProductForm';
import type { ProductDtoType } from '../../../shared/dtos/product.dto';
import ResourceFormPopup from '../components/ResourceFormPopup';

export default function Products() {
	const [openDialog, setOpenDialog] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState<ProductDtoType | null>(
		null
	);

	// TanStack Query hooks
	const {
		data: products = [],
		isLoading: productsLoading,
		error: productsError,
	} = useProducts();

	const deleteProductMutation = useDeleteProduct();

	const isLoading = productsLoading;
	const error = productsError;

	const handleDelete = async (id: string) => {
		if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
			await deleteProductMutation.mutateAsync(id);
		}
	};

	const handleEdit = (product: ProductDtoType) => {
		setSelectedProduct(product);
		setOpenDialog(true);
	};

	const handleAdd = () => {
		setSelectedProduct(null);
		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setSelectedProduct(null);
	};

	if (isLoading) {
		return (
			<Box
				display='flex'
				justifyContent='center'
				alignItems='center'
				minHeight='400px'
			>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box>
			<Box
				display='flex'
				justifyContent='space-between'
				alignItems='center'
				mb={3}
			>
				<Typography variant='h4'>Produits</Typography>
				<Button
					variant='contained'
					startIcon={<AddIcon />}
					onClick={handleAdd}
					disableElevation
				>
					Ajouter un produit
				</Button>
			</Box>

			{error && (
				<Alert severity='error' sx={{ mb: 2 }}>
					Erreur lors de la récupération des produits
				</Alert>
			)}

			<TableContainer>
				<Table size='small'>
					<TableHead>
						<TableRow>
							<TableCell>Nom</TableCell>
							<TableCell>Prix</TableCell>
							<TableCell>Stock</TableCell>
							<TableCell>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{products.map((product) => (
							<TableRow key={product.id}>
								<TableCell>{product.name}</TableCell>
								<TableCell>{product.price}</TableCell>
								<TableCell>{product.inventory}</TableCell>
								<TableCell align='right'>
									<IconButton onClick={() => handleEdit(product)} size='small'>
										<EditIcon />
									</IconButton>
									<IconButton
										onClick={() => handleDelete(product.id)}
										size='small'
										disabled={deleteProductMutation.isPending}
									>
										{deleteProductMutation.isPending ? (
											<CircularProgress size={20} />
										) : (
											<DeleteIcon />
										)}
									</IconButton>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<ResourceFormPopup
				open={openDialog}
				onClose={handleCloseDialog}
				title={selectedProduct ? 'Modifier le produit' : 'Ajouter un produit'}
			>
				<ProductForm init={selectedProduct} onClose={handleCloseDialog} />
			</ResourceFormPopup>
		</Box>
	);
}
