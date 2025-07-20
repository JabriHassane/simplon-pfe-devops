import {
	Typography,
	Box,
	Paper,
	Card,
	CardContent,
	Button,
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
	Inventory as InventoryIcon,
	People as PeopleIcon,
	Add as AddIcon,
	Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAccounts } from '../hooks/ressources/useAccounts';
import { useTransactions } from '../hooks/ressources/useTransactions';
import { useProducts } from '../hooks/ressources/useProducts';
import { useClients } from '../hooks/ressources/useClients';
import { useSuppliers } from '../hooks/ressources/useSuppliers';

export default function Dashboard() {
	const navigate = useNavigate();

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

	const isLoading =
		accountsLoading ||
		transactionsLoading ||
		productsLoading ||
		clientsLoading ||
		suppliersLoading;
	const error =
		accountsError ||
		transactionsError ||
		productsError ||
		clientsError ||
		suppliersError;

	// Calculate dashboard stats
	const totalRevenue = transactions!.data
		.filter((t) => t.type === 'order')
		.reduce((sum, t) => sum + t.amount, 0);

	const totalExpenses = transactions!.data
		.filter((t) => t.type === 'purchase')
		.reduce((sum, t) => sum + t.amount, 0);

	const recentTransactions = transactions?.data.slice(0, 5).map((t) => ({
		id: t.id,
		type: t.type,
		amount: t.amount,
		date: t.date,
	}));

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString();
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
				Tableau de bord
			</Typography>

			{error && (
				<Alert severity='error' sx={{ mb: 2 }}>
					Échec du chargement des données du tableau de bord
				</Alert>
			)}

			{/* Quick Actions */}
			<Paper sx={{ p: 3, mb: 3 }} variant='outlined'>
				<Typography variant='h6' gutterBottom>
					Actions rapides
				</Typography>
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: {
							xs: '1fr',
							sm: '1fr 1fr',
							md: '1fr 1fr 1fr 1fr',
						},
						gap: 2,
					}}
				>
					<Button
						variant='outlined'
						startIcon={<AddIcon />}
						onClick={() => navigate('/clients')}
						fullWidth
					>
						Ajouter un client
					</Button>
					<Button
						variant='outlined'
						startIcon={<AddIcon />}
						onClick={() => navigate('/products')}
						fullWidth
					>
						Ajouter un produit
					</Button>
					<Button
						variant='outlined'
						startIcon={<AddIcon />}
						onClick={() => navigate('/transactions')}
						fullWidth
					>
						Ajouter une transaction
					</Button>
					<Button
						variant='outlined'
						startIcon={<AddIcon />}
						onClick={() => navigate('/sales')}
						fullWidth
					>
						Nouvelle vente
					</Button>
				</Box>
			</Paper>

			{/* Stats Cards */}
			<Box
				sx={{
					display: 'grid',
					gridTemplateColumns: {
						xs: '1fr',
						sm: '1fr 1fr',
						md: '1fr 1fr 1fr 1fr',
					},
					gap: 3,
					mb: 3,
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
									Total Revenue
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
									Total Expenses
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
									Active Products
								</Typography>
								<Typography variant='h4' color='primary.main'>
									{products?.data.length}
								</Typography>
							</Box>
							<InventoryIcon color='primary' sx={{ fontSize: 40 }} />
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
									Active Clients
								</Typography>
								<Typography variant='h4' color='info.main'>
									{clients?.data.length}
								</Typography>
							</Box>
							<PeopleIcon color='info' sx={{ fontSize: 40 }} />
						</Box>
					</CardContent>
				</Card>
			</Box>

			<Box
				display='flex'
				justifyContent='space-between'
				alignItems='center'
				mb={2}
			>
				<Typography variant='h6'>Recent Transactions</Typography>
				<Button
					variant='outlined'
					startIcon={<ViewIcon />}
					onClick={() => navigate('/transactions')}
				>
					View All
				</Button>
			</Box>

			<TableContainer>
				<Table size='small'>
					<TableHead>
						<TableRow>
							<TableCell>Date</TableCell>
							<TableCell align='right'>Type</TableCell>
							<TableCell align='right'>Montant</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{recentTransactions?.map((transaction) => (
							<TableRow key={transaction.id}>
								<TableCell>{formatDate(transaction.date.toString())}</TableCell>
								<TableCell align='right'>
									{transaction.type === 'order'
										? 'Vente'
										: transaction.type === 'purchase'
										? 'Achat'
										: 'Transfert'}
								</TableCell>
								<TableCell align='right'>
									{formatCurrency(transaction.amount)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
}
