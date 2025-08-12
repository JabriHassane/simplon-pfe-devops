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
	TableRow, IconButton,
	Box,
	Typography,
	InputAdornment,
	Divider,
	TablePagination
} from '@mui/material';
import {
	Search as SearchIcon, Add
} from '@mui/icons-material';
import { useResource } from '../../hooks/ressources/useResource';
import type { UserDto } from '../../../../shared/dtos/user.dto';
import type { ContactDto } from '../../../../shared/dtos/contact.dto';
import type { OrderDto } from '../../../../shared/dtos/order.dto';
import type { TransactionDto } from '../../../../shared/dtos/transaction.dto';
import usePopups from '../../hooks/usePopups';
import ResourceFormPopup from './ResourceFormPopup';
import UserForm from '../forms/UserForm';
import ContactForm from '../forms/ContactForm';

export type ResourceType = 'user' | 'contact' | 'order' | 'transaction';
export type PickableResourceType = 'user' | 'contact';
export type Resource = UserDto | ContactDto | OrderDto | TransactionDto;
export type PickableResource = UserDto | ContactDto;

interface ResourcePickerProps {
	onClose: () => void;
	resourceType: PickableResourceType;
	onSelect: (resource: PickableResource) => void;
	pageSize?: number;
}

export default function ResourcePickerPopup({
	onClose,
	resourceType,
	onSelect,
	pageSize = 10,
}: ResourcePickerProps) {
	const [searchTerm, setSearchTerm] = useState('');
	const [page, setPage] = useState(0);

	const { openFormPopup, handleOpenFormPopup, handleClosePopup } =
		usePopups<PickableResource>();

	const {
		data: resourceData,
		isLoading,
		error,
	} = useResource(resourceType, {
		page: page + 1, // API uses 1-based pagination
		pageSize: pageSize,
		search: searchTerm.trim(),
	});

	const resources = (resourceData?.data || []) as PickableResource[];
	const pagination = resourceData?.pagination || {
		page: 1,
		pageSize: 10,
		total: 0,
	};

	const handleSelect = (resource: PickableResource) => {
		onSelect(resource);
		onClose();
		setSearchTerm('');
		setPage(0);
	};

	const handleClose = () => {
		onClose();
		setSearchTerm('');
		setPage(0);
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
		setPage(0); // Reset to first page when searching
	};

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
	};

	return (
		<Dialog open onClose={handleClose} maxWidth='sm' fullWidth>
			<DialogTitle>
				<Box display='flex' justifyContent='space-between' alignItems='center'>
					<TextField
						fullWidth
						placeholder='Rechercher par nom ou référence...'
						value={searchTerm}
						onChange={handleSearchChange}
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
						sx={{ mt: 0, mr: 2 }}
					/>

					<IconButton onClick={() => handleOpenFormPopup(null)} size='small'>
						<Add />
					</IconButton>
				</Box>
			</DialogTitle>

			<Divider />

			<DialogContent sx={{ pt: 2 }}>
				{isLoading && (
					<Box display='flex' justifyContent='center' p={3}>
						<Typography>Chargement...</Typography>
					</Box>
				)}

				{error && (
					<Box display='flex' justifyContent='center' p={3}>
						<Typography color='error'>
							Erreur lors du chargement des ressources
						</Typography>
					</Box>
				)}

				{!isLoading && !error && (
					<>
						<TableContainer>
							<Table size='small'>
								<TableHead>
									<TableRow>
										<TableCell sx={{ fontWeight: 'bold' }}>Référence</TableCell>
										<TableCell sx={{ fontWeight: 'bold' }}>Nom</TableCell>
									</TableRow>
								</TableHead>

								<TableBody>
									{resources.map((resource) => (
										<TableRow
											key={resource.id}
											hover
											onClick={() => handleSelect(resource)}
											sx={{ cursor: 'pointer' }}
										>
											<TableCell>{resource.ref}</TableCell>
											<TableCell>{resource.name}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>

						{pagination.total > 0 && (
							<TablePagination
								component='div'
								count={pagination.total}
								page={page}
								onPageChange={(_, newPage) => handlePageChange(newPage)}
								rowsPerPage={pageSize}
								rowsPerPageOptions={[2, 5, 10, 25, 50]}
								labelRowsPerPage='Lignes par page:'
								labelDisplayedRows={({ from, to, count }) =>
									`${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
								}
								sx={{ mt: 1 }}
							/>
						)}
					</>
				)}
			</DialogContent>

			{openFormPopup && (
				<ResourceFormPopup
					onClose={handleClosePopup}
					title={`Nouveau ${
						resourceType === 'contact' ? 'client' : 'fournisseur'
					}`}
				>
					{resourceType === 'contact' ? (
						<ContactForm
							init={null}
							onClose={handleClosePopup}
							type={'client'}
						/>
					) : (
						<UserForm init={null} onClose={handleClosePopup} />
					)}
				</ResourceFormPopup>
			)}
		</Dialog>
	);
}
