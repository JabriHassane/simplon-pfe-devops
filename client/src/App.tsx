import { lazy, Suspense } from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { CircularProgress, ThemeProvider } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SnackbarProvider } from 'notistack';
import { AuthProvider } from './contexts/AuthContext';
import { DrawerProvider } from './contexts/DrawerContext';
import { LocalizationProvider } from '@mui/x-date-pickers';

import ProtectedRoute from './components/ProtectedRoute';
import { theme } from './theme';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/fr';
import Sidebar from './components/Sidebar';
import NavBinder from './components/NavBinder';

console.log(import.meta.env.VITE_API_URL);

// Lazy load pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Users = lazy(() => import('./pages/Users'));
const Orders = lazy(() => import('./pages/Orders'));
const Contacts = lazy(() => import('./pages/Contacts'));

function AppContent() {
	return (
		<ThemeProvider theme={theme}>
			<DrawerProvider>
				<LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='fr'>
					<Box sx={{ display: 'flex', width: '100vw' }}>
						<CssBaseline />
						<Sidebar />
						<Box
							component='main'
							sx={{
								flexGrow: 1,
								bgcolor: 'white',
								p: { xs: 2, md: 3 },
								width: '100%',
								height: '100vh',
							}}
						>
							<Suspense
								fallback={
									<Box
										display='flex'
										justifyContent='center'
										alignItems='center'
										height='100%'
									>
										<CircularProgress />
									</Box>
								}
							>
								<Routes>
									<Route path='/' element={<Dashboard />} />
									<Route path='/clients' element={<Contacts type='client' />} />
									<Route
										path='/suppliers'
										element={<Contacts type='supplier' />}
									/>
									<Route path='/sales' element={<Orders type='sale' />} />
									<Route
										path='/purchases'
										element={<Orders type='purchase' />}
									/>
									<Route path='/transactions' element={<Transactions />} />
									<Route path='/users' element={<Users />} />
								</Routes>
							</Suspense>
						</Box>
					</Box>
				</LocalizationProvider>
			</DrawerProvider>
		</ThemeProvider>
	);
}

// Create a client
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: true,
			staleTime: 0,
			gcTime: 0,
		},
	},
});

export default function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<SnackbarProvider maxSnack={5} autoHideDuration={3000}>
				<AuthProvider>
					<Router>
						<NavBinder/>
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
			<ReactQueryDevtools initialIsOpen={false} buttonPosition='bottom-left' />
		</QueryClientProvider>
	);
}
