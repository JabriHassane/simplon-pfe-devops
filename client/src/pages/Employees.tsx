import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function Employees() {
	const navigate = useNavigate();

	useEffect(() => {
		// Redirect to Users page since employees are users in this system
		navigate('/users');
	}, [navigate]);

	return (
		<Box
			display='flex'
			flexDirection='column'
			justifyContent='center'
			alignItems='center'
			minHeight='400px'
		>
			<CircularProgress />
			<Typography variant='body1' sx={{ mt: 2 }}>
				Redirection vers les utilisateurs...
			</Typography>
		</Box>
	);
}
