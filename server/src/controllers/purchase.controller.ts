import { Request, Response } from 'express';
import { prisma } from '../index';
import { getOrderPaginationCondition } from '../utils/pagination';
import {
	CreatePurchaseDtoType,
	UpdatePurchaseDtoType,
} from '../../../shared/dtos/purchase.dto';
import { getNextRef } from '../utils/db.utils';
import { TransactionMethod, TransactionType } from '../../../shared/constants';

export const PurchaseController = {
	async getPage(req: Request, res: Response) {
		try {
			const { page, limit, skip, whereClause } =
				getOrderPaginationCondition(req);

			const PurchasesPromise = prisma.purchase.findMany({
				where: whereClause,
				include: {
					supplier: true,
					payments: {
						include: {
							agent: true,
						},
					},
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
			});

			const PurchasesCountPromise = prisma.purchase.count({
				where: whereClause,
			});

			const [purchases, total] = await Promise.all([
				PurchasesPromise,
				PurchasesCountPromise,
			]);

			const totalPages = Math.ceil(total / limit);

			res.json({
				data: purchases,
				pagination: {
					page,
					limit,
					total,
					totalPages,
				},
			});
		} catch (error) {
			console.error('Error in PurchaseController.getPage', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async getById(req: Request, res: Response) {
		try {
			const { id } = req.params;

			const purchase = await prisma.purchase.findUnique({
				where: { id },
				include: {
					supplier: true,
					agent: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			});

			if (!purchase) {
				return res.status(404).json({ message: 'purchase not found' });
			}

			res.json(purchase);
		} catch (error) {
			console.error('Error in PurchaseController.getById', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async getTransactions(req: Request, res: Response) {
		try {
			const { id } = req.params;

			const transactions = await prisma.transaction.findMany({
				where: {
					purchaseId: id,
					deletedAt: null,
				},
				include: {
					agent: {
						select: {
							id: true,
							name: true,
						},
					},
				},
				orderBy: { date: 'desc' },
			});

			res.json(transactions);
		} catch (error) {
			console.error('Error in PurchaseController.getTransactions', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async create(req: Request, res: Response) {
		try {
			const { userId } = req.user!;
			const body = req.body as CreatePurchaseDtoType;

			// Check if client exists
			const client = await prisma.client.findUnique({
				where: { id: body.supplierId },
			});

			if (!client) {
				return res.status(400).json({ message: 'Supplier not found' });
			}

			const purchase = await prisma.purchase.create({
				data: {
					ref: await getNextRef('purchases'),
					date: body.date,
					agentId: body.agentId,
					supplierId: body.supplierId,
					receiptNumber: body.receiptNumber,
					invoiceNumber: body.invoiceNumber,
					totalPrice: body.totalPrice,
					totalPaid: body.totalPaid,
					totalDue: body.totalDue,
					status: body.status,
					note: body.note,
					createdById: userId,
				},
				include: {
					supplier: true,
					agent: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			});

			res.status(201).json(purchase);
		} catch (error) {
			console.error('Error in PurchaseController.create', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async update(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const { userId } = req.user!;
			const body = req.body as UpdatePurchaseDtoType;

			const updatedPurchase = await prisma.$transaction(async (tx) => {
				// Check if purchase exists
				const isExists = await tx.purchase.findUnique({
					where: { id },
				});

				if (!isExists) {
					throw new Error('Purchase not found');
				}

				// Check if client exists
				const client = await tx.client.findUnique({
					where: { id: body.supplierId },
				});

				if (!client) {
					throw new Error('Supplier not found');
				}

				// Update purchase
				const { ...updateData } = body;
				const updated = await tx.purchase.update({
					where: { id },
					data: {
						...updateData,
						totalPrice: body.totalPrice,
						totalPaid: body.totalPaid,
						totalDue: body.totalDue,

						payments: {
							deleteMany: {},
							createMany: {
								data: await Promise.all(
									body.payments.map(async (item) => ({
										ref: await getNextRef('purchases'),
										amount: item.amount,
										date: item.date,
										method: item.method as TransactionMethod,
										type: 'purchase' as TransactionType,
										agentId: item.agentId,
										createdById: userId,
									}))
								),
							},
						},

						updatedAt: new Date(),
						updatedById: userId,
					},
					include: {
						supplier: true,
						agent: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				});

				return updated;
			});

			return res.json(updatedPurchase);
		} catch (error: any) {
			console.error('Error in PurchaseController.update', error);
			return res
				.status(500)
				.json({ message: error.message || 'Internal server error' });
		}
	},

	async delete(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const { userId } = req.user!;

			// Check if purchase exists
			const existingPurchase = await prisma.purchase.findUnique({
				where: { id },
				include: {
					payments: true,
				},
			});

			if (!existingPurchase) {
				return res.status(404).json({ message: 'Purchase not found' });
			}

			// Check if purchase has transactions
			const hasTransactions = await prisma.transaction.findFirst({
				where: { purchaseId: id },
			});

			if (hasTransactions) {
				return res.status(400).json({
					message: 'Cannot delete Purchase with existing transactions',
				});
			}

			// Soft delete
			await prisma.purchase.update({
				where: { id },
				data: {
					deletedAt: new Date(),
					deletedById: userId,
				},
			});

			res.json({ message: 'Purchase deleted successfully' });
		} catch (error) {
			console.error('Error in PurchaseController.delete', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},
};
