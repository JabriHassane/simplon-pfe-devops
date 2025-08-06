import { Chip, IconButton, TablePagination } from '@mui/material';

import {
	Table,
	TableBody,
	TableCell,
	TableRow,
	TableHead,
} from '@mui/material';
import {
	AccountBalanceOutlined,
	DeleteOutline,
	EditOutlined,
	HistoryOutlined,
	PaidOutlined,
} from '@mui/icons-material';
import { useState } from 'react';
import { formatPrice } from '../../utils/price.utils';
import { formatDate } from '../../utils/date.utils';
import type { OrderDtoType } from '../../../../shared/dtos/order.dto';
import { DICT } from '../../i18n/fr';
import { PAYMENT_METHODS_COLOR_MAP } from '../../../../shared/constants';
import type { PaymentDtoType } from '../../../../shared/dtos/order.dto';
import type { Pagination } from '../../types/pagination.types';

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
	pagination?: Pagination;
	onPageChange?: (page: number) => void;
	onRowsPerPageChange?: (pageSize: number) => void;
}

function ResourceTable({
	headers,
	rows,
	onEdit,
	onDelete,
	isOrder,
	isPayment,
	pagination,
	onPageChange,
	onRowsPerPageChange,
}: Props) {
	return (
		<>
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

			{pagination && (
				<TablePagination
					component='div'
					count={pagination.total}
					page={pagination.page}
					onPageChange={(_, newPage) => onPageChange?.(newPage)}
					rowsPerPage={pagination.pageSize}
					onRowsPerPageChange={(event) =>
						onRowsPerPageChange?.(parseInt(event.target.value))
					}
					rowsPerPageOptions={[5, 10, 25, 50]}
					labelRowsPerPage='Lignes par page:'
					labelDisplayedRows={({ from, to, count }) =>
						`${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
					}
					sx={{ mt: 2 }}
				/>
			)}
		</>
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

	const order = row.item as OrderDtoType;

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

	const payment = row.item as PaymentDtoType;

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
						<>
							<IconButton onClick={() => null} size='small'>
								<AccountBalanceOutlined />
							</IconButton>
							<IconButton onClick={() => null} size='small'>
								<PaidOutlined />
							</IconButton>
						</>
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
