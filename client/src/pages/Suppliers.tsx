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
	useSuppliers,
	useCreateSupplier,
	useUpdateSupplier,
	useDeleteSupplier,
	type Supplier,
} from '../hooks/useSuppliers';
import SupplierForm from '../components/SupplierForm';

export default function Suppliers() {
	const [openDialog, setOpenDialog] = useState(false);
	const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

	// TanStack Query hooks
	const { data: suppliers = [], isLoading, error } = useSuppliers();
	const createSupplierMutation = useCreateSupplier();
	const updateSupplierMutation = useUpdateSupplier();
	const deleteSupplierMutation = useDeleteSupplier();

	const handleSubmit = async (data: any) => {
		try {
			if (editingSupplier) {
				await updateSupplierMutation.mutateAsync({
					id: editingSupplier.id,
					data,
				});
			} else {
				await createSupplierMutation.mutateAsync(data);
			}
			setOpenDialog(false);
			setEditingSupplier(null);
		} catch (err) {
			console.error('Error saving supplier:', err);
		}
	};

	const handleDelete = async (id: string) => {
		if (window.confirm('Are you sure you want to delete this supplier?')) {
			try {
				await deleteSupplierMutation.mutateAsync(id);
			} catch (err) {
				console.error('Error deleting supplier:', err);
			}
		}
	};

	const handleEdit = (supplier: Supplier) => {
		setEditingSupplier(supplier);
		setOpenDialog(true);
	};

	const handleAdd = () => {
		setEditingSupplier(null);
		setOpenDialog(true);
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
				<Typography variant='h4'>Suppliers</Typography>
				<Button variant='contained' startIcon={<AddIcon />} onClick={handleAdd}>
					Add Supplier
				</Button>
			</Box>

			{error && (
				<Alert severity='error' sx={{ mb: 2 }}>
					Failed to fetch suppliers
				</Alert>
			)}

			{(createSupplierMutation.error ||
				updateSupplierMutation.error ||
				deleteSupplierMutation.error) && (
				<Alert severity='error' sx={{ mb: 2 }}>
					{createSupplierMutation.error?.message ||
						updateSupplierMutation.error?.message ||
						deleteSupplierMutation.error?.message ||
						'An error occurred'}
				</Alert>
			)}

			<TableContainer>
				<Table size='small'>
					<TableHead>
						<TableRow>
							<TableCell>Name</TableCell>
							<TableCell>Email</TableCell>
							<TableCell>Phone</TableCell>
							<TableCell>Contact Person</TableCell>
							<TableCell>Status</TableCell>
							<TableCell>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{suppliers.map((supplier) => (
							<TableRow key={supplier.id}>
								<TableCell>{supplier.name}</TableCell>
								<TableCell>{supplier.email}</TableCell>
								<TableCell>{supplier.phone}</TableCell>
								<TableCell>{supplier.contactPerson}</TableCell>
								<TableCell>
									<Box
										sx={{
											px: 1,
											py: 0.5,
											borderRadius: 1,
											backgroundColor:
												supplier.status === 'ACTIVE'
													? 'success.light'
													: 'error.light',
											color:
												supplier.status === 'ACTIVE'
													? 'success.dark'
													: 'error.dark',
											display: 'inline-block',
										}}
									>
										{supplier.status}
									</Box>
								</TableCell>
								<TableCell>
									<IconButton
										onClick={() => handleEdit(supplier)}
										size='small'
									>
										<EditIcon />
									</IconButton>
									<IconButton
										onClick={() => handleDelete(supplier.id)}
										size='small'
										color='error'
										disabled={deleteSupplierMutation.isPending}
									>
										{deleteSupplierMutation.isPending ? (
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
				maxWidth='sm'
				fullWidth
			>
				<DialogTitle>
					{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
				</DialogTitle>
				<DialogContent>
					<SupplierForm
						initialData={
							editingSupplier
								? {
										name: editingSupplier.name,
										phone: editingSupplier.phone,
										address: editingSupplier.address,
								  }
								: undefined
						}
						onSubmit={handleSubmit}
						onCancel={() => setOpenDialog(false)}
						isLoading={
							createSupplierMutation.isPending ||
							updateSupplierMutation.isPending
						}
					/>
				</DialogContent>
			</Dialog>
		</Box>
	);
}
