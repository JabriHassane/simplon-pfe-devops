import { Box, Typography, Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import ResourceTable from '../../shared/ResourceTable';
import { formatDate } from '../../../utils/date.utils';
import { formatPrice } from '../../../utils/price.utils';
import type { TransactionDto } from '../../../../../shared/dtos/transaction.dto';

interface OrderPaymentsProps {
	payments: TransactionDto[];
	onOpenFormPopup?: (resource: TransactionDto | null, index?: number) => void;
	onOpenDeletePopup?: (resource: TransactionDto, index: number) => void;
	showRef?: boolean;
}

export const OrderPayments = ({
	payments,
	onOpenFormPopup,
	onOpenDeletePopup,
	showRef = false,
}: OrderPaymentsProps) => {
	const headers = [
		{ id: 'date', name: 'Date' },
		{ id: 'agent', name: 'Agent' },
		{ id: 'amount', name: 'Montant' },
	];

	if (showRef) {
		headers.unshift({ id: 'ref', name: 'Ref' });
	}

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
					onClick={() => onOpenFormPopup?.(null)}
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
					},
				}))}
				onEdit={(item, index) => onOpenFormPopup?.(item, index)}
				onDelete={(item, index) => onOpenDeletePopup?.(item, index)}
			/>
		</>
	);
};
