import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
	palette: {
		mode: 'light',
		primary: {
			main: '#166C6B',
		},
		background: {
			default: '#f5f5f5',
			paper: '#ffffff',
		},
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: 'none',
					bsaleRadius: 5,
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					bsaleRadius: 10,
				},
			},
		},
	},
});
