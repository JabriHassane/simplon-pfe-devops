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
import Orders from './Orders';

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
	const { data: paymentStats, error } = usePaymentMethodStats();

	return (
		<>
			<ResourceHeader title='Tableau de bord' error={!!error} />

			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
						gap: 3,
					}}
				>
					{TRANSACTION_METHODS.map((method, index) => (
						<PaymentMethodCard
							key={index}
							title={method}
							amount={paymentStats?.[method] || 0}
							color={PAYMENT_METHODS_COLOR_MAP[method]}
							type={method}
						/>
					))}
				</Box>

				<Card variant='outlined' sx={{ p: 3 }}>
					<Orders type='sale' status='partially_paid' />
				</Card>

				<Card variant='outlined' sx={{ p: 3 }}>
					<Orders type='purchase' status='partially_paid' />
				</Card>
			</Box>
		</>
	);
}

export default Dashboard;
