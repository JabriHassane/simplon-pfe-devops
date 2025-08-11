import {
	Box,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Grid,
	IconButton,
} from '@mui/material';
import { Clear } from '@mui/icons-material';
import { ROLES } from '../../../../shared/constants';
import type { UserFilterParams } from '../../types/filters.types';

interface Props {
	filters: UserFilterParams;
	onFiltersChange: (newFilters: Partial<UserFilterParams>) => void;
}

export default function UserFilters({ filters, onFiltersChange }: Props) {
	return (
		<Box sx={{ my: 2 }}>
			<Grid container spacing={1}>
				<Grid size={6}>
					<Box display='flex' alignItems='center' gap={1}>
						<IconButton
							size='small'
							onClick={() => onFiltersChange({ search: undefined })}
							disabled={!filters.search}
						>
							<Clear />
						</IconButton>
						<TextField
							value={filters.search}
							onChange={(e) => onFiltersChange({ search: e.target.value })}
							label='Recherche'
							variant='outlined'
							placeholder='Rechercher par nom...'
							fullWidth
						/>
					</Box>
				</Grid>

				<Grid size={6}>
					<Box display='flex' alignItems='center' gap={1}>
						<IconButton
							size='small'
							onClick={() => onFiltersChange({ role: undefined })}
							disabled={!filters.role}
						>
							<Clear />
						</IconButton>

						<FormControl fullWidth>
							<InputLabel>Rôle</InputLabel>
							<Select
								value={filters.role}
								onChange={(e) => onFiltersChange({ role: e.target.value })}
								label='Rôle'
								MenuProps={{
									PaperProps: {
										style: {
											maxHeight: 300,
										},
									},
								}}
							>
								{ROLES.map((role) => (
									<MenuItem key={role} value={role}>
										{role === 'super_admin' && 'Super Admin'}
										{role === 'admin' && 'Admin'}
										{role === 'agent' && 'Agent'}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Box>
				</Grid>
			</Grid>
		</Box>
	);
}
