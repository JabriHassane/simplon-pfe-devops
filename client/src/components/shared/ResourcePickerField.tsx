import { useState } from 'react';
import {
	TextField,
	FormControl,
	FormHelperText,
	IconButton,
	Box,
} from '@mui/material';
import { Clear } from '@mui/icons-material';
import ResourcePickerPopup, {
	type PickableResourceType,
} from './ResourcePickerPopup';

interface Resource {
	id: string;
	name?: string | null;
}

interface ResourcePickerFieldProps {
	label: string;
	init?: string | null;
	onChange: (value: Resource) => void;
	resourceType: PickableResourceType;
	placeholder?: string;
	error?: boolean;
	helperText?: string;
	required?: boolean;
	disabled?: boolean;
	showClearButton?: boolean;
}

export default function ResourcePickerField({
	label,
	init,
	onChange,
	resourceType,
	placeholder = 'Cliquez pour sélectionner...',
	error = false,
	helperText,
	required = false,
	disabled = false,
	showClearButton = false,
}: ResourcePickerFieldProps) {
	const [open, setOpen] = useState(false);
	const [selectedResource, setSelectedResource] = useState<Resource | null>(
		null
	);

	const handleOpen = () => {
		if (!disabled) {
			setOpen(true);
		}
	};

	const handleClose = () => {
		setOpen(false);
	};

	const handleSelect = (resource: Resource) => {
		onChange(resource);
		setSelectedResource(resource);
		setOpen(false);
	};

	const handleClear = () => {
		setSelectedResource(null);
		onChange({ id: '', name: '' });
	};

	return (
		<Box display='flex' alignItems='center' gap={1}>
			{showClearButton && (
				<IconButton size='small' onClick={handleClear} disabled={!init}>
					<Clear />
				</IconButton>
			)}

			<FormControl fullWidth error={error} required={required}>
				<TextField
					label={label}
					value={selectedResource?.name || init || ''}
					placeholder={placeholder}
					onClick={handleOpen}
					disabled={disabled}
					error={error}
					required={required}
					fullWidth
				/>
				{helperText && <FormHelperText>{helperText}</FormHelperText>}

				{open && (
					<ResourcePickerPopup
						onClose={handleClose}
						resourceType={resourceType}
						onSelect={handleSelect}
					/>
				)}
			</FormControl>
		</Box>
	);
}
