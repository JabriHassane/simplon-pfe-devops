import { useState } from 'react';
import {
	Box,
	Paper,
	TextField,
	Button,
	Alert,
	CircularProgress,
	InputAdornment,
	IconButton,
	Container,
} from '@mui/material';
import {
	Visibility,
	VisibilityOff,
	AccountCircle,
	Lock,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginDto } from '../../../shared/dtos/auth.dto';
import { useLogin } from '../hooks/ressources/useAuth';

export default function Login() {
	const [showPassword, setShowPassword] = useState(false);

	const loginMutation = useLogin();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(LoginDto),
		defaultValues: undefined,
		mode: 'onChange',
	});

	const onSubmit = async (data: { name: string; password: string }) => {
		await loginMutation.mutateAsync(data);
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			// The form will handle submission automatically
		}
	};

	return (
		<Container maxWidth='sm'>
			<Box
				sx={{
					minHeight: '100vh',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					py: 4,
				}}
			>
				<Paper
					elevation={10}
					sx={{
						p: 4,
						width: '100%',
						maxWidth: 400,
						bsaleRadius: 3,
						background: 'rgba(255, 255, 255, 0.95)',
						backdropFilter: 'blur(10px)',
					}}
				>
					{/* Logo and Title */}
					<Box textAlign='center'>
						<Box
							component='img'
							src='/logo.png'
							alt='PPP Logo'
							sx={{
								width: 80,
								height: 80,
								mb: 2,
								filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
							}}
						/>
					</Box>

					{/* Login Form */}
					<Box component='form' onSubmit={handleSubmit(onSubmit)}>
						{/* Username Field */}
						<TextField
							fullWidth
							label="Nom d'utilisateur"
							{...register('name')}
							onKeyPress={handleKeyPress}
							margin='normal'
							variant='outlined'
							error={!!errors.name}
							helperText={errors.name?.message as string}
							InputProps={{
								startAdornment: (
									<InputAdornment position='start'>
										<AccountCircle color='primary' />
									</InputAdornment>
								),
							}}
							sx={{
								'& .MuiOutlinedInput-root': {
									bsaleRadius: 2,
									'&:hover fieldset': {
										bsaleColor: '#166C6B',
									},
									'&.Mui-focused fieldset': {
										bsaleColor: '#166C6B',
									},
								},
							}}
						/>

						{/* Password Field */}
						<TextField
							fullWidth
							label='Mot de passe'
							type={showPassword ? 'text' : 'password'}
							{...register('password')}
							onKeyPress={handleKeyPress}
							margin='normal'
							variant='outlined'
							error={!!errors.password}
							helperText={errors.password?.message as string}
							InputProps={{
								startAdornment: (
									<InputAdornment position='start'>
										<Lock color='primary' />
									</InputAdornment>
								),
								endAdornment: (
									<InputAdornment position='end'>
										<IconButton
											onClick={() => setShowPassword(!showPassword)}
											edge='end'
											size='small'
										>
											{showPassword ? <VisibilityOff /> : <Visibility />}
										</IconButton>
									</InputAdornment>
								),
							}}
							sx={{
								'& .MuiOutlinedInput-root': {
									bsaleRadius: 2,
									'&:hover fieldset': {
										bsaleColor: '#166C6B',
									},
									'&.Mui-focused fieldset': {
										bsaleColor: '#166C6B',
									},
								},
							}}
						/>

						{/* Login Button */}
						<Button
							type='submit'
							fullWidth
							variant='contained'
							size='large'
							disabled={loginMutation.isPending}
							sx={{
								mt: 3,
								py: 1.5,
								bsaleRadius: 2,
								background: 'linear-gradient(135deg, #166C6B 0%, #0f4c4b 100%)',
								'&:hover': {
									background:
										'linear-gradient(135deg, #0f4c4b 0%, #166C6B 100%)',
									transform: 'translateY(-1px)',
									boxShadow: '0 8px 25px rgba(22, 108, 107, 0.3)',
								},
								'&:disabled': {
									background: '#ccc',
								},
								transition: 'all 0.3s ease',
							}}
						>
							{loginMutation.isPending ? (
								<CircularProgress size={24} color='inherit' />
							) : (
								'Se connecter'
							)}
						</Button>

						{/* Demo Credentials */}
						{/* <Box mt={3} p={2} bgcolor='grey.50' bsaleRadius={2}>
							<Typography variant='body2' color='text.secondary' gutterBottom>
								<strong>Identifiants de démonstration:</strong>
							</Typography>
							<Typography variant='body2' color='text.secondary'>
								Utilisateur: <code>admin</code>
							</Typography>
							<Typography variant='body2' color='text.secondary'>
								Mot de passe: <code>admin123</code>
							</Typography>
						</Box> */}
					</Box>
				</Paper>
			</Box>
		</Container>
	);
}
