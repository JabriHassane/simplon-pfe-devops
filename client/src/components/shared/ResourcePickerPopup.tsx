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
	Divider,
	TablePagination,
} from '@mui/material';
import {
	Search as SearchIcon,
	Close as CloseIcon,
	Check as CheckIcon,
} from '@mui/icons-material';
import { useResource } from '../../hooks/ressources/useResource';

export type ResourceType = 'user' | 'contact';

interface Resource {
	id: string;
	ref: string;
	name: string;
}

interface ResourcePickerProps {
	onClose: () => void;
	resourceType: ResourceType;
	onSelect: (resource: Resource) => void;
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

	const {
		data: resourceData,
		isLoading,
		error,
	} = useResource(resourceType, {
		page: page + 1, // API uses 1-based pagination
		limit: pageSize,
		search: searchTerm.trim() || undefined,
	});

	const resources = resourceData?.data || [];
	const pagination = resourceData?.pagination || {
		page: 1,
		limit: 10,
		total: 0,
		totalPages: 0,
	};

	const handleSelect = (resource: Resource) => {
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

	const handlePageChange = (event: unknown, newPage: number) => {
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

					<IconButton onClick={handleClose} size='small'>
						<CloseIcon />
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
									{resources.map((resource: Resource) => (
										<TableRow key={resource.id} hover>
											<TableCell>{resource.ref}</TableCell>
											<TableCell>{resource.name}</TableCell>
											<TableCell align='right'>
												<Button
													variant='outlined'
													size='small'
													startIcon={<CheckIcon />}
													onClick={() => handleSelect(resource)}
												>
													Choisir
												</Button>
											</TableCell>
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
								onPageChange={handlePageChange}
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
		</Dialog>
	);
}
