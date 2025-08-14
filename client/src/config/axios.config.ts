import axios, { AxiosError } from 'axios';
import { AuthService } from '../services/auth.service';

// Extend AxiosRequestConfig to include _retry property
declare module 'axios' {
	export interface AxiosRequestConfig {
		_retry?: boolean;
	}
}

export const Axios = axios.create({
	baseURL: import.meta.env.VITE_API_URL + '/api',
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true,
});

// Add response interceptor to handle token refresh
Axios.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const originalRequest = error.config!;
		// If the error is 401 and we haven't already tried to refresh
		// Don't retry if it's already a refresh request to avoid infinite loop
		if (
			error.response?.status === 401 &&
			!originalRequest._retry &&
			!originalRequest.url?.includes('/auth/refresh')
		) {
			originalRequest._retry = true;

			try {
				// Try to refresh the token
				await AuthService.refresh();

				// Retry the original request
				return Axios(originalRequest);
			} catch (refreshError) {
				// If refresh fails, redirect to login
				window.location.href = '/login';
				return Promise.reject(refreshError);
			}
		}

		console.error('API request error:', error);

		const errorMessage = (error.response?.data as any).message as string;
		if (errorMessage) {
			throw new Error(errorMessage);
		}
		throw new Error('API request failed');
	}
);
