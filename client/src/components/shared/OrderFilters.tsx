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
import { ORDER_STATUSES } from '../../../../shared/constants';
import { DICT } from '../../i18n/fr';

export interface OrderFiltersData {
	ref?: string;
	dateFrom?: string;
	dateTo?: string;
	agentId?: string;
	clientId?: string;
	status?: string;
}

interface Props {
	filters: OrderFiltersData;
	onFiltersChange: (newFilters: Partial<OrderFiltersData>) => void;
}

export default function OrderFilters({ filters, onFiltersChange }: Props) {
	return (
		<Box sx={{ my: 2 }}>
			<Grid container spacing={1}>
				<Grid size={2}>
					<Box display='flex' alignItems='center' gap={1}>
						<IconButton
							size='small'
							onClick={() => onFiltersChange({ ref: '' })}
							disabled={!filters.ref}
						>
							<Clear />
						</IconButton>
						<TextField
							value={filters.ref}
							onChange={(e) => onFiltersChange({ ref: e.target.value })}
							label='Référence'
							variant='outlined'
							placeholder='Rechercher par référence...'
							fullWidth
						/>
					</Box>
				</Grid>

				<Grid size={2}>
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

				<Grid size={2}>
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

				<Grid size={2}>
					<ResourcePickerField
						label='Agent'
						value={filters.agentId || ''}
						onChange={(value) => onFiltersChange({ agentId: value })}
						resourceType='user'
						placeholder='Sélectionner un agent...'
						onClear={() => onFiltersChange({ agentId: '' })}
						showClearButton
					/>
				</Grid>

				<Grid size={2}>
					<ResourcePickerField
						label='Client'
						value={filters.clientId || ''}
						onChange={(value) => onFiltersChange({ clientId: value })}
						resourceType='client'
						placeholder='Sélectionner un client...'
						onClear={() => onFiltersChange({ clientId: '' })}
						showClearButton
					/>
				</Grid>

				<Grid size={2}>
					<Box display='flex' alignItems='center' gap={1}>
						<IconButton
							size='small'
							onClick={() => onFiltersChange({ status: '' })}
							disabled={!filters.status}
						>
							<Clear />
						</IconButton>

						<FormControl fullWidth>
							<InputLabel>Statut</InputLabel>
							<Select
								value={filters.status}
								onChange={(e) => onFiltersChange({ status: e.target.value })}
								label='Statut'
								IconComponent={filters.status ? undefined : undefined}
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
					</Box>
				</Grid>
			</Grid>
		</Box>
	);
}
