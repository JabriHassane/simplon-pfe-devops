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
	Dialog,
	DialogTitle,
	DialogContent,
	Alert,
	CircularProgress,
} from '@mui/material';
import {
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
} from '@mui/icons-material';
import {
	useProducts,
	useCreateProduct,
	useUpdateProduct,
	useDeleteProduct,
} from '../hooks/ressources/useProducts';
import ProductForm from '../components/ProductForm';
import type {
	CreateProductDtoType,
	ProductDtoType,
} from '../../../shared/dtos/product.dto';

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

	const createProductMutation = useCreateProduct();
	const updateProductMutation = useUpdateProduct(() => setOpenDialog(false));
	const deleteProductMutation = useDeleteProduct();

	const isLoading = productsLoading;
	const error = productsError;

	const handleSubmit = async (data: CreateProductDtoType) => {
		if (selectedProduct) {
			await updateProductMutation.mutateAsync({
				id: selectedProduct.id,
				data,
			});
		} else {
			await createProductMutation.mutateAsync(data);
		}
	};

	const handleDelete = async (id: string) => {
		if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
			await deleteProductMutation.mutateAsync(id);
		}
	};

	const handleEdit = (product: ProductDtoType) => {
		setSelectedProduct(product);
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

			{(createProductMutation.error ||
				updateProductMutation.error ||
				deleteProductMutation.error) && (
				<Alert severity='error' sx={{ mb: 2 }}>
					{createProductMutation.error?.message ||
						updateProductMutation.error?.message ||
						deleteProductMutation.error?.message ||
						'Une erreur est survenue'}
				</Alert>
			)}

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
								<TableCell>
									<IconButton onClick={() => handleEdit(product)} size='small'>
										<EditIcon />
									</IconButton>
									<IconButton
										onClick={() => handleDelete(product.id)}
										size='small'
										color='error'
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

			<Dialog
				open={openDialog}
				onClose={handleCloseDialog}
				maxWidth='sm'
				fullWidth
			>
				<DialogTitle>
					<Typography variant='h6' sx={{ fontWeight: 600 }}>
						{selectedProduct ? 'Modifier le produit' : 'Ajouter un produit'}
					</Typography>
				</DialogTitle>

				<DialogContent sx={{ p: 0 }}>
					<ProductForm
						init={selectedProduct}
						onSubmit={handleSubmit}
						isLoading={
							createProductMutation.isPending || updateProductMutation.isPending
						}
					/>
				</DialogContent>
			</Dialog>
		</Box>
	);
}
