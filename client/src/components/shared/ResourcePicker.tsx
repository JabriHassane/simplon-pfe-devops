import { useState } from 'react';
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
import { useClients } from '../../hooks/ressources/useClients';
import { useUsers } from '../../hooks/ressources/useUsers';
import { useSuppliers } from '../../hooks/ressources/useSuppliers';
import { useProducts } from '../../hooks/ressources/useProducts';
import { useAccounts } from '../../hooks/ressources/useAccounts';
import type { UseQueryResult } from '@tanstack/react-query';

export type ResourceType =
	| 'client'
	| 'employee'
	| 'supplier'
	| 'product'
	| 'account';

interface Resource {
	id: string;
	ref: string;
	name: string;
}

interface ResourcePickerProps {
	open: boolean;
	onClose: () => void;
	resourceType: ResourceType;
	onSelect: (resource: Resource) => void;
	title?: string;
}

const useResource = (
	resourceType: ResourceType
): UseQueryResult<Resource[], Error> => {
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
			return { data: [], isLoading: false, error: null } as any;
	}
};

export default function ResourcePicker({
	open,
	onClose,
	resourceType,
	onSelect,
	title,
}: ResourcePickerProps) {
	const [searchTerm, setSearchTerm] = useState('');
	const { data: resources = [], isLoading, error } = useResource(resourceType);

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
					<Typography variant='h6'>{title}</Typography>
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
									<TableCell sx={{ width: '100%', fontWeight: 'bold' }}>
										Name
									</TableCell>
									<TableCell sx={{ width: '80px' }}>Action</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{resources.length === 0 && (
									<TableRow>
										<TableCell colSpan={2} align='center'>
											<Typography color='textSecondary'>
												{searchTerm
													? 'No resources found'
													: 'No resources available'}
											</Typography>
										</TableCell>
									</TableRow>
								)}
								{resources.length > 0 &&
									resources.map((resource: Resource) => (
										<TableRow key={resource.id} hover>
											<TableCell>{resource.name}</TableCell>
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
									))}
							</TableBody>
						</Table>
					</TableContainer>
				)}
			</DialogContent>
		</Dialog>
	);
}
