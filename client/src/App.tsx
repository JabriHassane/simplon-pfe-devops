import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { ListItemIcon, ThemeProvider } from '@mui/material';
import {
	BrowserRouter as Router,
	Routes,
	Route,
	useNavigate,
	useLocation,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import logo from './assets/logo.png';

import {
	Dashboard,
	Clients,
	Employees,
	Suppliers,
	Products,
	Sales,
	Purchases,
	Transactions,
	Accounts,
	Reports,
	Users,
	Settings,
} from './pages';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { theme } from './theme';
import { navigationItems } from './config/navigation';

const drawerWidth = 240;

function AppContent() {
	const navigate = useNavigate();
	const location = useLocation();
	const { logout } = useAuth();

	const handleNavigation = (path: string) => {
		if (path === '/logout') {
			logout();
			navigate('/');
			return;
		}
		navigate(path);
	};

	return (
		<ThemeProvider theme={theme}>
			<Box sx={{ display: 'flex' }}>
				<CssBaseline />

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
					<Toolbar>
						<Box padding={3}>
							<img src={logo} alt='logo' style={{ width: '100%' }} />
						</Box>
					</Toolbar>

					<List>
						{navigationItems.map((item) =>
							item ? (
								<ListItem key={item.name} disablePadding>
									<ListItemButton
										onClick={() => handleNavigation(item.path)}
										selected={location.pathname === item.path}
									>
										<ListItemIcon>{item.icon}</ListItemIcon>
										<ListItemText primary={item.name} />
									</ListItemButton>
								</ListItem>
							) : (
								<Divider sx={{ marginY: 1 }} />
							)
						)}
					</List>
				</Drawer>

				<Box
					component='main'
					sx={{ flexGrow: 1, bgcolor: 'white', p: 3, height: '100vh' }}
				>
					<Routes>
						<Route path='/' element={<Dashboard />} />
						<Route path='/clients' element={<Clients />} />
						<Route path='/employees' element={<Employees />} />
						<Route path='/suppliers' element={<Suppliers />} />
						<Route path='/products' element={<Products />} />
						<Route path='/sales' element={<Sales />} />
						<Route path='/purchases' element={<Purchases />} />
						<Route path='/transactions' element={<Transactions />} />
						<Route path='/accounts' element={<Accounts />} />
						<Route path='/reports' element={<Reports />} />
						<Route path='/users' element={<Users />} />
						<Route path='/settings' element={<Settings />} />
					</Routes>
				</Box>
			</Box>
		</ThemeProvider>
	);
}

// Create a client
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000, // 5 minutes
			gcTime: 10 * 60 * 1000, // 10 minutes
			retry: 1,
			refetchOnWindowFocus: false,
		},
	},
});

export default function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<Router>
					<Routes>
						<Route path='/login' element={<Login />} />
						<Route
							path='/*'
							element={
								<ProtectedRoute>
									<AppContent />
								</ProtectedRoute>
							}
						/>
					</Routes>
				</Router>
			</AuthProvider>
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}
