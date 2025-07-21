import { useState } from 'react';
import {
	TextField,
	FormControl,
	FormHelperText,
	IconButton,
	InputAdornment,
	Box,
} from '@mui/material';
import { Clear } from '@mui/icons-material';
import ResourcePickerPopup, { type ResourceType } from './ResourcePickerPopup';
import { useClients } from '../../hooks/ressources/useClients';
import { useUsers } from '../../hooks/ressources/useUsers';
import { useSuppliers } from '../../hooks/ressources/useSuppliers';
import { useArticles } from '../../hooks/ressources/useArticles';
import { useAccounts } from '../../hooks/ressources/useAccounts';
import { useCategories } from '../../hooks/ressources/useCategories';
import type { UseQueryResult } from '@tanstack/react-query';

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

const useResource = (
	resourceType: ResourceType
): UseQueryResult<any, Error> => {
	switch (resourceType) {
		case 'client':
			return useClients();
		case 'user':
			return useUsers();
		case 'supplier':
			return useSuppliers();
		case 'category':
			return useCategories();
		case 'article':
			return useArticles();
		case 'account':
			return useAccounts();
		default:
			return {
				data: {
					data: [],
					pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
				},
				isLoading: false,
				error: null,
			} as any;
	}
};

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
	const { data: resourceData } = useResource(resourceType);
	const resources = resourceData?.data || [];

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

	const getDisplayValue = () => {
		if (value) {
			const selectedResource = resources.find((r: any) => r.id === value);
			if (selectedResource) {
				let display = selectedResource.name;
				if (selectedResource.reference) {
					display += ` (Ref: ${selectedResource.reference})`;
				}
				return display;
			}
			return 'Sélectionné (ID: ' + value + ')';
		}
		return '';
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
					value={getDisplayValue()}
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
