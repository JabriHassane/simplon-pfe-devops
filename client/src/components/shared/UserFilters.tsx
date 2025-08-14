import {
	Box,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Grid
} from '@mui/material';
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
				<Grid size={2}>
					<TextField
						value={filters.search}
						onChange={(e) => onFiltersChange({ search: e.target.value })}
						label='Recherche'
						variant='outlined'
						placeholder='Référence, nom'
						fullWidth
					/>
				</Grid>

				<Grid size={2}>
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
				</Grid>
			</Grid>
		</Box>
	);
}
