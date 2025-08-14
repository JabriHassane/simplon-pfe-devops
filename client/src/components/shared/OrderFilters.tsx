import {
	Box,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Grid,
	IconButton,
	InputAdornment,
} from '@mui/material';
import { Clear } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import ResourcePickerField from './ResourcePickerField';
import {
	ORDER_STATUSES,
	type OrderStatus,
	type OrderType,
} from '../../../../shared/constants';
import { DICT } from '../../i18n/fr';
import type { OrderFilterParams } from '../../types/filters.types';

interface Props {
	type: OrderType;
	filters: OrderFilterParams;
	onFiltersChange: (newFilters: Partial<OrderFilterParams>) => void;
	hideStatus?: OrderStatus;
}

export default function OrderFilters({
	type,
	filters,
	onFiltersChange,
	hideStatus,
}: Props) {
	return (
		<Box sx={{ my: 2 }}>
			<Grid container spacing={1}>
				<Grid size={2}>
					<TextField
						value={filters.search}
						onChange={(e) => onFiltersChange({ search: e.target.value })}
						label='Recherche'
						variant='outlined'
						placeholder='Référence, bon, facture'
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

				<Grid size={2}>
					<DatePicker
						sx={{ width: '100%' }}
						label='Date de début'
						value={filters.dateFrom ? dayjs(filters.dateFrom) : null}
						onChange={(date) =>
							onFiltersChange({ dateFrom: date?.toISOString() })
						}
						slotProps={{
							textField: {
								InputProps: {
									startAdornment: (
										<InputAdornment position='start'>
											<IconButton
												size='small'
												onClick={() => onFiltersChange({ dateFrom: '' })}
											>
												<Clear />
											</IconButton>
										</InputAdornment>
									),
								},
							},
						}}
					/>
				</Grid>

				<Grid size={2}>
					<DatePicker
						sx={{ width: '100%' }}
						label='Date de fin'
						value={filters.dateTo ? dayjs(filters.dateTo) : null}
						onChange={(date) =>
							onFiltersChange({ dateTo: date?.toISOString() })
						}
						slotProps={{
							textField: {
								InputProps: {
									startAdornment: (
										<InputAdornment position='start'>
											<IconButton
												size='small'
												onClick={() => onFiltersChange({ dateTo: '' })}
											>
												<Clear />
											</IconButton>
										</InputAdornment>
									),
								},
							},
						}}
					/>
				</Grid>

				<Grid size={2}>
					<ResourcePickerField
						label='Agent'
						onChange={({ id }) => onFiltersChange({ agentId: id })}
						resourceType='user'
						placeholder='Sélectionner'
						clearButtonPosition='start'
					/>
				</Grid>

				<Grid size={2}>
					<ResourcePickerField
						label={type === 'sale' ? 'Client' : 'Fournisseur'}
						onChange={({ id }) => onFiltersChange({ contactId: id })}
						resourceType={type === 'sale' ? 'client' : 'supplier'}
						placeholder='Sélectionner'
						clearButtonPosition='start'
					/>
				</Grid>

				{!hideStatus && (
					<Grid size={2}>
						<FormControl fullWidth>
							<InputLabel>Statut</InputLabel>
							<Select
								value={filters.status || ''}
								onChange={(e) => onFiltersChange({ status: e.target.value })}
								label='Statut'
								displayEmpty
								startAdornment={
									<InputAdornment position='start'>
										<IconButton
											size='small'
											onClick={() => onFiltersChange({ status: undefined })}
										>
											<Clear />
										</IconButton>
									</InputAdornment>
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
								{ORDER_STATUSES.map((status) => (
									<MenuItem key={status} value={status}>
										{DICT.orderStatus[status]}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Grid>
				)}
			</Grid>
		</Box>
	);
}
