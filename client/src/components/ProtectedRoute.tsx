import { Box, CircularProgress } from '@mui/material';
import { useConnectedUser } from '../hooks/useAuth';

interface ProtectedRouteProps {
	children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { isLoading } = useConnectedUser();

	if (isLoading) {
		return (
			<Box
				display='flex'
				justifyContent='center'
				alignItems='center'
				minHeight='100vh'
			>
				<CircularProgress size={100} color='primary' />
			</Box>
		);
	}

	return children;
}
