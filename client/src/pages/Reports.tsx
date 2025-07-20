import React from 'react';
import {
	Typography,
	Box,
	Paper,
	Grid,
	Card,
	CardContent,
	Alert,
	CircularProgress,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from '@mui/material';
import {
	TrendingUp as TrendingUpIcon,
	TrendingDown as TrendingDownIcon,
	AccountBalance as AccountBalanceIcon,
	ShoppingCart as ShoppingCartIcon,
	Inventory as InventoryIcon,
	People as PeopleIcon,
} from '@mui/icons-material';
import { useAccounts } from '../hooks/ressources/useAccounts';
import { useTransactions } from '../hooks/ressources/useTransactions';
import { useProducts } from '../hooks/ressources/useProducts';
import { useClients } from '../hooks/ressources/useClients';
import { useSuppliers } from '../hooks/ressources/useSuppliers';
import { useOrders } from '../hooks/ressources/useOrders';
import { usePurchases } from '../hooks/ressources/usePurchases';
import { formatDate, formatDateTime } from '../utils/date.utils';

export default function Reports() {
	// TanStack Query hooks
	const {
		data: accounts,
		isLoading: accountsLoading,
		error: accountsError,
	} = useAccounts();
	const {
		data: transactions,
		isLoading: transactionsLoading,
		error: transactionsError,
	} = useTransactions();
	const {
		data: products,
		isLoading: productsLoading,
		error: productsError,
	} = useProducts();
	const {
		data: clients,
		isLoading: clientsLoading,
		error: clientsError,
	} = useClients();
	const {
		data: suppliers,
		isLoading: suppliersLoading,
		error: suppliersError,
	} = useSuppliers();
	const {
		data: orders,
		isLoading: ordersLoading,
		error: ordersError,
	} = useOrders();
	const {
		data: purchases,
		isLoading: purchasesLoading,
		error: purchasesError,
	} = usePurchases();

	const isLoading =
		accountsLoading ||
		transactionsLoading ||
		productsLoading ||
		clientsLoading ||
		suppliersLoading ||
		ordersLoading ||
		purchasesLoading;
	const error =
		accountsError ||
		transactionsError ||
		productsError ||
		clientsError ||
		suppliersError ||
		ordersError ||
		purchasesError;

	// Calculate basic stats
	const totalRevenue =
		transactions?.data
			.filter((t) => t.type === 'order')
			.reduce((sum, t) => sum + t.amount, 0) || 0;

	const totalExpenses =
		transactions?.data
			.filter((t) => t.type === 'purchase')
			.reduce((sum, t) => sum + t.amount, 0) || 0;

	const totalSales =
		orders?.data.reduce((sum, order) => sum + order.totalPrice, 0) || 0;

	const totalPurchases =
		purchases?.data.reduce((sum, purchase) => sum + purchase.totalPrice, 0) ||
		0;

	const activeProducts = products?.data.length || 0;
	const activeClients = clients?.data.length || 0;
	const activeSuppliers = suppliers?.data.length || 0;

	const recentTransactions = transactions?.data || [];

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(amount);
	};

	if (isLoading) {
		return (
			<Box
				display='flex'
				justifyContent='center'
				alignItems='center'
				minHeight='400px'
			>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box>
			<Typography variant='h4' gutterBottom>
				Rapports et analyses
			</Typography>

			{error && (
				<Alert severity='error' sx={{ mb: 2 }}>
					Échec du chargement des données de rapports
				</Alert>
			)}

			{/* Key Metrics */}
			<Box
				sx={{
					display: 'grid',
					gridTemplateColumns: {
						xs: '1fr',
						sm: '1fr 1fr',
						md: '1fr 1fr 1fr 1fr',
					},
					gap: 3,
					mb: 4,
				}}
			>
				<Card variant='outlined'>
					<CardContent>
						<Box
							display='flex'
							alignItems='center'
							justifyContent='space-between'
						>
							<Box>
								<Typography color='textSecondary' gutterBottom>
									Revenus totaux
								</Typography>
								<Typography variant='h4' color='success.main'>
									{formatCurrency(totalRevenue)}
								</Typography>
							</Box>
							<TrendingUpIcon color='success' sx={{ fontSize: 40 }} />
						</Box>
					</CardContent>
				</Card>

				<Card variant='outlined'>
					<CardContent>
						<Box
							display='flex'
							alignItems='center'
							justifyContent='space-between'
						>
							<Box>
								<Typography color='textSecondary' gutterBottom>
									Dépenses totales
								</Typography>
								<Typography variant='h4' color='error.main'>
									{formatCurrency(totalExpenses)}
								</Typography>
							</Box>
							<TrendingDownIcon color='error' sx={{ fontSize: 40 }} />
						</Box>
					</CardContent>
				</Card>

				<Card variant='outlined'>
					<CardContent>
						<Box
							display='flex'
							alignItems='center'
							justifyContent='space-between'
						>
							<Box>
								<Typography color='textSecondary' gutterBottom>
									Total Sales
								</Typography>
								<Typography variant='h4' color='primary.main'>
									{formatCurrency(totalSales)}
								</Typography>
							</Box>
							<ShoppingCartIcon color='primary' sx={{ fontSize: 40 }} />
						</Box>
					</CardContent>
				</Card>

				<Card variant='outlined'>
					<CardContent>
						<Box
							display='flex'
							alignItems='center'
							justifyContent='space-between'
						>
							<Box>
								<Typography color='textSecondary' gutterBottom>
									Total Purchases
								</Typography>
								<Typography variant='h4' color='warning.main'>
									{formatCurrency(totalPurchases)}
								</Typography>
							</Box>
							<InventoryIcon color='warning' sx={{ fontSize: 40 }} />
						</Box>
					</CardContent>
				</Card>
			</Box>

			{/* Additional Stats */}
			<Grid container spacing={3} sx={{ mb: 4 }}>
				<Grid>
					<Card variant='outlined'>
						<CardContent>
							<Box
								display='flex'
								alignItems='center'
								justifyContent='space-between'
							>
								<Box>
									<Typography color='textSecondary' gutterBottom>
										Active Products
									</Typography>
									<Typography variant='h4' color='primary.main'>
										{activeProducts}
									</Typography>
								</Box>
								<InventoryIcon color='primary' sx={{ fontSize: 40 }} />
							</Box>
						</CardContent>
					</Card>
				</Grid>

				<Grid>
					<Card variant='outlined'>
						<CardContent>
							<Box
								display='flex'
								alignItems='center'
								justifyContent='space-between'
							>
								<Box>
									<Typography color='textSecondary' gutterBottom>
										Active Clients
									</Typography>
									<Typography variant='h4' color='info.main'>
										{activeClients}
									</Typography>
								</Box>
								<PeopleIcon color='info' sx={{ fontSize: 40 }} />
							</Box>
						</CardContent>
					</Card>
				</Grid>

				<Grid>
					<Card variant='outlined'>
						<CardContent>
							<Box
								display='flex'
								alignItems='center'
								justifyContent='space-between'
							>
								<Box>
									<Typography color='textSecondary' gutterBottom>
										Active Suppliers
									</Typography>
									<Typography variant='h4' color='secondary.main'>
										{activeSuppliers}
									</Typography>
								</Box>
								<PeopleIcon color='secondary' sx={{ fontSize: 40 }} />
							</Box>
						</CardContent>
					</Card>
				</Grid>
			</Grid>

			{/* Recent Transactions */}
			<Typography variant='h6' gutterBottom>
				Recent Transactions
			</Typography>

			<TableContainer>
				<Table size='small'>
					<TableHead>
						<TableRow>
							<TableCell>Date</TableCell>
							<TableCell>Type</TableCell>
							<TableCell align='right'>Amount</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{recentTransactions.map((transaction) => (
							<TableRow key={transaction.id}>
								<TableCell>{formatDate(transaction.date)}</TableCell>
								<TableCell>
									<Box
										sx={{
											px: 1,
											py: 0.5,
											borderRadius: 1,
											backgroundColor:
												transaction.type === 'order'
													? 'success.light'
													: 'error.light',
											color:
												transaction.type === 'order'
													? 'success.dark'
													: 'error.dark',
											display: 'inline-block',
										}}
									>
										{transaction.type}
									</Box>
								</TableCell>
								<TableCell align='right'>
									<Typography
										color={
											transaction.type === 'order'
												? 'success.main'
												: 'error.main'
										}
										fontWeight='bold'
									>
										{transaction.type === 'order' ? '+' : '-'}
										{formatCurrency(transaction.amount)}
									</Typography>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
}
