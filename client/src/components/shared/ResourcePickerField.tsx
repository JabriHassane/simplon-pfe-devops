import { useState } from 'react';
import {
	TextField,
	FormControl,
	FormHelperText,
	IconButton,
	Box,
} from '@mui/material';
import { Clear } from '@mui/icons-material';
import ResourcePickerPopup, { type ResourceType } from './ResourcePickerPopup';

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
	showClearButton?: boolean;
	onClear?: () => void;
}

export default function ResourcePickerField({
	label,
	value,
	onChange,
	resourceType,
	placeholder = 'Cliquez pour sélectionner...',
	error = false,
	helperText,
	required = false,
	disabled = false,
	showClearButton = false,
	onClear,
}: ResourcePickerFieldProps) {
	const [open, setOpen] = useState(false);
	const [selectedResource, setSelectedResource] = useState<{
		id: string;
		name: string;
	} | null>(null);

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
		setSelectedResource(resource);
		setOpen(false);
	};

	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (onClear) {
			onClear();
		} else {
			onChange('');
		}
	};

	return (
		<Box display='flex' alignItems='center' gap={1}>
			{showClearButton && (
				<IconButton size='small' onClick={handleClear} disabled={!value}>
					<Clear />
				</IconButton>
			)}

			<FormControl fullWidth error={error} required={required}>
				<TextField
					label={label}
					value={selectedResource?.name}
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
