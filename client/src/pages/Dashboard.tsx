import { Box, Card, CardContent, Typography } from '@mui/material';
import { usePaymentMethodStats } from '../hooks/ressources/useTransactions';
import { formatPrice } from '../utils/price.utils';
import {
	PAYMENT_METHODS_COLOR_MAP,
	TRANSACTION_METHODS,
	type TransactionMethod,
} from '../../../shared/constants';
import { DICT } from '../i18n/fr';
import ResourceHeader from '../components/shared/ResourceHeader';

const PaymentMethodCard = ({
	title,
	amount,
	color,
	type,
}: {
	title: string;
	amount: number;
	color: string;
	type: TransactionMethod;
}) => (
	<Card
		sx={{
			height: '100%',
			display: 'flex',
			flexDirection: 'column',
			borderColor: color,
		}}
		variant='outlined'
	>
		<CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
			<img
				src={`/${type}.png`}
				alt={title}
				style={{ width: '100px', height: '100px' }}
			/>

			<Typography variant='h4' color={color} fontWeight='bold' mt={1}>
				{formatPrice(amount)}
			</Typography>
			<Typography variant='h5' color={color} fontWeight='bold' mt={1}>
				{DICT.methods[type]}
			</Typography>
		</CardContent>
	</Card>
);

function Dashboard() {
	const { data: paymentStats, isLoading, error } = usePaymentMethodStats();

	if (isLoading) {
		return (
			<Box sx={{ p: 3 }}>
				<Typography variant='h4' gutterBottom>
					Tableau de bord
				</Typography>
				<Typography>Chargement...</Typography>
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ p: 3 }}>
				<Typography variant='h4' gutterBottom>
					Tableau de bord
				</Typography>
				<Typography color='error'>
					Erreur lors du chargement des données
				</Typography>
			</Box>
		);
	}

	return (
		<>
			<ResourceHeader title='Opérations' error={!!error} />

			<Box
				sx={{
					display: 'grid',
					gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
					gap: 3,
				}}
			>
				{TRANSACTION_METHODS.map((method) => (
					<PaymentMethodCard
						title={method}
						amount={paymentStats?.[method] || 0}
						color={PAYMENT_METHODS_COLOR_MAP[method]}
						type={method}
					/>
				))}
			</Box>
		</>
	);
}

export default Dashboard;
