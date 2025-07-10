import { useSnackbar as useNotistackSnackbar } from 'notistack';

export const useSnackbar = () => {
	const { enqueueSnackbar } = useNotistackSnackbar();

	const showSuccess = (message: string) => {
		enqueueSnackbar(message, { variant: 'success' });
	};

	const showError = (message: string) => {
		enqueueSnackbar(message, { variant: 'error' });
	};

	const showWarning = (message: string) => {
		enqueueSnackbar(message, { variant: 'warning' });
	};

	const showInfo = (message: string) => {
		enqueueSnackbar(message, { variant: 'info' });
	};

	return {
		showSuccess,
		showError,
		showWarning,
		showInfo,
	};
};
