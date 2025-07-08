import React, { useState } from 'react';
import {
	TextField,
	Button,
	Box,
	Typography,
	Chip,
	FormControl,
	FormHelperText,
} from '@mui/material';
import { KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material';
import ResourcePicker, { type ResourceType } from './ResourcePicker';

interface ResourcePickerFieldProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	resourceType: ResourceType;
	placeholder?: string;
	error?: boolean;
	helperText?: string;
	required?: boolean;
	disabled?: boolean;
	selectedResource?: {
		id: string;
		name: string;
		reference?: string;
		email?: string;
	};
	excludeIds?: string[];
}

export default function ResourcePickerField({
	label,
	value,
	onChange,
	resourceType,
	placeholder = 'Click to select...',
	error = false,
	helperText,
	required = false,
	disabled = false,
	selectedResource,
	excludeIds = [],
}: ResourcePickerFieldProps) {
	const [open, setOpen] = useState(false);

	const handleOpen = () => {
		if (!disabled) {
			setOpen(true);
		}
	};

	const handleClose = () => {
		setOpen(false);
	};

	const handleSelect = (resource: { id: string; name: string }) => {
		onChange(resource.id);
	};

	const getDisplayValue = () => {
		if (selectedResource) {
			return selectedResource.name;
		}
		if (value) {
			return 'Selected (ID: ' + value + ')';
		}
		return '';
	};

	return (
		<FormControl fullWidth error={error} required={required}>
			<Box>
				<Button
					variant='outlined'
					fullWidth
					onClick={handleOpen}
					disabled={disabled}
					sx={{
						justifyContent: 'flex-start',
						textAlign: 'left',
						height: '56px',
						borderColor: error ? 'error.main' : undefined,
						'&:hover': {
							borderColor: error ? 'error.main' : undefined,
						},
					}}
					endIcon={<KeyboardArrowDownIcon />}
				>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'flex-start',
							width: '100%',
						}}
					>
						<Typography
							variant='body2'
							color={getDisplayValue() ? 'text.primary' : 'text.secondary'}
							sx={{ fontWeight: getDisplayValue() ? 500 : 400 }}
						>
							{getDisplayValue() || placeholder}
						</Typography>
						{selectedResource && selectedResource.reference && (
							<Typography variant='caption' color='text.secondary'>
								Ref: {selectedResource.reference}
							</Typography>
						)}
						{selectedResource && selectedResource.email && (
							<Typography variant='caption' color='text.secondary'>
								{selectedResource.email}
							</Typography>
						)}
					</Box>
				</Button>
				{value && (
					<Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
						<Chip
							label={selectedResource?.name || `ID: ${value}`}
							size='small'
							color='primary'
							variant='outlined'
						/>
						{selectedResource?.reference && (
							<Chip
								label={`Ref: ${selectedResource.reference}`}
								size='small'
								variant='outlined'
							/>
						)}
					</Box>
				)}
			</Box>
			{helperText && <FormHelperText>{helperText}</FormHelperText>}

			<ResourcePicker
				open={open}
				onClose={handleClose}
				resourceType={resourceType}
				onSelect={handleSelect}
				excludeIds={excludeIds}
			/>
		</FormControl>
	);
}
