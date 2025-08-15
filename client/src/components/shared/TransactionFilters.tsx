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
import {
	TRANSFER_ACTORS,
	type TransferActor,
} from '../../../../shared/constants';
import InputClearButton from './InputClearButton';

export interface TransactionFiltersData {
	search?: string;
	dateFrom?: string;
	dateTo?: string;
	transferActor?: TransferActor;
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
			<Grid container columnSpacing={1} rowSpacing={2}>
				<Grid size={{ xs: 12, md: 2 }}>
					<TextField
						value={filters.search}
						onChange={(e) => onFiltersChange({ search: e.target.value })}
						label='Recherche'
						variant='outlined'
						placeholder='Référence'
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
					<FormControl fullWidth>
						<InputLabel>Compte</InputLabel>
						<Select
							value={filters.transferActor || ''}
							onChange={(e) =>
								onFiltersChange({ transferActor: e.target.value })
							}
							label='Compte'
							displayEmpty
							startAdornment={
								<InputClearButton
									onClick={() => onFiltersChange({ transferActor: undefined })}
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
							{TRANSFER_ACTORS.map((account) => (
								<MenuItem key={account} value={account}>
									{account.charAt(0).toUpperCase() + account.slice(1)}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Grid>
			</Grid>
		</Box>
	);
}
