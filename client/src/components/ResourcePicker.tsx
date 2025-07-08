import React, { useState, useMemo } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	TextField,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Button,
	IconButton,
	Box,
	Typography,
	InputAdornment,
	Chip,
	Divider,
} from '@mui/material';
import {
	Search as SearchIcon,
	Close as CloseIcon,
	Check as CheckIcon,
} from '@mui/icons-material';
import { useClients } from '../hooks/useClients';
import { useUsers } from '../hooks/useUsers';
import { useSuppliers } from '../hooks/useSuppliers';
import { useProducts } from '../hooks/useProducts';
import { useAccounts } from '../hooks/useAccounts';

export type ResourceType =
	| 'client'
	| 'employee'
	| 'supplier'
	| 'product'
	| 'account';

interface Resource {
	id: string;
	name: string;
	reference?: string;
	email?: string;
	phone?: string;
	status?: string;
	price?: number;
	balance?: number;
}

interface ResourcePickerProps {
	open: boolean;
	onClose: () => void;
	resourceType: ResourceType;
	onSelect: (resource: Resource) => void;
	title?: string;
	excludeIds?: string[];
}

const getResourceData = (resourceType: ResourceType) => {
	switch (resourceType) {
		case 'client':
			return useClients();
		case 'employee':
			return useUsers();
		case 'supplier':
			return useSuppliers();
		case 'product':
			return useProducts();
		case 'account':
			return useAccounts();
		default:
			return { data: [], isLoading: false, error: null };
	}
};

const getResourceColumns = (resourceType: ResourceType) => {
	switch (resourceType) {
		case 'client':
			return [
				{ field: 'name', label: 'Name', width: '30%' },
				{ field: 'email', label: 'Email', width: '30%' },
				{ field: 'phone', label: 'Phone', width: '20%' },
				{ field: 'status', label: 'Status', width: '20%' },
			];
		case 'employee':
			return [
				{ field: 'name', label: 'Name', width: '30%' },
				{ field: 'email', label: 'Email', width: '30%' },
				{ field: 'role', label: 'Role', width: '20%' },
				{ field: 'status', label: 'Status', width: '20%' },
			];
		case 'supplier':
			return [
				{ field: 'name', label: 'Name', width: '30%' },
				{ field: 'email', label: 'Email', width: '30%' },
				{ field: 'phone', label: 'Phone', width: '20%' },
				{ field: 'status', label: 'Status', width: '20%' },
			];
		case 'product':
			return [
				{ field: 'name', label: 'Name', width: '25%' },
				{ field: 'reference', label: 'Reference', width: '20%' },
				{ field: 'price', label: 'Price', width: '20%' },
				{ field: 'stockQuantity', label: 'Stock', width: '15%' },
				{ field: 'status', label: 'Status', width: '20%' },
			];
		case 'account':
			return [
				{ field: 'name', label: 'Name', width: '40%' },
				{ field: 'balance', label: 'Balance', width: '30%' },
				{ field: 'status', label: 'Status', width: '30%' },
			];
		default:
			return [];
	}
};

const getResourceValue = (resource: any, field: string) => {
	switch (field) {
		case 'price':
			return new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
			}).format(resource[field] || 0);
		case 'balance':
			return new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
			}).format(resource[field] || 0);
		case 'stockQuantity':
			return resource[field] || 0;
		case 'status':
			return (
				<Chip
					label={resource[field] || 'N/A'}
					color={resource[field] === 'ACTIVE' ? 'success' : 'default'}
					size='small'
				/>
			);
		default:
			return resource[field] || 'N/A';
	}
};

const getResourceTitle = (resourceType: ResourceType) => {
	switch (resourceType) {
		case 'client':
			return 'Select Client';
		case 'employee':
			return 'Select Employee';
		case 'supplier':
			return 'Select Supplier';
		case 'product':
			return 'Select Product';
		case 'account':
			return 'Select Account';
		default:
			return 'Select Resource';
	}
};

export default function ResourcePicker({
	open,
	onClose,
	resourceType,
	onSelect,
	title,
	excludeIds = [],
}: ResourcePickerProps) {
	const [searchTerm, setSearchTerm] = useState('');
	const {
		data: resources = [],
		isLoading,
		error,
	} = getResourceData(resourceType);

	const columns = getResourceColumns(resourceType);

	const filteredResources = useMemo(() => {
		return resources
			.filter((resource: Resource) => !excludeIds.includes(resource.id))
			.filter((resource: Resource) => {
				if (!searchTerm) return true;
				const searchLower = searchTerm.toLowerCase();
				return (
					resource.name.toLowerCase().includes(searchLower) ||
					(resource.reference &&
						resource.reference.toLowerCase().includes(searchLower)) ||
					(resource.email && resource.email.toLowerCase().includes(searchLower))
				);
			});
	}, [resources, searchTerm, excludeIds]);

	const handleSelect = (resource: Resource) => {
		onSelect(resource);
		onClose();
		setSearchTerm('');
	};

	const handleClose = () => {
		onClose();
		setSearchTerm('');
	};

	return (
		<Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
			<DialogTitle>
				<Box display='flex' justifyContent='space-between' alignItems='center'>
					<Typography variant='h6'>
						{title || getResourceTitle(resourceType)}
					</Typography>
					<IconButton onClick={handleClose} size='small'>
						<CloseIcon />
					</IconButton>
				</Box>
			</DialogTitle>

			<Divider />

			<DialogContent>
				<TextField
					fullWidth
					placeholder='Search by name, reference, or email...'
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					margin='normal'
					variant='outlined'
					slotProps={{
						input: {
							startAdornment: (
								<InputAdornment position='start'>
									<SearchIcon />
								</InputAdornment>
							),
						},
					}}
					sx={{ mt: 0 }}
				/>

				{isLoading && (
					<Box display='flex' justifyContent='center' p={3}>
						<Typography>Loading...</Typography>
					</Box>
				)}

				{error && (
					<Box display='flex' justifyContent='center' p={3}>
						<Typography color='error'>Failed to load resources</Typography>
					</Box>
				)}

				{!isLoading && !error && (
					<TableContainer sx={{ mt: 2 }}>
						<Table size='small'>
							<TableHead>
								<TableRow>
									{columns.map((column) => (
										<TableCell
											key={column.field}
											sx={{ width: column.width, fontWeight: 'bold' }}
										>
											{column.label}
										</TableCell>
									))}
									<TableCell sx={{ width: '80px' }}>Action</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{filteredResources.length === 0 ? (
									<TableRow>
										<TableCell colSpan={columns.length + 1} align='center'>
											<Typography color='textSecondary'>
												{searchTerm
													? 'No resources found'
													: 'No resources available'}
											</Typography>
										</TableCell>
									</TableRow>
								) : (
									filteredResources.map((resource: Resource) => (
										<TableRow key={resource.id} hover>
											{columns.map((column) => (
												<TableCell key={column.field}>
													{getResourceValue(resource, column.field)}
												</TableCell>
											))}
											<TableCell>
												<Button
													variant='outlined'
													size='small'
													startIcon={<CheckIcon />}
													onClick={() => handleSelect(resource)}
												>
													Select
												</Button>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</TableContainer>
				)}
			</DialogContent>
		</Dialog>
	);
}
