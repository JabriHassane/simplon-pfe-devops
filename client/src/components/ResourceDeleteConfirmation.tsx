import { Button, Box, Divider } from '@mui/material';
import ResourceFormPopup from './ResourceFormPopup';

interface ResourceConfirmationDialogProps {
	onClose: () => void;
	title: string;
	description: string;
	onDelete: () => void;
}

function ResourceDeleteConfirmation({
	onClose,
	title,
	description,
	onDelete,
}: ResourceConfirmationDialogProps) {
	return (
		<ResourceFormPopup
			onClose={onClose}
			title={title}
			description={description}
		>
			<Divider />

			<Box display='flex' gap={2} justifyContent='end' p={2}>
				<Button
					onClick={onDelete}
					variant='outlined'
					color='error'
					size='large'
					disableElevation
					fullWidth
				>
					Oui
				</Button>
				<Button
					onClick={onClose}
					variant='contained'
					color='primary'
					size='large'
					disableElevation
					fullWidth
				>
					Non
				</Button>
			</Box>
		</ResourceFormPopup>
	);
}

export default ResourceDeleteConfirmation;
