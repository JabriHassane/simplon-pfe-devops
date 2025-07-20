import { Request, Response } from 'express';
import { prisma } from '../index';
import {
	CreateTransactionDtoType,
	UpdateTransactionDtoType,
} from '../../../shared/dtos/transaction.dto';
import { getPaginationCondition } from '../utils/pagination';

export const getAllTransactions = async (req: Request, res: Response) => {
	try {
		console.log(2)
		const { page, limit, skip, whereClause } = getPaginationCondition(req, [
			'ref',
		]);

		const [transactions, total] = await Promise.all([
			prisma.transaction.findMany({
				where: whereClause,
				include: {
					purchase: true,
					order: true,
					from: true,
					to: true,
					agent: {
						select: {
							id: true,
							name: true,
						},
					},
				},
				orderBy: { date: 'desc' },
				skip,
				take: limit,
			}),
			prisma.transaction.count({
				where: whereClause,
			}),
		]);

		const totalPages = Math.ceil(total / limit);

		res.json({
			data: transactions,
			pagination: {
				page,
				limit,
				total,
				totalPages,
			},
		});
	} catch (error) {
		console.error('Get all transactions error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const getTransactionById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const transaction = await prisma.transaction.findUnique({
			where: { id },
			include: {
				purchase: true,
				order: true,
				from: true,
				to: true,
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
		console.error('Get transaction by ID error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const createTransaction = async (req: Request, res: Response) => {
	try {
		const body = req.body as CreateTransactionDtoType;

		// Validate related entities exist
		if (body.purchaseId) {
			const purchase = await prisma.purchase.findUnique({
				where: { id: body.purchaseId },
			});
			if (!purchase) {
				return res.status(400).json({ message: 'Purchase not found' });
			}
		}

		if (body.orderId) {
			const order = await prisma.order.findUnique({
				where: { id: body.orderId },
			});
			if (!order) {
				return res.status(400).json({ message: 'Order not found' });
			}
		}

		if (body.fromId) {
			const fromAccount = await prisma.account.findUnique({
				where: { id: body.fromId },
			});
			if (!fromAccount) {
				return res.status(400).json({ message: 'Source account not found' });
			}
		}

		if (body.toId) {
			const toAccount = await prisma.account.findUnique({
				where: { id: body.toId },
			});
			if (!toAccount) {
				return res
					.status(400)
					.json({ message: 'Destination account not found' });
			}
		}

		const transaction = await prisma.transaction.create({
			data: {
				...body,
				ref: `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
				createdById: req.user?.userId,
			},
			include: {
				purchase: true,
				order: true,
				from: true,
				to: true,
				agent: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});

		// Update account balances for transfers
		if (body.type === 'transfer' && body.fromId && body.toId) {
			await prisma.account.update({
				where: { id: body.fromId },
				data: {
					balance: {
						decrement: body.amount,
					},
				},
			});

			await prisma.account.update({
				where: { id: body.toId },
				data: {
					balance: {
						increment: body.amount,
					},
				},
			});
		}

		res.status(201).json(transaction);
	} catch (error) {
		console.error('Create transaction error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const updateTransaction = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const body = req.body as UpdateTransactionDtoType;

		// Check if transaction exists
		const existingTransaction = await prisma.transaction.findUnique({
			where: { id },
		});

		if (!existingTransaction) {
			return res.status(404).json({ message: 'Transaction not found' });
		}

		// For transfers, we need to reverse the previous balance changes
		if (existingTransaction.type === 'transfer' && body.amount !== undefined) {
			const oldAmount = existingTransaction.amount;
			const newAmount = body.amount;

			if (existingTransaction.fromId) {
				await prisma.account.update({
					where: { id: existingTransaction.fromId },
					data: {
						balance: {
							increment: oldAmount - newAmount,
						},
					},
				});
			}

			if (existingTransaction.toId) {
				await prisma.account.update({
					where: { id: existingTransaction.toId },
					data: {
						balance: {
							decrement: oldAmount - newAmount,
						},
					},
				});
			}
		}

		const transaction = await prisma.transaction.update({
			where: { id },
			data: {
				...body,
				updatedAt: new Date(),
				updatedById: req.user?.userId,
			},
			include: {
				purchase: true,
				order: true,
				from: true,
				to: true,
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
		console.error('Update transaction error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const deleteTransaction = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		// Check if transaction exists
		const existingTransaction = await prisma.transaction.findUnique({
			where: { id },
		});

		if (!existingTransaction) {
			return res.status(404).json({ message: 'Transaction not found' });
		}

		// For transfers, we need to reverse the balance changes
		if (existingTransaction.type === 'transfer') {
			if (existingTransaction.fromId) {
				await prisma.account.update({
					where: { id: existingTransaction.fromId },
					data: {
						balance: {
							increment: existingTransaction.amount,
						},
					},
				});
			}

			if (existingTransaction.toId) {
				await prisma.account.update({
					where: { id: existingTransaction.toId },
					data: {
						balance: {
							decrement: existingTransaction.amount,
						},
					},
				});
			}
		}

		// Soft delete
		await prisma.transaction.update({
			where: { id },
			data: {
				deletedAt: new Date(),
				deletedById: req.user?.userId,
			},
		});

		res.json({ message: 'Transaction deleted successfully' });
	} catch (error) {
		console.error('Delete transaction error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};
