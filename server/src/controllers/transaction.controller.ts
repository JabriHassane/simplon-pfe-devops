import { Request, Response } from 'express';
import { prisma } from '../index';

export const getAllTransactions = async (req: Request, res: Response) => {
	try {
		const transactions = await prisma.transaction.findMany({
			where: { deletedAt: null },
			include: {
				purchase: true,
				order: true,
				from: true,
				to: true,
				agent: {
					select: {
						id: true,
						username: true,
					},
				},
			},
			orderBy: { date: 'desc' },
		});

		res.json(transactions);
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
						username: true,
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
		const {
			date,
			type,
			purchaseId,
			orderId,
			paymentMethod,
			fromId,
			toId,
			amount,
		} = req.body;

		// Validate related entities exist
		if (purchaseId) {
			const purchase = await prisma.purchase.findUnique({
				where: { id: purchaseId },
			});
			if (!purchase) {
				return res.status(400).json({ message: 'Purchase not found' });
			}
		}

		if (orderId) {
			const order = await prisma.order.findUnique({
				where: { id: orderId },
			});
			if (!order) {
				return res.status(400).json({ message: 'Order not found' });
			}
		}

		if (fromId) {
			const fromAccount = await prisma.account.findUnique({
				where: { id: fromId },
			});
			if (!fromAccount) {
				return res.status(400).json({ message: 'Source account not found' });
			}
		}

		if (toId) {
			const toAccount = await prisma.account.findUnique({
				where: { id: toId },
			});
			if (!toAccount) {
				return res
					.status(400)
					.json({ message: 'Destination account not found' });
			}
		}

		const transaction = await prisma.transaction.create({
			data: {
				date,
				type,
				purchaseId,
				orderId,
				paymentMethod,
				fromId,
				toId,
				amount: parseFloat(amount),
				agentId: req.user?.userId || 'system',
				ref: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
				createdBy: req.user?.userId || 'system',
			},
			include: {
				purchase: true,
				order: true,
				from: true,
				to: true,
				agent: {
					select: {
						id: true,
						username: true,
					},
				},
			},
		});

		// Update account balances for transfers
		if (type === 'transfer' && fromId && toId) {
			await prisma.account.update({
				where: { id: fromId },
				data: {
					balance: {
						decrement: parseFloat(amount),
					},
				},
			});

			await prisma.account.update({
				where: { id: toId },
				data: {
					balance: {
						increment: parseFloat(amount),
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
		const { date, paymentMethod, amount } = req.body;

		// Check if transaction exists
		const existingTransaction = await prisma.transaction.findUnique({
			where: { id },
		});

		if (!existingTransaction) {
			return res.status(404).json({ message: 'Transaction not found' });
		}

		// For transfers, we need to reverse the previous balance changes
		if (existingTransaction.type === 'transfer' && amount !== undefined) {
			const oldAmount = existingTransaction.amount;
			const newAmount = parseFloat(amount);

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
				...(date && { date }),
				...(paymentMethod && { paymentMethod }),
				...(amount !== undefined && { amount: parseFloat(amount) }),
				updatedAt: new Date(),
				updatedBy: req.user?.userId || 'system',
			},
			include: {
				purchase: true,
				order: true,
				from: true,
				to: true,
				agent: {
					select: {
						id: true,
						username: true,
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
				deletedBy: req.user?.userId || 'system',
			},
		});

		res.json({ message: 'Transaction deleted successfully' });
	} catch (error) {
		console.error('Delete transaction error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};
