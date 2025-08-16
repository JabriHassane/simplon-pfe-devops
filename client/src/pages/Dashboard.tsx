import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import { usePaymentMethodStats } from '../hooks/ressources/useTransactions';
import { formatPrice } from '../utils/price.utils';
import {
	PAYMENT_METHODS_COLOR_MAP,
	TRANSACTION_METHODS,
	type TransactionMethod,
} from '../../../shared/constants';
import ResourceHeader from '../components/shared/ResourceHeader';
import Orders from './Orders';
import { DICT } from '../i18n/fr';

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
	<Grid size={{ xs: 6, md: 3 }}>
		<Card variant='outlined'>
			<CardContent
				sx={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					height: { xs: '150px', md: '200px' },
					px: 0,
					pt: 4,
				}}
			>
				<img src={`/${type}.png`} alt={title} style={{ height: '60%' }} />

				<Typography variant='h5' color={color} fontWeight='bold' mt={1}>
					{formatPrice(amount)}
				</Typography>

				<Typography variant='body1' color='text.secondary' mt={1}>
					{DICT.methods[type]}
				</Typography>
			</CardContent>
		</Card>
	</Grid>
);

function Dashboard() {
	const { data: paymentStats, error } = usePaymentMethodStats();

	return (
		<>
			<ResourceHeader title='Tableau de bord' error={!!error} />

			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
				<Grid container spacing={2}>
					{TRANSACTION_METHODS.map((method, index) => (
						<PaymentMethodCard
							key={index}
							title={method}
							amount={paymentStats?.[method] || 0}
							color={PAYMENT_METHODS_COLOR_MAP[method]}
							type={method}
						/>
					))}
				</Grid>

				<Card variant='outlined' sx={{ p: 3 }}>
					<Orders type='sale' onlyUnprocessedPayments />
				</Card>
			</Box>
		</>
	);
}

export default Dashboard;
