import { Box, Typography, Button, Chip } from '@mui/material';
import { Add } from '@mui/icons-material';
import ResourceTable from '../../shared/ResourceTable';
import { formatDate } from '../../../utils/date.utils';
import { formatPrice } from '../../../utils/price.utils';
import type { TransactionDto } from '../../../../../shared/dtos/transaction.dto';
import PaymentFormPopup from './OrderPaymentFormPopup';
import ConfirmationPopup from '../../shared/ConfirmationPopup';
import usePopups from '../../../hooks/usePopups';
import { useFormContext } from 'react-hook-form';
import type {
	CreateOrderDto,
	CreatePaymentDto,
	PaymentDto,
} from '../../../../../shared/dtos/order.dto';
import { DICT } from '../../../i18n/fr';
import { PAYMENT_METHODS_COLOR_MAP } from '../../../../../shared/constants';

interface OrderPaymentsProps {
	showRef?: boolean;
	totalDue: number;
}

export const OrderPayments = ({
	showRef = false,
	totalDue,
}: OrderPaymentsProps) => {
	const headers = [
		{ id: 'date', name: 'Date' },
		{ id: 'agent', name: 'Agent' },
		{ id: 'amount', name: 'Montant' },
		{ id: 'method', name: 'Méthode' },
	];

	if (showRef) {
		headers.unshift({ id: 'ref', name: 'Ref' });
	}

	const { setValue, watch } = useFormContext<CreateOrderDto>();

	const {
		openFormPopup,
		openDeletePopup,
		selectedResource: selectedPayment,
		selectedIndex,
		handleOpenFormPopup,
		handleOpenDeletePopup,
		handleClosePopup,
	} = usePopups<TransactionDto>();

	const payments = (watch('payments') || []) as PaymentDto[];

	const handlePaymentSubmit = (payment: CreatePaymentDto) => {
		const newPayments = [...payments];
		if (selectedPayment) {
			newPayments[selectedIndex] = payment as PaymentDto;
		} else {
			newPayments.push(payment as PaymentDto);
		}
		newPayments.sort((a, b) => b.date.localeCompare(a.date));
		setValue('payments', newPayments);
		handleClosePopup();
	};

	const handlePaymentRemove = () => {
		const newPayments = [...payments];
		newPayments.splice(selectedIndex, 1);
		setValue('payments', newPayments);
		handleClosePopup();
	};

	return (
		<>
			<Box
				display='flex'
				gap={2}
				alignItems='center'
				justifyContent='space-between'
				my={2}
			>
				<Typography variant='h6'>Paiements</Typography>

				<Button
					onClick={() => handleOpenFormPopup(null)}
					variant='contained'
					disableElevation
					startIcon={<Add />}
				>
					Ajouter
				</Button>
			</Box>

			<ResourceTable
				headers={headers}
				rows={payments.map((payment) => ({
					item: payment,
					data: {
						ref: payment.ref,
						date: formatDate(payment.date),
						agent: payment.agent?.name || '-',
						amount: formatPrice(payment.amount),
						method: (
							<Chip
								label={DICT.methods[payment.method]}
								color={PAYMENT_METHODS_COLOR_MAP[payment.method]}
								size='small'
								sx={{ px: 0.5 }}
							/>
						),
					},
				}))}
				onEdit={handleOpenFormPopup}
				onDelete={handleOpenDeletePopup}
			/>

			{openFormPopup && (
				<PaymentFormPopup
					init={selectedPayment}
					totalDue={totalDue}
					onSubmit={handlePaymentSubmit}
					onClose={handleClosePopup}
				/>
			)}

			{openDeletePopup && (
				<ConfirmationPopup
					onClose={handleClosePopup}
					title={`Supprimer ${selectedPayment?.ref}`}
					description='Voulez-vous vraiment supprimer ce paiement ?'
					onDelete={handlePaymentRemove}
				/>
			)}
		</>
	);
};
