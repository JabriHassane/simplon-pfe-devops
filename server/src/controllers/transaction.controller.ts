import { Request, Response } from 'express';
import { prisma } from '../index';
import {
	CreateTransactionDto,
	UpdateTransactionDto,
} from '../../../shared/dtos/transaction.dto';
import { getTransactionPaginationCondition } from '../utils/pagination';
import { getNextRef } from '../utils/db.utils';
import { TransactionMethod, TransactionType } from '../../../shared/constants';
import { PaymentCashingDto } from '../../../shared/dtos/order.dto';

export const TransactionController = {
	async getPage(req: Request, res: Response) {
		try {
			const { page, pageSize, skip, whereClause } =
				getTransactionPaginationCondition(req);

			const [transactions, total] = await Promise.all([
				prisma.transaction.findMany({
					where: {
						...whereClause,
						type: {
							notIn: ['sale', 'purchase'],
						},
					},
					include: {
						order: true,
						agent: {
							select: {
								id: true,
								name: true,
							},
						},
						cashedPayment: {
							select: {
								method: true,
							},
						},
						depositedPayment: {
							select: {
								method: true,
							},
						},
					},
					orderBy: { date: 'desc' },
					skip,
					take: pageSize,
				}),
				prisma.transaction.count({
					where: {
						...whereClause,
						type: {
							notIn: ['sale', 'purchase'],
						},
					},
				}),
			]);

			const totalPages = Math.ceil(total / pageSize);

			res.json({
				data: transactions,
				pagination: {
					page,
					pageSize,
					total,
					totalPages,
				},
			});
		} catch (error) {
			console.error('Error in TransactionController.getPage', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async getById(req: Request, res: Response) {
		try {
			const { id } = req.params;

			const transaction = await prisma.transaction.findUnique({
				where: { id },
				include: {
					order: true,
					agent: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			});

			if (!transaction) {
				return res.status(404).json({ message: 'Transaction not found' });
			}

			res.json(transaction);
		} catch (error) {
			console.error('Error in TransactionController.getById', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async create(req: Request, res: Response) {
		try {
			const body = req.body as CreateTransactionDto;
			const { userId } = req.user!;

			// Validate related entities exist
			if (body.orderId) {
				const order = await prisma.order.findUnique({
					where: { id: body.orderId },
				});
				if (!order) {
					return res.status(400).json({ message: 'Order not found' });
				}
			}

			const transaction = await prisma.transaction.create({
				data: {
					...body,
					ref: await getNextRef('transactions'),
					method: body.method as TransactionMethod,
					createdById: userId,
				},
				include: {
					order: true,
					agent: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			});

			res.status(201).json(transaction);
		} catch (error) {
			console.error('Error in TransactionController.create', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async update(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const body = req.body as UpdateTransactionDto;
			const { userId } = req.user!;

			// Check if transaction exists
			const existingTransaction = await prisma.transaction.findUnique({
				where: { id },
			});

			if (!existingTransaction) {
				return res.status(404).json({ message: 'Transaction not found' });
			}

			const transaction = await prisma.transaction.update({
				where: { id },
				data: {
					...body,
					method: body.method as TransactionMethod,
					updatedAt: new Date(),
					updatedById: userId,
				},
				include: {
					order: true,
					agent: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			});

			res.json(transaction);
		} catch (error) {
			console.error('Error in TransactionController.update', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async delete(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const { userId } = req.user!;

			// Check if transaction exists
			const existingTransaction = await prisma.transaction.findUnique({
				where: { id },
				include: {
					cashedPayment: true,
					depositedPayment: true,
				},
			});

			if (!existingTransaction) {
				return res.status(404).json({ message: 'Transaction not found' });
			}

			// If it's a cashing or deposit, we need to remove it's reference from the original transaction
			if (
				existingTransaction.cashedPayment ||
				existingTransaction.depositedPayment
			) {
				await prisma.transaction.update({
					where: {
						id:
							existingTransaction.cashedPayment?.id ||
							existingTransaction.depositedPayment?.id,
					},
					data: {
						cashingTransactionId: null,
						depositTransactionId: null,
					},
				});
			}

			// Soft delete
			await prisma.transaction.update({
				where: { id },
				data: {
					deletedAt: new Date(),
					deletedById: userId,
				},
			});

			res.json({ message: 'Transaction deleted successfully' });
		} catch (error) {
			console.error('Error in TransactionController.delete', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async getBalances(req: Request, res: Response) {
		try {
			const cashPositiveBalance = await prisma.transaction.aggregate({
				_sum: {
					amount: true,
				},
				where: {
					deletedAt: null,
					OR: [
						{
							method: 'cash',
							type: {
								in: ['sale', 'receive'],
							},
						},
						{
							type: 'cashing',
						},
					],
				},
			});

			const cashNegativeBalance = await prisma.transaction.aggregate({
				_sum: {
					amount: true,
				},
				where: {
					deletedAt: null,
					method: 'cash',
					type: {
						in: ['purchase', 'send'],
					},
				},
			});

			const cashBalance =
				(cashPositiveBalance._sum.amount || 0) -
				(cashNegativeBalance._sum.amount || 0);

			const [checkBalance, bankTransferBalance, tpeBalance] = await Promise.all(
				[getBalance('check'), getBalance('bank_transfer'), getBalance('tpe')]
			);

			res.json({
				cash: cashBalance,
				check: checkBalance,
				bank_transfer: bankTransferBalance,
				tpe: tpeBalance,
			});
		} catch (error) {
			console.error('Error in TransactionController.getBalances', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async cashPayment(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const { userId } = req.user!;
			const body = req.body as PaymentCashingDto;

			const transaction = await prisma.transaction.findUnique({
				where: { id },
			});

			if (!transaction) {
				return res.status(404).json({ message: 'Transaction not found' });
			}

			if (transaction.cashingTransactionId) {
				return res.status(400).json({ message: 'Transaction already cashed' });
			}

			// Create a new cashing transaction
			const cashingTransaction = await prisma.transaction.create({
				data: {
					ref: await getNextRef('transactions'),
					date: body.date,
					type: 'cashing',
					method: 'cash',
					amount: transaction.amount,
					agentId: body.agentId,
					createdById: userId,
				},
			});

			// Update the original transaction with the cashing transaction ID
			await prisma.transaction.update({
				where: { id },
				data: {
					cashingTransactionId: cashingTransaction.id,
					updatedById: userId,
				},
			});

			res.json({ message: 'Payment cashed successfully' });
		} catch (error) {
			console.error('Error in TransactionController.cashPayment', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async undoPaymentCashing(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const { userId } = req.user!;

			const transaction = await prisma.transaction.findUnique({
				where: { id },
				include: {
					cashingTransaction: true,
				},
			});

			if (!transaction) {
				return res.status(404).json({ message: 'Transaction not found' });
			}

			if (!transaction.cashingTransactionId) {
				return res.status(400).json({ message: 'Transaction not cashed' });
			}

			// Delete the cashing transaction
			await prisma.transaction.delete({
				where: { id: transaction.cashingTransactionId },
			});

			// Remove the reference from the original transaction
			await prisma.transaction.update({
				where: { id },
				data: {
					cashingTransactionId: null,
					updatedById: userId,
				},
			});

			res.json({ message: 'Payment cashing undone successfully' });
		} catch (error) {
			console.error('Error in TransactionController.undoPaymentCashing', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async depositPaymentToBank(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const { userId } = req.user!;
			const body = req.body as PaymentCashingDto;

			const transaction = await prisma.transaction.findUnique({
				where: { id },
			});

			if (!transaction) {
				return res.status(404).json({ message: 'Transaction not found' });
			}

			if (transaction.depositTransactionId) {
				return res
					.status(400)
					.json({ message: 'Transaction already deposited' });
			}

			// Create a new deposit transaction
			const depositTransaction = await prisma.transaction.create({
				data: {
					ref: await getNextRef('transactions'),
					date: body.date,
					type: 'deposit',
					method: transaction.method,
					amount: transaction.amount,
					agentId: body.agentId,
					createdById: userId,
				},
			});

			// Update the original transaction with the deposit transaction ID
			await prisma.transaction.update({
				where: { id },
				data: {
					depositTransactionId: depositTransaction.id,
					updatedById: userId,
				},
			});

			res.json({ message: 'Payment deposited to bank successfully' });
		} catch (error) {
			console.error(
				'Error in TransactionController.depositPaymentToBank',
				error
			);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async undoPaymentDeposit(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const { userId } = req.user!;

			const transaction = await prisma.transaction.findUnique({
				where: { id },
				include: {
					depositTransaction: true,
				},
			});

			if (!transaction) {
				return res.status(404).json({ message: 'Transaction not found' });
			}

			if (!transaction.depositTransactionId) {
				return res.status(400).json({ message: 'Transaction not deposited' });
			}

			// Delete the deposit transaction
			await prisma.transaction.delete({
				where: { id: transaction.depositTransactionId },
			});

			// Remove the reference from the original transaction
			await prisma.transaction.update({
				where: { id },
				data: {
					depositTransactionId: null,
					updatedById: userId,
				},
			});

			res.json({ message: 'Payment deposit undone successfully' });
		} catch (error) {
			console.error('Error in TransactionController.undoPaymentDeposit', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},
};

const getBalance = async (method: Exclude<TransactionMethod, 'cash'>) => {
	const positiveTypes: TransactionType[] = ['sale', 'receive'];

	const positiveBalance = await prisma.transaction.aggregate({
		_sum: {
			amount: true,
		},
		where: {
			deletedAt: null,
			method,
			type: {
				in: positiveTypes,
			},
			cashingTransactionId: null,
			depositTransactionId: null,
		},
	});

	const negativeTypes: TransactionType[] = ['purchase', 'send'];

	const negativeBalance = await prisma.transaction.aggregate({
		_sum: {
			amount: true,
		},
		where: {
			deletedAt: null,
			method,
			type: {
				in: negativeTypes,
			},
		},
	});

	const balance =
		(positiveBalance._sum.amount || 0) - (negativeBalance._sum.amount || 0);

	return balance;
};
