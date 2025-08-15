import { Box, TextField } from '@mui/material';
import type { ContactFilterParams } from '../../types/filters.types';
import InputClearButton from './InputClearButton';

interface Props {
	filters: ContactFilterParams;
	onFiltersChange: (newFilters: Partial<ContactFilterParams>) => void;
}

export default function ContactFilters({ filters, onFiltersChange }: Props) {
	return (
		<Box sx={{ my: 2 }}>
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
							<InputClearButton
								onClick={() => onFiltersChange({ search: '' })}
							/>
						),
					},
				}}
			/>
		</Box>
	);
}
