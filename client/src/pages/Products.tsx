import React, { useState } from 'react';
import {
	Typography,
	Box,
	Paper,
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
	type Product,
} from '../hooks/useProducts';
import {
	useProductCategories,
	type ProductCategory,
} from '../hooks/useProductCategories';
import ProductForm from '../components/ProductForm';

export default function Products() {
	const [openDialog, setOpenDialog] = useState(false);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);

	// TanStack Query hooks
	const {
		data: products = [],
		isLoading: productsLoading,
		error: productsError,
	} = useProducts();
	const {
		data: categories = [],
		isLoading: categoriesLoading,
		error: categoriesError,
	} = useProductCategories();
	const createProductMutation = useCreateProduct();
	const updateProductMutation = useUpdateProduct();
	const deleteProductMutation = useDeleteProduct();

	const isLoading = productsLoading || categoriesLoading;
	const error = productsError || categoriesError;

	const handleSubmit = async (data: any) => {
		try {
			if (editingProduct) {
				await updateProductMutation.mutateAsync({
					id: editingProduct.id,
					data,
				});
			} else {
				await createProductMutation.mutateAsync(data);
			}
			setOpenDialog(false);
			setEditingProduct(null);
		} catch (err) {
			console.error('Error saving product:', err);
		}
	};

	const handleDelete = async (id: string) => {
		if (window.confirm('Are you sure you want to delete this product?')) {
			try {
				await deleteProductMutation.mutateAsync(id);
			} catch (err) {
				console.error('Error deleting product:', err);
			}
		}
	};

	const handleEdit = (product: Product) => {
		setEditingProduct(product);
		setOpenDialog(true);
	};

	const handleAdd = () => {
		setEditingProduct(null);
		setOpenDialog(true);
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(amount);
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

	const headers = [
		'Nom du produit',
		'SKU',
		'Catégorie',
		'Prix',
		'Coût',
		'Stock',
		'Statut',
		'Actions',
	];

	return (
		<Box>
			<Box
				display='flex'
				justifyContent='space-between'
				alignItems='center'
				mb={3}
			>
				<Typography variant='h4'>Produits</Typography>
				<Button variant='contained' startIcon={<AddIcon />} onClick={handleAdd}>
					Ajouter
				</Button>
			</Box>

			{error && (
				<Alert severity='error' sx={{ mb: 2 }}>
					Failed to fetch data
				</Alert>
			)}

			{(createProductMutation.error ||
				updateProductMutation.error ||
				deleteProductMutation.error) && (
				<Alert severity='error' sx={{ mb: 2 }}>
					{createProductMutation.error?.message ||
						updateProductMutation.error?.message ||
						deleteProductMutation.error?.message ||
						'An error occurred'}
				</Alert>
			)}

			<TableContainer>
				<Table size='small'>
					<TableHead>
						<TableRow>
							{headers.map((header, i) => (
								<TableCell
									align={i === 0 ? 'left' : 'right'}
									key={i}
									sx={{ fontWeight: 600 }}
								>
									{header}
								</TableCell>
							))}
						</TableRow>
					</TableHead>

					<TableBody>
						{products.map((product) => (
							<TableRow key={product.id}>
								<TableCell>
									<Box>
										<Typography variant='subtitle2'>
											{product.name}
										</Typography>
										<Typography variant='caption' color='textSecondary'>
											{product.description}
										</Typography>
									</Box>
								</TableCell>
								<TableCell align='right'>{product.sku}</TableCell>
								<TableCell align='right'>
									{product.category?.name || 'N/A'}
								</TableCell>
								<TableCell align='right'>
									{formatCurrency(product.price)}
								</TableCell>
								<TableCell align='right'>
									{formatCurrency(product.cost)}
								</TableCell>
								<TableCell align='right'>{product.stockQuantity}</TableCell>
								<TableCell align='right'>
									<Box
										sx={{
											px: 1,
											py: 0.5,
											borderRadius: 1,
											backgroundColor:
												product.status === 'ACTIVE'
													? 'success.light'
													: 'error.light',
											color:
												product.status === 'ACTIVE'
													? 'success.dark'
													: 'error.dark',
											display: 'inline-block',
										}}
									>
										{product.status}
									</Box>
								</TableCell>
								<TableCell align='right'>
									<IconButton
										onClick={() => handleEdit(product)}
										size='small'
									>
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
				onClose={() => setOpenDialog(false)}
				maxWidth='md'
				fullWidth
			>
				<DialogTitle>
					{editingProduct ? 'Edit Product' : 'Add New Product'}
				</DialogTitle>
				<DialogContent>
					<ProductForm
						initialData={
							editingProduct
								? {
										name: editingProduct.name,
										price: editingProduct.price,
										categoryId: editingProduct.categoryId,
										inventory: editingProduct.stockQuantity,
								  }
								: undefined
						}
						categories={categories}
						onSubmit={handleSubmit}
						onCancel={() => setOpenDialog(false)}
						isLoading={
							createProductMutation.isPending || updateProductMutation.isPending
						}
					/>
				</DialogContent>
			</Dialog>
		</Box>
	);
}
