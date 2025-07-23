import { Chip, IconButton } from '@mui/material';

import {
	Table,
	TableBody,
	TableCell,
	TableRow,
	TableHead,
} from '@mui/material';
import {
	DeleteOutline,
	EditOutlined,
	HistoryOutlined,
	PaidOutlined,
	PointOfSaleOutlined,
} from '@mui/icons-material';
import { useState } from 'react';
import { formatPrice } from '../../utils/price.utils';
import { formatDate } from '../../utils/date.utils';
import type { SaleDtoType } from '../../../../shared/dtos/sale.dto';
import type { PurchaseDtoType } from '../../../../shared/dtos/purchase.dto';
import { DICT } from '../../i18n/fr';
import { PAYMENT_METHODS_COLOR_MAP } from '../../../../shared/constants';
import type { OrderPaymentDtoType } from '../../../../shared/dtos/order.dto';

interface ResourceTableHeader {
	id: string;
	name: string;
}

interface ResourceTableRowData {
	[key: string]: React.ReactNode;
}

interface ResourceTableRow {
	item: any;
	data: ResourceTableRowData;
	items?: ResourceTableRow[];
	payments?: ResourceTableRow[];
}

interface Props {
	headers: ResourceTableHeader[];
	itemsHeaders?: ResourceTableHeader[];
	paymentsHeaders?: ResourceTableHeader[];
	rows?: ResourceTableRow[];
	onEdit: (item: any, index: number) => void;
	onDelete: (item: any, index: number) => void;
	isOrder?: boolean;
	isPayment?: boolean;
}

function ResourceTable({
	headers,
	rows,
	onEdit,
	onDelete,
	isOrder,
	isPayment,
}: Props) {
	if (!rows || rows.length === 0) return null;

	return (
		<Table size='small'>
			<TableHead sx={{ backgroundColor: 'background.default' }}>
				<TableRow>
					{headers.map((header) => (
						<TableCell key={header.id} sx={{ fontWeight: 'bold' }}>
							{header.name}
						</TableCell>
					))}
					<TableCell></TableCell>
				</TableRow>
			</TableHead>

			<TableBody>
				{rows?.map((row, index) => (
					<Row
						key={index}
						index={index}
						headers={headers}
						row={row}
						onEdit={onEdit}
						onDelete={onDelete}
						isOrder={isOrder}
						isPayment={isPayment}
					/>
				))}
			</TableBody>
		</Table>
	);
}

export default ResourceTable;

interface RowProps {
	index: number;
	row: ResourceTableRow;
	headers: ResourceTableHeader[];
	onEdit: (item: any, index: number) => void;
	onDelete: (item: any, index: number) => void;
	isOrder?: boolean;
	isPayment?: boolean;
}

function Row({
	index,
	row,
	headers,
	onEdit,
	onDelete,
	isOrder,
	isPayment,
}: RowProps) {
	const [showPayments, setShowPayments] = useState(false);

	const paymentsHeaders = [
		{ id: 'ref', name: 'Ref' },
		{ id: 'date', name: 'Date' },
		{ id: 'amount', name: 'Montant' },
		{ id: 'agent', name: 'Agent' },
		{ id: 'method', name: 'Méthode de paiement' },
	];

	const order = row.item as SaleDtoType | PurchaseDtoType;

	let payments: ResourceTableRow[] = [];

	if (isOrder) {
		payments = order.payments.map((payment) => ({
			item: payment,
			data: {
				ref: payment.ref,
				date: formatDate(payment.date),
				amount: formatPrice(payment.amount),
				agent: payment.agent?.name,
				method: (
					<Chip
						label={DICT.methods[payment.method]}
						color={PAYMENT_METHODS_COLOR_MAP[payment.method]}
						size='small'
						sx={{ px: 0.5 }}
					/>
				),
			},
		}));
	}

	const payment = row.item as OrderPaymentDtoType;

	const showCashing =
		isPayment && payment.method !== 'cash' && !payment.isCashed;

	return (
		<>
			<TableRow>
				{headers.map((header) => (
					<TableCell key={header.id}>{row.data[header.id]}</TableCell>
				))}

				<TableCell align='right'>
					{showCashing && (
						<IconButton onClick={() => null} size='small'>
							<PaidOutlined />
						</IconButton>
					)}

					{isOrder && (
						<IconButton
							onClick={() => setShowPayments(!showPayments)}
							size='small'
							color={showPayments ? 'info' : 'default'}
							disabled={payments.length === 0}
						>
							<HistoryOutlined />
						</IconButton>
					)}

					<IconButton onClick={() => onEdit(row.item, index)} size='small'>
						<EditOutlined />
					</IconButton>

					<IconButton onClick={() => onDelete(row.item, index)} size='small'>
						<DeleteOutline />
					</IconButton>
				</TableCell>
			</TableRow>

			{isOrder && showPayments && (
				<TableRow>
					<TableCell sx={{ py: 0, pr: 0, px: 11 }} colSpan={12}>
						{showPayments && (
							<ResourceTable
								headers={paymentsHeaders}
								rows={payments}
								onEdit={onEdit}
								onDelete={onDelete}
								isPayment
							/>
						)}
					</TableCell>
				</TableRow>
			)}
		</>
	);
}
