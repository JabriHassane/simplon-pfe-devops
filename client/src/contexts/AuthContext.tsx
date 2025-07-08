import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface User {
	id: string;
	username: string;
	email: string;
	role: string;
}

interface AuthContextType {
	user: User | null;
	token: string | null;
	login: (username: string, password: string) => Promise<void>;
	logout: () => void;
	loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};

interface AuthProviderProps {
	children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(
		localStorage.getItem('token')
	);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const initializeAuth = async () => {
			const storedToken = localStorage.getItem('token');
			if (storedToken) {
				try {
					const response = await apiService.getProfile();
					setUser(response as any);
					setToken(storedToken);
				} catch (error) {
					console.error('Failed to validate token:', error);
					localStorage.removeItem('token');
					setToken(null);
				}
			}
			setLoading(false);
		};

		initializeAuth();
	}, []);

	const login = async (username: string, password: string) => {
		try {
			const response = await apiService.login(username, password);
			const { user: userData, token: newToken } = response as any;

			setUser(userData);
			setToken(newToken);
			localStorage.setItem('token', newToken);
		} catch (error) {
			throw error;
		}
	};

	const logout = () => {
		setUser(null);
		setToken(null);
		localStorage.removeItem('token');
	};

	const value: AuthContextType = {
		user,
		token,
		login,
		logout,
		loading,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
