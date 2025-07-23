import { Alert } from '@mui/material';
import { Box, Button, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface ResourceHeaderProps {
	title: string;
	handleAdd?: () => void;
	error: boolean;
}

function ResourceHeader({ title, handleAdd, error }: ResourceHeaderProps) {
	return (
		<>
			<Box
				display='flex'
				justifyContent='space-between'
				alignItems='center'
				mb={3}
			>
				<Typography variant='h4'>{title}</Typography>
				{handleAdd && (
					<Button
						variant='contained'
						startIcon={<AddIcon />}
						onClick={handleAdd}
						disableElevation
					>
						Ajouter
					</Button>
				)}
			</Box>

			{error && (
				<Alert severity='error' sx={{ mb: 2 }}>
					Erreur lors de la récupération des {title.toLowerCase()}
				</Alert>
			)}
		</>
	);
}

export default ResourceHeader;
