import { useState } from 'react';
import {
	TextField,
	FormControl,
	FormHelperText
} from '@mui/material';
import ResourcePickerPopup, {
	type PickableResourceType,
} from './ResourcePickerPopup';
import InputClearButton from './InputClearButton';

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
	clearButtonPosition?: 'start' | 'end';
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
	clearButtonPosition = 'end',
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

	const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		setSelectedResource(null);
		onChange({ id: '', name: '' });
	};

	return (
		<FormControl fullWidth error={error} required={required}>
			<TextField
				label={label}
				value={selectedResource?.name || init || ''}
				placeholder={placeholder}
				onClick={handleOpen}
				disabled={disabled}
				error={error}
				required={required}
				slotProps={{
					input: {
						readOnly: true,
						[clearButtonPosition + 'Adornment']: !required && (
							<InputClearButton
								onClick={handleClear}
								position={clearButtonPosition}
							/>
						),
					},
				}}
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
	);
}
