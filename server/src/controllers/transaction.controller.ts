import { Request, Response } from 'express';
import { prisma } from '../index';
import {
	CreateTransactionDtoType,
	UpdateTransactionDtoType,
} from '../../../shared/dtos/transaction.dto';
import { getPaginationCondition } from '../utils/pagination';

export const TransactionController = {
	async getPage(req: Request, res: Response) {
		try {
			const { page, limit, skip, whereClause } = getPaginationCondition(req, [
				'ref',
			]);

			const [transactions, total] = await Promise.all([
				prisma.transaction.findMany({
					where: whereClause,
					include: {
						purchase: true,
						sale: true,
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
					purchase: true,
					sale: true,
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
			console.error('Error in TransactionController.getById', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async create(req: Request, res: Response) {
		try {
			const body = req.body as CreateTransactionDtoType;
			const { userId } = req.user!;

			// Validate related entities exist
			if (body.purchaseId) {
				const purchase = await prisma.purchase.findUnique({
					where: { id: body.purchaseId },
				});
				if (!purchase) {
					return res.status(400).json({ message: 'Purchase not found' });
				}
			}

			if (body.saleId) {
				const sale = await prisma.sale.findUnique({
					where: { id: body.saleId },
				});
				if (!sale) {
					return res.status(400).json({ message: 'Sale not found' });
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
					ref: `TRA-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
					createdById: userId,
				},
				include: {
					purchase: true,
					sale: true,
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

			// For transfers, we need to reverse the previous balance changes
			if (
				existingTransaction.type === 'transfer' &&
				body.amount !== undefined
			) {
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
					updatedById: userId,
				},
				include: {
					purchase: true,
					sale: true,
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
					deletedById: userId,
				},
			});

			res.json({ message: 'Transaction deleted successfully' });
		} catch (error) {
			console.error('Error in TransactionController.delete', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},
};
