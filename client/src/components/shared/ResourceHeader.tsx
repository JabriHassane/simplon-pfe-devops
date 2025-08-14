import { Alert, useMediaQuery, useTheme } from '@mui/material';
import { Box, Button, Typography, IconButton } from '@mui/material';
import { Add as AddIcon, Menu as MenuIcon } from '@mui/icons-material';
import { useDrawer } from '../../contexts/DrawerContext';

interface ResourceHeaderProps {
	title: string;
	handleAdd?: () => void;
	error: boolean;
}

function ResourceHeader({ title, handleAdd, error }: ResourceHeaderProps) {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	const { toggleDrawer } = useDrawer();

	return (
		<>
			<Box
				display='flex'
				justifyContent='space-between'
				alignItems='center'
				mb={4}
			>
				<Box display='flex' alignItems='center' gap={1}>
					{isMobile && (
						<IconButton onClick={toggleDrawer} sx={{ size: 30 }}>
							<MenuIcon />
						</IconButton>
					)}
					<Typography variant='h4'>{title}</Typography>
				</Box>
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
