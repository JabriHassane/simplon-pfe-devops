import { useMutation, useQuery } from '@tanstack/react-query';
import { AuthService } from '../../services/auth.service';
import type {
	LoginDtoType,
	VerifyPasswordDtoType,
} from '../../../../shared/dtos/auth.dto';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from './useSnackbar';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

export const useLogin = () => {
	const { showError } = useSnackbar();

	const navigate = useNavigate();
	const [, setUser] = useContext(AuthContext);

	return useMutation({
		mutationFn: async (data: LoginDtoType) => {
			try {
				const user = await AuthService.login(data);
				setUser(user);
				navigate('/');
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la connexion');
			}
		},
	});
};

export const useLogout = () => {
	const { showError } = useSnackbar();

	const navigate = useNavigate();
	const [, setUser] = useContext(AuthContext);

	return useMutation({
		mutationFn: async () => {
			try {
				await AuthService.logout();
				setUser(null);
				navigate('/login');
			} catch (error) {
				console.error(error);
				showError('Erreur lors de la déconnexion');
				// Still clear user state even if logout fails
				setUser(null);
				navigate('/login');
			}
		},
	});
};

export const useConnectedUser = () => {
	const { showError } = useSnackbar();

	const navigate = useNavigate();
	const [, setUser] = useContext(AuthContext);

	return useQuery({
		queryKey: ['auth'],
		queryFn: async () => {
			try {
				const user = await AuthService.getConnectedUser();
				setUser(user);
				return user;
			} catch (error) {
				console.error(error);
				navigate('/login');
				showError("Erreur lors de la récupération de l'utilisateur connecté");
				return null;
			}
		},
	});
};

export const useVerifyPassword = (callback: () => void) => {
	const { showWarning } = useSnackbar();

	return useMutation({
		mutationFn: async (data: VerifyPasswordDtoType) => {
			try {
				await AuthService.verifyPassword(data);
				callback();
			} catch (error) {
				console.error(error);
				showWarning('Mot de passe incorrect');
			}
		},
	});
};
