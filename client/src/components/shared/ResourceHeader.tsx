import { Alert, useMediaQuery, useTheme, Fab } from '@mui/material';
import { Box, Typography, IconButton } from '@mui/material';
import {
	Add as AddIcon,
	Menu as MenuIcon,
	FilterList as FilterIcon,
} from '@mui/icons-material';
import { useDrawer } from '../../contexts/DrawerContext';

interface ResourceHeaderProps {
	title: string;
	handleAdd?: () => void;
	error: boolean;
	onToggleFilters?: () => void;
}

function ResourceHeader({
	title,
	handleAdd,
	error,
	onToggleFilters,
}: ResourceHeaderProps) {
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
					{isMobile && handleAdd && (
						<IconButton onClick={toggleDrawer}>
							<MenuIcon />
						</IconButton>
					)}
					<Typography variant='h4' fontSize={30}>
						{title}
					</Typography>
				</Box>
				{onToggleFilters && (
					<IconButton onClick={onToggleFilters}>
						<FilterIcon />
					</IconButton>
				)}
			</Box>

			{error && (
				<Alert severity='error' sx={{ mb: 2 }}>
					Erreur lors de la récupération des {title.toLowerCase()}
				</Alert>
			)}

			{handleAdd && (
				<Fab
					color='primary'
					onClick={handleAdd}
					sx={{
						position: 'fixed',
						bottom: 16,
						right: 16,
					}}
				>
					<AddIcon />
				</Fab>
			)}
		</>
	);
}

export default ResourceHeader;
