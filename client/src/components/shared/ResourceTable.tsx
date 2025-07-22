import { Collapse, IconButton } from '@mui/material';

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
	onEdit: (item: any) => void;
	onDelete: (item: any) => void;
}

function ResourceTable({ headers, rows, onEdit, onDelete }: Props) {
	if (!rows || rows.length === 0) return null;

	return (
		<Table size='small'>
			<TableHead>
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
	row: ResourceTableRow;
	headers: ResourceTableHeader[];
	onEdit: (item: any) => void;
	onDelete: (item: any) => void;
}

function Row({ row, headers, onEdit, onDelete }: RowProps) {
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
		{ id: 'quantity', name: 'Quantité' },
		{ id: 'price', name: 'Prix' },
	];

	const paymentsHeaders = [
		{ id: 'ref', name: 'Ref' },
		{ id: 'date', name: 'Date' },
		{ id: 'amount', name: 'Montant' },
		{ id: 'account', name: 'Compte' },
	];

	const order = row.item as SaleDtoType | PurchaseDtoType;

	const items = order.items?.map((item) => ({
		item: item,
		data: {
			ref: item.article.ref,
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
			account: payment.from?.name || payment.to?.name,
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
					<IconButton onClick={() => onEdit(row.item)} size='small'>
						<EditOutlined />
					</IconButton>
					<IconButton onClick={() => onDelete(row.item)} size='small'>
						<DeleteOutline />
					</IconButton>
				</TableCell>
			</TableRow>

			{items && payments && extension && (
				<TableRow>
					<TableCell sx={{ py: 0, px: 5 }} colSpan={12}>
						<Collapse in={!!extension} timeout='auto' unmountOnExit>
							<ResourceTable
								headers={extension === 'items' ? itemsHeaders : paymentsHeaders}
								rows={extension === 'items' ? items : payments}
								onEdit={onEdit}
								onDelete={onDelete}
							/>
						</Collapse>
					</TableCell>
				</TableRow>
			)}
		</>
	);
}
