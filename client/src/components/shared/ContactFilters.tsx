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
import { ContactType } from '../../../../shared/dtos/contact.dto';

export interface ContactFiltersData {
	type?: ContactType;
	search?: string;
}

interface Props {
	filters: ContactFiltersData;
	onFiltersChange: (newFilters: Partial<ContactFiltersData>) => void;
}

export default function ContactFilters({ filters, onFiltersChange }: Props) {
	return (
		<Box sx={{ my: 2 }}>
			<Grid container spacing={1}>
				<Grid size={3}>
					<Box display='flex' alignItems='center' gap={1}>
						<IconButton
							size='small'
							onClick={() => onFiltersChange({ search: '' })}
							disabled={!filters.search}
						>
							<Clear />
						</IconButton>
						<TextField
							value={filters.search}
							onChange={(e) => onFiltersChange({ search: e.target.value })}
							label='Recherche'
							variant='outlined'
							placeholder='Rechercher par nom, téléphone...'
							fullWidth
						/>
					</Box>
				</Grid>
			</Grid>
		</Box>
	);
}
