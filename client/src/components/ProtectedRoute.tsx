import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
	children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { user, loading } = useAuth();

	if (loading) {
		return (
			<Box
				display='flex'
				justifyContent='center'
				alignItems='center'
				minHeight='100vh'
				sx={{
					background: 'linear-gradient(135deg, #166C6B 0%, #0f4c4b 100%)',
				}}
			>
				<CircularProgress size={60} sx={{ color: 'white' }} />
			</Box>
		);
	}

	if (!user) {
		return <Navigate to='/login' replace />;
	}

	return <>{children}</>;
}
