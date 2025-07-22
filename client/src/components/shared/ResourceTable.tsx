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
	FormatListBulleted,
	HistoryOutlined,
} from '@mui/icons-material';
import { useState } from 'react';
import { formatPrice } from '../../utils/price.utils';
import { formatDate } from '../../utils/date.utils';
import type { SaleDtoType } from '../../../../shared/dtos/sale.dto';
import type { PurchaseDtoType } from '../../../../shared/dtos/purchase.dto';
import { DICT } from '../../i18n/fr';
import { PAYMENT_METHODS_COLOR_MAP } from '../../../../shared/constants';

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
}

function ResourceTable({ headers, rows, onEdit, onDelete }: Props) {
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
}

function Row({ index, row, headers, onEdit, onDelete }: RowProps) {
	const [extension, setExtension] = useState<'items' | 'payments' | null>(null);

	const handleClick = (_extension: 'items' | 'payments') => {
		if (extension === _extension) {
			setExtension(null);
		} else {
			setExtension(_extension);
		}
	};

	const itemsHeaders = [
		{ id: 'ref', name: 'Ref' },
		{ id: 'name', name: 'Nom' },
		{ id: 'quantity', name: 'Quantité' },
		{ id: 'price', name: 'Prix' },
	];

	const paymentsHeaders = [
		{ id: 'ref', name: 'Ref' },
		{ id: 'date', name: 'Date' },
		{ id: 'amount', name: 'Montant' },
		{ id: 'account', name: 'Compte' },
		{ id: 'agent', name: 'Agent' },
		{ id: 'paymentMethod', name: 'Méthode de paiement' },
	];

	const order = row.item as SaleDtoType | PurchaseDtoType;

	const items = order.items?.map((item) => ({
		item: item,
		data: {
			ref: item.article?.ref || '',
			name: item.article?.name || '',
			quantity: item.quantity,
			price: formatPrice(item.price),
		},
	}));

	const payments = order.payments?.map((payment) => ({
		item: payment,
		data: {
			ref: payment.ref,
			date: formatDate(payment.date),
			amount: formatPrice(payment.amount),
			account: payment.account?.name,
			agent: payment.agent?.name,
			paymentMethod: (
				<Chip
					label={DICT.paymentMethods[payment.paymentMethod]}
					color={PAYMENT_METHODS_COLOR_MAP[payment.paymentMethod]}
					size='small'
					sx={{ px: 0.5 }}
				/>
			),
		},
	}));

	return (
		<>
			<TableRow>
				{headers.map((header) => (
					<TableCell key={header.id}>{row.data[header.id]}</TableCell>
				))}

				<TableCell align='right'>
					{(items || payments) && (
						<>
							<IconButton
								onClick={() => handleClick('items')}
								size='small'
								color={extension === 'items' ? 'info' : 'default'}
								disabled={items.length === 0}
							>
								<FormatListBulleted />
							</IconButton>

							<IconButton
								onClick={() => handleClick('payments')}
								size='small'
								color={extension === 'payments' ? 'info' : 'default'}
								disabled={payments.length === 0}
							>
								<HistoryOutlined />
							</IconButton>
						</>
					)}

					<IconButton onClick={() => onEdit(row.item, index)} size='small'>
						<EditOutlined />
					</IconButton>

					<IconButton onClick={() => onDelete(row.item, index)} size='small'>
						<DeleteOutline />
					</IconButton>
				</TableCell>
			</TableRow>

			{items && payments && extension && (
				<TableRow>
					<TableCell sx={{ py: 0, pr: 0, pl: 10 }} colSpan={12}>
						{extension && (
							<ResourceTable
								headers={extension === 'items' ? itemsHeaders : paymentsHeaders}
								rows={extension === 'items' ? items : payments}
								onEdit={onEdit}
								onDelete={onDelete}
							/>
						)}
					</TableCell>
				</TableRow>
			)}
		</>
	);
}
