import {
	Box,
	TextField,
	Grid,
	IconButton,
	InputAdornment,
} from '@mui/material';
import type { ContactFilterParams } from '../../types/filters.types';
import { Clear } from '@mui/icons-material';

interface Props {
	filters: ContactFilterParams;
	onFiltersChange: (newFilters: Partial<ContactFilterParams>) => void;
}

export default function ContactFilters({ filters, onFiltersChange }: Props) {
	return (
		<Box sx={{ my: 2 }}>
			<Grid container spacing={1}>
				<Grid size={2}>
					<TextField
						value={filters.search}
						onChange={(e) => onFiltersChange({ search: e.target.value })}
						label='Recherche'
						variant='outlined'
						placeholder='Référence, nom, téléphone'
						fullWidth
						slotProps={{
							input: {
								startAdornment: (
									<InputAdornment position='start'>
										<IconButton
											size='small'
											onClick={() => onFiltersChange({ search: '' })}
										>
											<Clear />
										</IconButton>
									</InputAdornment>
								),
							},
						}}
					/>
				</Grid>
			</Grid>
		</Box>
	);
}
