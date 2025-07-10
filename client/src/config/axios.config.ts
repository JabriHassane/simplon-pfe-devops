import axios, { type AxiosResponse } from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export const Axios = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true,
});

// Add request interceptor to include auth token
Axios.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('token');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Add response interceptor to handle errors
Axios.interceptors.response.use(
	(response: AxiosResponse) => {
		return response;
	},
	(error) => {
		console.error('API request error:', error);
		if (error.response?.data?.message) {
			throw new Error(error.response.data.message);
		}
		throw new Error('API request failed');
	}
);
