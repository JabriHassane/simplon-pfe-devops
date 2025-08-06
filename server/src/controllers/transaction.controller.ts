import { Request, Response } from 'express';
import { prisma } from '../index';
import {
	CreateTransactionDtoType,
	UpdateTransactionDtoType,
} from '../../../shared/dtos/transaction.dto';
import { getPaginationCondition } from '../utils/pagination';
import { getNextRef } from '../utils/db.utils';
import { TransactionMethod, TransactionType } from '../../../shared/constants';

export const TransactionController = {
	async getPage(req: Request, res: Response) {
		try {
			const { page, pageSize, skip, whereClause } = getPaginationCondition(
				req,
				['ref']
			);

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
			const body = req.body as CreateTransactionDtoType;
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
			const body = req.body as UpdateTransactionDtoType;
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
			});

			if (!existingTransaction) {
				return res.status(404).json({ message: 'Transaction not found' });
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
};

const getBalance = async (method: TransactionMethod) => {
	const positiveBalance = await prisma.transaction.aggregate({
		_sum: {
			amount: true,
		},
		where: {
			deletedAt: null,
			method,
			type: {
				in: ['sale', 'receive'],
			},
		},
	});

	const negativeBalance = await prisma.transaction.aggregate({
		_sum: {
			amount: true,
		},
		where: {
			deletedAt: null,
			method,
			type: {
				in: ['purchase', 'send', 'cashing'],
			},
		},
	});

	const balance =
		(positiveBalance._sum.amount || 0) - (negativeBalance._sum.amount || 0);

	return balance;
};
