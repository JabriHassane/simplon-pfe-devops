import React, { useState } from 'react';
import {
	Typography,
	Box,
	Paper,
	TextField,
	Button,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Switch,
	FormControlLabel,
	Divider,
	Alert,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';

interface Settings {
	companyName: string;
	currency: string;
	timezone: string;
	language: string;
	notifications: {
		email: boolean;
		sms: boolean;
		push: boolean;
	};
	security: {
		twoFactorAuth: boolean;
		sessionTimeout: number;
	};
}

export default function Settings() {
	const [settings, setSettings] = useState<Settings>({
		companyName: 'My Company',
		currency: 'USD',
		timezone: 'UTC',
		language: 'en',
		notifications: {
			email: true,
			sms: false,
			push: true,
		},
		security: {
			twoFactorAuth: false,
			sessionTimeout: 30,
		},
	});

	const [saved, setSaved] = useState(false);

	const handleSave = () => {
		// In a real application, this would save to the backend
		console.log('Saving settings:', settings);
		setSaved(true);
		setTimeout(() => setSaved(false), 3000);
	};

	const handleNotificationChange =
		(key: keyof Settings['notifications']) =>
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setSettings((prev) => ({
				...prev,
				notifications: {
					...prev.notifications,
					[key]: event.target.checked,
				},
			}));
		};

	const handleSecurityChange =
		(key: keyof Settings['security']) =>
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setSettings((prev) => ({
				...prev,
				security: {
					...prev.security,
					[key]: event.target.checked,
				},
			}));
		};

	return (
		<Box>
			<Typography variant='h4' gutterBottom>
				Paramètres
			</Typography>

			{saved && (
				<Alert severity='success' sx={{ mb: 2 }}>
					Paramètres sauvegardés avec succès !
				</Alert>
			)}

			<Paper sx={{ p: 3, mb: 3 }}>
				<Typography variant='h6' gutterBottom>
					Paramètres généraux
				</Typography>
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
						gap: 3,
					}}
				>
					<TextField
						fullWidth
						label="Nom de l'entreprise"
						value={settings.companyName}
						onChange={(e) =>
							setSettings({ ...settings, companyName: e.target.value })
						}
					/>
					<FormControl fullWidth>
						<InputLabel>Devise</InputLabel>
						<Select
							value={settings.currency}
							onChange={(e) =>
								setSettings({ ...settings, currency: e.target.value })
							}
							label='Devise'
						>
							<MenuItem value='USD'>USD ($)</MenuItem>
							<MenuItem value='EUR'>EUR (€)</MenuItem>
							<MenuItem value='GBP'>GBP (£)</MenuItem>
							<MenuItem value='CAD'>CAD (C$)</MenuItem>
						</Select>
					</FormControl>
					<FormControl fullWidth>
						<InputLabel>Fuseau horaire</InputLabel>
						<Select
							value={settings.timezone}
							onChange={(e) =>
								setSettings({ ...settings, timezone: e.target.value })
							}
							label='Fuseau horaire'
						>
							<MenuItem value='UTC'>UTC</MenuItem>
							<MenuItem value='EST'>Heure de l'Est</MenuItem>
							<MenuItem value='PST'>Heure du Pacifique</MenuItem>
							<MenuItem value='CET'>Heure d'Europe centrale</MenuItem>
						</Select>
					</FormControl>
					<FormControl fullWidth>
						<InputLabel>Langue</InputLabel>
						<Select
							value={settings.language}
							onChange={(e) =>
								setSettings({ ...settings, language: e.target.value })
							}
							label='Langue'
						>
							<MenuItem value='en'>English</MenuItem>
							<MenuItem value='fr'>Français</MenuItem>
							<MenuItem value='es'>Español</MenuItem>
							<MenuItem value='de'>Deutsch</MenuItem>
						</Select>
					</FormControl>
				</Box>
			</Paper>

			<Paper sx={{ p: 3, mb: 3 }}>
				<Typography variant='h6' gutterBottom>
					Notifications
				</Typography>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
					<FormControlLabel
						control={
							<Switch
								checked={settings.notifications.email}
								onChange={handleNotificationChange('email')}
							/>
						}
						label='Notifications par email'
					/>
					<FormControlLabel
						control={
							<Switch
								checked={settings.notifications.sms}
								onChange={handleNotificationChange('sms')}
							/>
						}
						label='Notifications par SMS'
					/>
					<FormControlLabel
						control={
							<Switch
								checked={settings.notifications.push}
								onChange={handleNotificationChange('push')}
							/>
						}
						label='Notifications push'
					/>
				</Box>
			</Paper>

			<Paper sx={{ p: 3, mb: 3 }}>
				<Typography variant='h6' gutterBottom>
					Security
				</Typography>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
					<FormControlLabel
						control={
							<Switch
								checked={settings.security.twoFactorAuth}
								onChange={handleSecurityChange('twoFactorAuth')}
							/>
						}
						label='Two-Factor Authentication'
					/>
					<TextField
						fullWidth
						label='Session Timeout (minutes)'
						type='number'
						value={settings.security.sessionTimeout}
						onChange={(e) =>
							setSettings({
								...settings,
								security: {
									...settings.security,
									sessionTimeout: parseInt(e.target.value) || 30,
								},
							})
						}
						inputProps={{ min: 5, max: 480 }}
					/>
				</Box>
			</Paper>

			<Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
				<Button
					variant='contained'
					startIcon={<SaveIcon />}
					onClick={handleSave}
					size='large'
				>
					Save Settings
				</Button>
			</Box>
		</Box>
	);
}
