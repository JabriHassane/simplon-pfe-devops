import { Save } from '@mui/icons-material';
import { Box, Button, CircularProgress, Divider } from '@mui/material';

interface ResourceFormProps {
	onSubmit: (data: any) => void;
	isLoading?: boolean;
	children: React.ReactNode;
}

function ResourceForm({ onSubmit, isLoading, children }: ResourceFormProps) {
	return (
		<Box>
			<Divider sx={{ mb: 1 }} />

			<Box sx={{ px: 2, pt: 2, pb: 1 }}>{children}</Box>

			<Divider sx={{ mt: 1.5 }} />

			<Box sx={{ p: 2 }}>
				<Button
					onClick={onSubmit}
					variant='contained'
					startIcon={isLoading ? <CircularProgress size={20} /> : <Save />}
					fullWidth
					size='large'
					disabled={isLoading}
					disableElevation
				>
					{isLoading ? 'Enregistrement...' : 'Enregistrer'}
				</Button>
			</Box>
		</Box>
	);
}

export default ResourceForm;
