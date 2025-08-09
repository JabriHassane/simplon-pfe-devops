import {
	Badge,
	Chip,
	IconButton,
	TablePagination,
	Tooltip,
} from '@mui/material';

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
import type { OrderDto } from '../../../../shared/dtos/order.dto';
import { DICT } from '../../i18n/fr';
import {
	ORDER_STATUS_COLOR_MAP,
	PAYMENT_METHODS_COLOR_MAP,
} from '../../../../shared/constants';
import type { Pagination } from '../../types/pagination.types';
import {
	useCashPayment,
	useDeleteTransaction,
	useDepositPayment,
	useUndoPaymentCashing,
	useUndoPaymentDeposit,
} from '../../hooks/ressources/useTransactions';
import ResourceFormPopup from './ResourceFormPopup';
import TransactionForm from '../forms/TransactionForm';
import ConfirmationPopup from './ConfirmationPopup';
import usePopups from '../../hooks/usePopups';
import type { TransactionDto } from '../../../../shared/dtos/transaction.dto';
import PaymentCashingFormPopup from '../forms/PaymentCashingFormPopup';

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
					page={pagination.page - 1}
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

	const {
		openFormPopup,
		openDeletePopup,
		selectedResource: selectedTransaction,
		handleOpenFormPopup,
		handleOpenDeletePopup,
		handleClosePopup,
	} = usePopups<TransactionDto>();

	const {
		openFormPopup: openCashingPopup,
		handleOpenFormPopup: handleOpenCashingPopup,
		handleClosePopup: handleCloseCashingPopup,
	} = usePopups<TransactionDto>();

	const {
		openFormPopup: openDepositPopup,
		handleOpenFormPopup: handleOpenDepositPopup,
		handleClosePopup: handleCloseDepositPopup,
	} = usePopups<TransactionDto>();

	const {
		openFormPopup: openUndoCashingPopup,
		handleOpenFormPopup: handleOpenUndoCashingPopup,
		handleClosePopup: handleCloseUndoCashingPopup,
	} = usePopups<TransactionDto>();

	const {
		openFormPopup: openUndoDepositPopup,
		handleOpenFormPopup: handleOpenUndoDepositPopup,
		handleClosePopup: handleCloseUndoDepositPopup,
	} = usePopups<TransactionDto>();

	const undoCashingMutation = useUndoPaymentCashing(
		handleCloseUndoCashingPopup
	);
	const undoDepositMutation = useUndoPaymentDeposit(
		handleCloseUndoDepositPopup
	);

	const deleteTransactionMutation = useDeleteTransaction(handleClosePopup);

	const handleDelete = () => {
		if (selectedTransaction) {
			deleteTransactionMutation.mutateAsync(selectedTransaction.id);
		}
	};

	const paymentsHeaders = [
		{ id: 'ref', name: 'Ref' },
		{ id: 'date', name: 'Date' },
		{ id: 'agent', name: 'Agent' },
		{ id: 'amount', name: 'Montant' },
		{ id: 'method', name: 'Méthode' },
	];

	const order = row.item as OrderDto;

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

	const payment = row.item as TransactionDto;

	return (
		<>
			<TableRow>
				{headers.map((header) => (
					<TableCell key={header.id}>{row.data[header.id]}</TableCell>
				))}

				<TableCell align='right'>
					{isPayment && payment.method !== 'cash' && (
						<>
							<Tooltip
								title={
									payment.depositTransactionId
										? 'Annuler le dépôt'
										: 'Déposer à la banque'
								}
							>
								<IconButton
									onClick={() =>
										payment.depositTransactionId
											? handleOpenUndoDepositPopup(payment)
											: handleOpenDepositPopup(null)
									}
									size='small'
									disabled={!!payment.cashingTransactionId}
									color={payment.depositTransactionId ? 'warning' : 'default'}
								>
									<AccountBalanceOutlined />
								</IconButton>
							</Tooltip>

							<Tooltip
								title={
									payment.cashingTransactionId
										? "Annuler l'encaissement"
										: 'Encaisser'
								}
							>
								<IconButton
									onClick={() =>
										payment.cashingTransactionId
											? handleOpenUndoCashingPopup(payment)
											: handleOpenCashingPopup(null)
									}
									size='small'
									disabled={!!payment.depositTransactionId}
									color={payment.cashingTransactionId ? 'warning' : 'default'}
								>
									<PaidOutlined />
								</IconButton>
							</Tooltip>

							{(openCashingPopup || openDepositPopup) && (
								<PaymentCashingFormPopup
									paymentId={payment.id}
									onClose={() => {
										handleCloseCashingPopup();
										handleCloseDepositPopup();
									}}
									title={openCashingPopup ? 'Encaisser' : 'Déposer à la banque'}
									type={openCashingPopup ? 'cash' : 'deposit'}
								/>
							)}

							{openUndoCashingPopup && (
								<ConfirmationPopup
									title="Annuler l'encaissement"
									description={`Voulez-vous vraiment annuler l'encaissement de ce paiement ?`}
									onDelete={() => undoCashingMutation.mutateAsync(payment.id)}
									onClose={handleCloseUndoCashingPopup}
								/>
							)}

							{openUndoDepositPopup && (
								<ConfirmationPopup
									title='Annuler le dépôt'
									description={`Voulez-vous vraiment annuler le dépôt de ce paiement ?`}
									onDelete={() => undoDepositMutation.mutateAsync(payment.id)}
									onClose={handleCloseUndoDepositPopup}
								/>
							)}
						</>
					)}

					{isOrder && (
						<Tooltip title='Historique des paiements'>
							<IconButton
								onClick={() => setShowPayments(!showPayments)}
								size='small'
								color={showPayments ? 'info' : 'default'}
								disabled={payments.length === 0}
							>
								<Badge badgeContent={payments.length} color='info'>
									<HistoryOutlined />
								</Badge>
							</IconButton>
						</Tooltip>
					)}

					<Tooltip title='Modifier'>
						<IconButton onClick={() => onEdit(row.item, index)} size='small'>
							<EditOutlined />
						</IconButton>
					</Tooltip>

					<Tooltip title='Supprimer'>
						<IconButton onClick={() => onDelete(row.item, index)} size='small'>
							<DeleteOutline />
						</IconButton>
					</Tooltip>
				</TableCell>
			</TableRow>

			{isOrder && showPayments && (
				<TableRow>
					<TableCell sx={{ py: 0, pr: 0, px: 11 }} colSpan={12}>
						{showPayments && (
							<>
								<ResourceTable
									headers={paymentsHeaders}
									rows={payments}
									onEdit={handleOpenFormPopup}
									onDelete={handleOpenDeletePopup}
									isPayment
								/>

								{openFormPopup && (
									<ResourceFormPopup
										onClose={handleClosePopup}
										title={
											selectedTransaction
												? `Modifier ${selectedTransaction.ref}`
												: 'Nouvelle transaction'
										}
									>
										<TransactionForm
											init={selectedTransaction}
											onClose={handleClosePopup}
										/>
									</ResourceFormPopup>
								)}

								{openDeletePopup && (
									<ConfirmationPopup
										onClose={handleClosePopup}
										title={`Supprimer ${selectedTransaction?.ref}`}
										description='Voulez-vous vraiment supprimer cette transaction ?'
										onDelete={handleDelete}
									/>
								)}
							</>
						)}
					</TableCell>
				</TableRow>
			)}
		</>
	);
}
