import {
	Box,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import ResourcePickerField from './ResourcePickerField';
import { ORDER_STATUSES, type OrderType } from '../../../../shared/constants';
import { DICT } from '../../i18n/fr';
import type { OrderFilterParams } from '../../types/filters.types';
import InputClearButton from './InputClearButton';

interface Props {
	type: OrderType;
	filters: OrderFilterParams;
	onFiltersChange: (newFilters: Partial<OrderFilterParams>) => void;
}

export default function OrderFilters({
	type,
	filters,
	onFiltersChange,
}: Props) {
	return (
		<Box sx={{ my: 2 }}>
			<Grid container columnSpacing={1} rowSpacing={2}>
				<Grid size={{ xs: 12, md: 2 }}>
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
									<InputClearButton
										onClick={() => onFiltersChange({ search: '' })}
									/>
								),
							},
						}}
					/>
				</Grid>

				<Grid size={{ xs: 12, md: 2 }}>
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
										<InputClearButton
											onClick={() => onFiltersChange({ dateFrom: '' })}
										/>
									),
								},
							},
						}}
					/>
				</Grid>

				<Grid size={{ xs: 12, md: 2 }}>
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
										<InputClearButton
											onClick={() => onFiltersChange({ dateTo: '' })}
										/>
									),
								},
							},
						}}
					/>
				</Grid>

				<Grid size={{ xs: 12, md: 2 }}>
					<ResourcePickerField
						label='Agent'
						onChange={({ id }) => onFiltersChange({ agentId: id })}
						resourceType='user'
						placeholder='Sélectionner'
						clearButtonPosition='start'
					/>
				</Grid>

				<Grid size={{ xs: 12, md: 2 }}>
					<ResourcePickerField
						label={type === 'sale' ? 'Client' : 'Fournisseur'}
						onChange={({ id }) => onFiltersChange({ contactId: id })}
						resourceType={type === 'sale' ? 'client' : 'supplier'}
						placeholder='Sélectionner'
						clearButtonPosition='start'
					/>
				</Grid>

				<Grid size={{ xs: 12, md: 2 }}>
					<FormControl fullWidth>
						<InputLabel>Statut</InputLabel>
						<Select
							value={filters.status || ''}
							onChange={(e) => onFiltersChange({ status: e.target.value })}
							label='Statut'
							displayEmpty
							startAdornment={
								<InputClearButton
									onClick={() => onFiltersChange({ status: undefined })}
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
							{ORDER_STATUSES.map((status) => (
								<MenuItem key={status} value={status}>
									{DICT.orderStatus[status]}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Grid>
			</Grid>
		</Box>
	);
}
