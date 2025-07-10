import { useState } from 'react';
import { Box, Typography, Button, Paper, Chip, Stack } from '@mui/material';
import ResourcePickerField from './ResourcePickerField';

export default function ResourcePickerExample() {
	const [selectedClient, setSelectedClient] = useState<
		{ id: string; name: string; email?: string } | undefined
	>(undefined);
	const [selectedProduct, setSelectedProduct] = useState<
		{ id: string; name: string; reference?: string } | undefined
	>(undefined);
	const [selectedAccount, setSelectedAccount] = useState<
		{ id: string; name: string; balance?: number } | undefined
	>(undefined);

	return (
		<Box sx={{ p: 3 }}>
			<Typography variant='h4' gutterBottom>
				ResourcePicker Examples
			</Typography>

			<Paper sx={{ p: 3, mb: 3 }}>
				<Typography variant='h6' gutterBottom>
					ResourcePickerField Examples
				</Typography>

				<Stack spacing={3}>
					<ResourcePickerField
						label='Select Client'
						value={selectedClient?.id || ''}
						onChange={(value) => {
							// In a real app, you would fetch the client details here
							setSelectedClient({
								id: value,
								name: 'Selected Client',
								email: 'client@example.com',
							});
						}}
						resourceType='client'
						placeholder='Click to select a client...'
						selectedResource={selectedClient}
					/>

					<ResourcePickerField
						label='Select Product'
						value={selectedProduct?.id || ''}
						onChange={(value) => {
							setSelectedProduct({
								id: value,
								name: 'Selected Product',
								reference: 'PROD-001',
							});
						}}
						resourceType='product'
						placeholder='Click to select a product...'
						selectedResource={selectedProduct}
					/>

					<ResourcePickerField
						label='Select Account'
						value={selectedAccount?.id || ''}
						onChange={(value) => {
							setSelectedAccount({
								id: value,
								name: 'Selected Account',
								balance: 1000,
							});
						}}
						resourceType='account'
						placeholder='Click to select an account...'
						selectedResource={selectedAccount}
					/>
				</Stack>

				<Box sx={{ mt: 3 }}>
					<Typography variant='subtitle2' gutterBottom>
						Selected Values:
					</Typography>
					<Stack direction='row' spacing={1} flexWrap='wrap'>
						{selectedClient && (
							<Chip label={`Client: ${selectedClient.name}`} color='primary' />
						)}
						{selectedProduct && (
							<Chip
								label={`Product: ${selectedProduct.name}`}
								color='secondary'
							/>
						)}
						{selectedAccount && (
							<Chip
								label={`Account: ${selectedAccount.name}`}
								color='success'
							/>
						)}
					</Stack>
				</Box>
			</Paper>

			<Paper sx={{ p: 3 }}>
				<Typography variant='h6' gutterBottom>
					Direct ResourcePicker Usage
				</Typography>

				<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
					<Button
						variant='outlined'
						onClick={() => {
							// This would open the ResourcePicker directly
							console.log('Open client picker');
						}}
					>
						Pick Client
					</Button>
					<Button
						variant='outlined'
						onClick={() => {
							console.log('Open product picker');
						}}
					>
						Pick Product
					</Button>
					<Button
						variant='outlined'
						onClick={() => {
							console.log('Open supplier picker');
						}}
					>
						Pick Supplier
					</Button>
					<Button
						variant='outlined'
						onClick={() => {
							console.log('Open account picker');
						}}
					>
						Pick Account
					</Button>
				</Box>
			</Paper>
		</Box>
	);
}
