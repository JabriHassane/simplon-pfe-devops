import {
	Box,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Grid,
} from '@mui/material';
import { ROLES, type Role } from '../../../../shared/constants';
import type { UserFilterParams } from '../../types/filters.types';
import InputClearButton from './InputClearButton';

interface Props {
	filters: UserFilterParams;
	onFiltersChange: (newFilters: Partial<UserFilterParams>) => void;
}

export default function UserFilters({ filters, onFiltersChange }: Props) {
	return (
		<Box sx={{ my: 2 }}>
			<Grid container columnSpacing={1} rowSpacing={2}>
				<Grid size={{ xs: 12, md: 2 }}>
					<TextField
						value={filters.search}
						onChange={(e) => onFiltersChange({ search: e.target.value })}
						label='Recherche'
						variant='outlined'
						placeholder='Référence, nom'
						fullWidth
						slotProps={{
							input: {
								startAdornment: (
									<InputClearButton
										onClick={() => onFiltersChange({ search: '' })}
									/>
								),
							},
						}}
					/>
				</Grid>

				<Grid size={{ xs: 12, md: 2 }}>
					<FormControl fullWidth>
						<InputLabel>Rôle</InputLabel>
						<Select
							value={filters.role}
							onChange={(e) =>
								onFiltersChange({ role: e.target.value as Role })
							}
							label='Rôle'
							defaultValue=''
							displayEmpty
							startAdornment={
								<InputClearButton
									onClick={() => onFiltersChange({ role: undefined })}
								/>
							}
							MenuProps={{
								PaperProps: {
									style: {
										maxHeight: 300,
									},
								},
							}}
						>
							<MenuItem value=''>Tous</MenuItem>
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
