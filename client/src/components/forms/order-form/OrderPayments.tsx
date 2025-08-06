import { useFormContext } from 'react-hook-form';
import { Box, Typography, Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import {
	type CreateOrderDtoType,
	type PaymentDtoType,
} from '../../../../../shared/dtos/order.dto';
import ResourceTable from '../../shared/ResourceTable';
import { formatDate } from '../../../utils/date.utils';
import { formatPrice } from '../../../utils/price.utils';
import PaymentFormPopup from './OrderPaymentFormPopup';
import { useEffect, useState } from 'react';
import usePopups from '../../../hooks/useCrud';
import ResourceDeleteConfirmation from '../../shared/ResourceDeleteConfirmation';

interface OrderPaymentsProps {
	init?: PaymentDtoType[];
}

export const OrderPayments = ({ init }: OrderPaymentsProps) => {
	const { setValue } = useFormContext<CreateOrderDtoType>();

	const {
		openFormPopup,
		openDeletePopup,
		selectedResource: selectedPayment,
		selectedIndex,
		handleOpenFormPopup,
		handleOpenDeletePopup,
		handleClosePopup,
	} = usePopups<PaymentDtoType>();

	const [payments, setPayments] = useState<PaymentDtoType[]>(init || []);

	const handleSubmit = (payment: PaymentDtoType) => {
		const newPayments = [...payments];
		if (selectedPayment) {
			newPayments[selectedIndex] = payment;
		} else {
			newPayments.push(payment);
		}
		setPayments(newPayments);
		handleClosePopup();
	};

	const handleRemove = () => {
		const newPayments = [...payments];
		newPayments.splice(selectedIndex, 1);
		setPayments(newPayments);
	};

	useEffect(() => {
		setValue('payments', payments);
	}, [payments]);

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
				headers={[
					{ id: 'ref', name: 'Ref' },
					{ id: 'date', name: 'Date' },
					{ id: 'agent', name: 'Agent' },
					{ id: 'amount', name: 'Montant' },
				]}
				rows={payments.map((payment) => ({
					item: payment,
					data: {
						ref: payment.ref,
						date: formatDate(payment.date),
						agent: payment.agent?.name || '-',
						amount: formatPrice(payment.amount),
					},
				}))}
				onEdit={handleOpenFormPopup}
				onDelete={handleOpenDeletePopup}
			/>

			{openFormPopup && (
				<PaymentFormPopup
					init={selectedPayment}
					onSubmit={handleSubmit}
					onClose={handleClosePopup}
				/>
			)}

			{openDeletePopup && (
				<ResourceDeleteConfirmation
					onClose={handleClosePopup}
					title={`Supprimer ${selectedPayment?.ref}`}
					description='Voulez-vous vraiment supprimer ce paiement ?'
					onDelete={handleRemove}
				/>
			)}
		</>
	);
};
