import { Save } from '@mui/icons-material';
import { Box, Button, Divider } from '@mui/material';

interface ResourceFormProps {
	onSubmit: (data: any) => void;
	isLoading?: boolean;
	children: React.ReactNode;
}

function ResourceForm({ onSubmit, isLoading, children }: ResourceFormProps) {
	return (
		<Box component='form' onSubmit={onSubmit}>
			<Divider sx={{ mb: 1 }} />

			<Box sx={{ px: 2, pt: 2, pb: 1 }}>{children}</Box>

			<Divider sx={{ mt: 1.5 }} />

			<Box sx={{ p: 2 }}>
				<Button
					type='submit'
					variant='contained'
					startIcon={<Save />}
					// disabled={isLoading || !isValid}
					fullWidth
					size='large'
					disableElevation
				>
					{isLoading ? 'Enregistrement...' : 'Enregistrer'}
				</Button>
			</Box>
		</Box>
	);
}

export default ResourceForm;
