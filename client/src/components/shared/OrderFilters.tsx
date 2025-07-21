import {
	Box,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Button,
	Grid,
	IconButton,
	Collapse,
	Paper,
	Card,
	InputAdornment,
} from '@mui/material';
import {
	FilterList as FilterIcon,
	Clear as ClearIcon,
	ExpandMore as ExpandMoreIcon,
	ExpandLess as ExpandLessIcon,
	Clear,
} from '@mui/icons-material';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { CalendarIcon, DatePicker } from '@mui/x-date-pickers';
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

interface OrderFiltersProps {
	onFiltersChange: (filters: OrderFiltersData) => void;
	onClearFilters: () => void;
}

export default function OrderFilters({
	onFiltersChange,
	onClearFilters,
}: OrderFiltersProps) {
	const [expanded, setExpanded] = useState(false);
	const [hasActiveFilters, setHasActiveFilters] = useState(false);

	const {
		control,
		handleSubmit,
		reset,
		watch,
		setValue,
		formState: { isDirty },
	} = useForm<OrderFiltersData>({
		defaultValues: {
			ref: '',
			dateFrom: '',
			dateTo: '',
			agentId: '',
			clientId: '',
			status: '',
		},
	});

	const watchedValues = watch();

	// Check if any filters are active
	const checkActiveFilters = (values: OrderFiltersData) => {
		return Object.values(values).some((value) => value && value !== '');
	};

	const onSubmit = (data: OrderFiltersData) => {
		const activeFilters = checkActiveFilters(data);
		setHasActiveFilters(activeFilters);
		onFiltersChange(data);
	};

	const handleClearFilters = () => {
		reset();
		setHasActiveFilters(false);
		onClearFilters();
	};

	const handleToggleExpanded = () => {
		setExpanded(!expanded);
	};

	return (
		<Box component='form' onSubmit={handleSubmit(onSubmit)} sx={{ my: 2 }}>
			<Grid container spacing={1}>
				<Grid size={2}>
					<Controller
						name='ref'
						control={control}
						render={({ field }) => (
							<Box display='flex' alignItems='center' gap={1}>
								<IconButton
									size='small'
									onClick={() => field.onChange('')}
									disabled={!field.value}
								>
									<Clear />
								</IconButton>
								<TextField
									{...field}
									fullWidth
									label='Référence'
									variant='outlined'
									placeholder='Rechercher par référence...'
								/>
							</Box>
						)}
					/>
				</Grid>

				<Grid size={2}>
					<Controller
						name='dateFrom'
						control={control}
						render={({ field }) => (
							<Box display='flex' alignItems='center' gap={1}>
								<IconButton
									size='small'
									onClick={() => field.onChange(null)}
									disabled={!field.value}
								>
									<Clear />
								</IconButton>
								<DatePicker
									sx={{ width: '100%' }}
									label='Date de début'
									value={field.value ? dayjs(field.value) : null}
									onChange={(date) => field.onChange(date?.toISOString())}
								/>
							</Box>
						)}
					/>
				</Grid>

				<Grid size={2}>
					<Controller
						name='dateTo'
						control={control}
						render={({ field }) => (
							<Box display='flex' alignItems='center' gap={1}>
								<IconButton
									size='small'
									onClick={() => field.onChange(null)}
									disabled={!field.value}
								>
									<Clear />
								</IconButton>
								<DatePicker
									sx={{ width: '100%' }}
									label='Date de fin'
									value={field.value ? dayjs(field.value) : null}
									onChange={(date) => field.onChange(date?.toISOString())}
								/>
							</Box>
						)}
					/>
				</Grid>

				<Grid size={2}>
					<ResourcePickerField
						label='Agent'
						value={watchedValues.agentId || ''}
						onChange={(value) => setValue('agentId', value)}
						resourceType='user'
						placeholder='Sélectionner un agent...'
						onClear={() => setValue('agentId', '')}
						showClearButton
					/>
				</Grid>

				<Grid size={2}>
					<ResourcePickerField
						label='Client'
						value={watchedValues.clientId || ''}
						onChange={(value) => setValue('clientId', value)}
						resourceType='client'
						placeholder='Sélectionner un client...'
						onClear={() => setValue('clientId', '')}
						showClearButton
					/>
				</Grid>

				<Grid size={2}>
					<Controller
						name='status'
						control={control}
						render={({ field }) => (
							<Box display='flex' alignItems='center' gap={1}>
								<IconButton
									size='small'
									onClick={() => field.onChange('')}
									disabled={!field.value}
								>
									<Clear />
								</IconButton>

								<FormControl fullWidth>
									<InputLabel>Statut</InputLabel>
									<Select
										{...field}
										label='Statut'
										IconComponent={field.value ? undefined : undefined}
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
						)}
					/>
				</Grid>
			</Grid>
		</Box>
	);
}
