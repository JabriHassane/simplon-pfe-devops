import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		port: 3000,
	},
	build: {
		chunkSizeWarningLimit: 1000, // Increase size limit to 1000kb
		rollupOptions: {
			output: {
				manualChunks: {
					mui: ['@mui/material', '@mui/icons-material', '@mui/x-date-pickers'],
					'react-vendor': ['react', 'react-dom', 'react-router-dom'],
					utils: ['dayjs', 'notistack', '@tanstack/react-query'],
				},
			},
		},
	},
});
