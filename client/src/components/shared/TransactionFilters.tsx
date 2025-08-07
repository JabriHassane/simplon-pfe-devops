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
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import ResourcePickerField from './ResourcePickerField';
import { TRANSACTION_ACCOUNTS } from '../../../../shared/constants';

export interface TransactionFiltersData {
	search?: string;
	dateFrom?: string;
	dateTo?: string;
	account?: string;
}

interface Props {
	filters: TransactionFiltersData;
	onFiltersChange: (newFilters: Partial<TransactionFiltersData>) => void;
}

export default function TransactionFilters({
	filters,
	onFiltersChange,
}: Props) {
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
							placeholder='Rechercher par référence...'
							fullWidth
						/>
					</Box>
				</Grid>

				<Grid size={3}>
					<Box display='flex' alignItems='center' gap={1}>
						<IconButton
							size='small'
							onClick={() => onFiltersChange({ dateFrom: '' })}
							disabled={!filters.dateFrom}
						>
							<Clear />
						</IconButton>
						<DatePicker
							sx={{ width: '100%' }}
							label='Date de début'
							value={filters.dateFrom ? dayjs(filters.dateFrom) : null}
							onChange={(date) =>
								onFiltersChange({ dateFrom: date?.toISOString() })
							}
						/>
					</Box>
				</Grid>

				<Grid size={3}>
					<Box display='flex' alignItems='center' gap={1}>
						<IconButton
							size='small'
							onClick={() => onFiltersChange({ dateTo: '' })}
							disabled={!filters.dateTo}
						>
							<Clear />
						</IconButton>
						<DatePicker
							sx={{ width: '100%' }}
							label='Date de fin'
							value={filters.dateTo ? dayjs(filters.dateTo) : null}
							onChange={(date) =>
								onFiltersChange({ dateTo: date?.toISOString() })
							}
						/>
					</Box>
				</Grid>

				<Grid size={3}>
					<Box display='flex' alignItems='center' gap={1}>
						<IconButton
							size='small'
							onClick={() => onFiltersChange({ account: '' })}
							disabled={!filters.account}
						>
							<Clear />
						</IconButton>

						<FormControl fullWidth>
							<InputLabel>Compte</InputLabel>
							<Select
								value={filters.account}
								onChange={(e) => onFiltersChange({ account: e.target.value })}
								label='Compte'
								MenuProps={{
									PaperProps: {
										style: {
											maxHeight: 300,
										},
									},
								}}
							>
								<MenuItem value=''>Tous</MenuItem>
								{TRANSACTION_ACCOUNTS.map((account) => (
									<MenuItem key={account} value={account}>
										{account.charAt(0).toUpperCase() + account.slice(1)}
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
