import {
	Box,
	Card,
	CircularProgress,
	Grid, Typography
} from '@mui/material';
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
	isLoading,
}: {
	title: string;
	amount: number;
	color: string;
	type: TransactionMethod;
	isLoading?: boolean;
}) => (
	<Grid
		size={{ xs: 6, md: 3 }}
		sx={{
			display: 'flex',
			flexDirection: { xs: 'column', md: 'row' },
			alignItems: 'center',
			justifyContent: 'center',
			height: { xs: '100px', md: '120px' },
			px: 0,
			gap: { xs: 1, md: 3 },
		}}
	>
		<img src={`/${type}.png`} alt={title} style={{ height: '60%' }} />

		<Box
			sx={{
				textAlign: { xs: 'center', md: 'left' },
				...(isLoading
					? { display: 'flex', flexDirection: 'column', alignItems: 'center' }
					: {}),
			}}
		>
			{isLoading ? (
				<CircularProgress
					size={23}
					color={color as any}
					sx={{ mx: 'auto', mb: 1 }}
				/>
			) : (
				<Typography variant='h5' color={color} fontWeight='bold'>
					{formatPrice(amount)}
				</Typography>
			)}
			<Typography variant='body1' color='text.secondary'>
				{DICT.methods[type]}
			</Typography>
		</Box>
	</Grid>
);

function Dashboard() {
	const { data: paymentStats, error, isLoading } = usePaymentMethodStats();

	return (
		<>
			<ResourceHeader title='Tableau de bord' error={!!error} />

			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
				<Card variant='outlined' sx={{ p: { xs: 3, md: 0 } }}>
					<Grid container rowSpacing={6}>
						{TRANSACTION_METHODS.map((method, index) => (
							<PaymentMethodCard
								key={index}
								title={method}
								amount={paymentStats?.[method] || 0}
								color={PAYMENT_METHODS_COLOR_MAP[method]}
								type={method}
								isLoading={isLoading}
							/>
						))}
					</Grid>
				</Card>

				<Card variant='outlined' sx={{ p: 3 }}>
					<Orders type='sale' onlyUnprocessedPayments hideDrawerButton />
				</Card>
			</Box>
		</>
	);
}

export default Dashboard;
