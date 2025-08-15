import {
	Box,
	Drawer,
	Toolbar,
	List,
	Divider,
	ListItem,
	ListItemButton,
	ListItemText,
	ListItemIcon,
	useTheme,
	useMediaQuery,
} from '@mui/material';
import { AccountCircleOutlined } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { navigationItems } from '../config/navigation';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useDrawer } from '../contexts/DrawerContext';
import { useLogout } from '../hooks/useAuth';
import logo from '../assets/logo.png';

const drawerWidth = 240;

export default function Sidebar() {
	const navigate = useNavigate();
	const location = useLocation();
	const logoutMutation = useLogout();
	const [user] = useContext(AuthContext);
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	const { mobileOpen, toggleDrawer: handleDrawerToggle } = useDrawer();

	const handleNavigation = async (path: string) => {
		if (path === '/logout') {
			await logoutMutation.mutateAsync();
		} else {
			navigate(path);
		}
	};

	const drawerContent = (
		<>
			<Toolbar>
				<Box padding={3}>
					<img src={logo} alt='logo' style={{ width: '100%' }} />
				</Box>
			</Toolbar>

			<List>
				<ListItem>
					<ListItemIcon>
						<AccountCircleOutlined />
					</ListItemIcon>
					<ListItemText primary={user?.name} />
				</ListItem>

				<Divider sx={{ marginY: 1 }} />

				{navigationItems.map((item, index) =>
					item ? (
						<ListItem key={index} disablePadding>
							<ListItemButton
								onClick={() => handleNavigation(item.path)}
								selected={location.pathname === item.path}
							>
								<ListItemIcon>{item.icon}</ListItemIcon>
								<ListItemText primary={item.name} />
							</ListItemButton>
						</ListItem>
					) : (
						<Divider key={index} sx={{ marginY: 1 }} />
					)
				)}
			</List>
		</>
	);

	return (
		<>
			{/* Permanent drawer for desktop */}
			{!isMobile && (
				<Drawer
					sx={{
						width: drawerWidth,
						flexShrink: 0,
						'& .MuiDrawer-paper': {
							width: drawerWidth,
							boxSizing: 'border-box',
						},
					}}
					variant='permanent'
					anchor='left'
				>
					{drawerContent}
				</Drawer>
			)}

			{/* Temporary drawer for mobile */}
			{isMobile && (
				<Drawer
					variant='temporary'
					anchor='left'
					open={mobileOpen}
					onClose={handleDrawerToggle}
					ModalProps={{
						keepMounted: true, // Better open performance on mobile
					}}
					sx={{
						'& .MuiDrawer-paper': {
							width: drawerWidth,
							boxSizing: 'border-box',
						},
					}}
				>
					{drawerContent}
				</Drawer>
			)}
		</>
	);
}
