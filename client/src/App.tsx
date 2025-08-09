import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SnackbarProvider } from 'notistack';
import { AuthProvider } from './contexts/AuthContext';
import { LocalizationProvider } from '@mui/x-date-pickers';

import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { theme } from './theme';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Users from './pages/Users';
import Orders from './pages/Orders';
import Contacts from './pages/Contacts';
import Sidebar from './components/Sidebar';

function AppContent() {
	return (
		<ThemeProvider theme={theme}>
			<LocalizationProvider dateAdapter={AdapterDayjs}>
				<Box sx={{ display: 'flex' }}>
					<CssBaseline />
					<Sidebar />
					<Box
						component='main'
						sx={{ flexGrow: 1, bgcolor: 'white', p: 3, height: '100vh' }}
					>
						<Routes>
							<Route path='/' element={<Dashboard />} />
							<Route path='/clients' element={<Contacts type='client' />} />
							<Route path='/suppliers' element={<Contacts type='supplier' />} />
							<Route path='/sales' element={<Orders type='sale' />} />
							<Route path='/purchases' element={<Orders type='purchase' />} />
							<Route path='/transactions' element={<Transactions />} />
							<Route path='/users' element={<Users />} />
						</Routes>
					</Box>
				</Box>
			</LocalizationProvider>
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
