import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
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
import { SnackbarProvider } from 'notistack';
import { AuthProvider } from './contexts/AuthContext';
import logo from './assets/logo.png';
import { LocalizationProvider } from '@mui/x-date-pickers';

import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { theme } from './theme';
import { navigationItems } from './config/navigation';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useLogout } from './hooks/ressources/useAuth';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Suppliers from './pages/Suppliers';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Purchases from './pages/Purchases';
import Transactions from './pages/Transactions';
import Accounts from './pages/Accounts';
import Reports from './pages/Reports';
import Users from './pages/Users';

const drawerWidth = 240;

function AppContent() {
	const navigate = useNavigate();
	const location = useLocation();
	const logoutMutation = useLogout();

	const handleNavigation = async (path: string) => {
		if (path === '/logout') {
			await logoutMutation.mutateAsync();
		} else {
			navigate(path);
		}
	};

	return (
		<ThemeProvider theme={theme}>
			<LocalizationProvider dateAdapter={AdapterDayjs}>
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
							<Route path='/suppliers' element={<Suppliers />} />
							<Route path='/products' element={<Products />} />
							<Route path='/sales' element={<Sales />} />
							<Route path='/purchases' element={<Purchases />} />
							<Route path='/transactions' element={<Transactions />} />
							<Route path='/accounts' element={<Accounts />} />
							<Route path='/reports' element={<Reports />} />
							<Route path='/users' element={<Users />} />
						</Routes>
					</Box>
				</Box>
			</LocalizationProvider>
		</ThemeProvider>
	);
}

// Create a client
const queryClient = new QueryClient();

export default function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<SnackbarProvider maxSnack={5} autoHideDuration={3000}>
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
			</SnackbarProvider>
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}
