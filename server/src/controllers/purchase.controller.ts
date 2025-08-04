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
					contact: true,
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
					contact: true,
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

			// Check if contact exists
			const contact = await prisma.contact.findUnique({
				where: { id: body.contactId },
			});

			if (!contact) {
				return res.status(400).json({ message: 'contact not found' });
			}

			const purchase = await prisma.purchase.create({
				data: {
					ref: await getNextRef('purchases'),
					date: body.date,
					agentId: body.agentId,
					contactId: body.contactId,
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
					contact: true,
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

			// Check if purchase exists
			const isExists = await prisma.purchase.findUnique({
				where: { id },
			});

			if (!isExists) {
				throw new Error('Purchase not found');
			}

			// Check if contact exists
			const contact = await prisma.contact.findUnique({
				where: { id: body.contactId },
			});

			if (!contact) {
				throw new Error('contact not found');
			}

			// Generate refs for payments before transaction
			const paymentRefs = await Promise.all(
				body.payments.map(() => getNextRef('transactions'))
			);

			const purchase = await prisma.purchase.update({
				where: { id },
				data: {
					...body,
					totalPrice: body.totalPrice,
					totalPaid: body.totalPaid,
					totalDue: body.totalDue,

					payments: {
						deleteMany: {},
						createMany: {
							data: body.payments.map((item, index) => ({
								ref: paymentRefs[index],
								amount: item.amount,
								date: item.date,
								method: item.method as TransactionMethod,
								type: 'purchase' as TransactionType,
								agentId: item.agentId,
								createdById: userId,
							})),
						},
					},

					updatedAt: new Date(),
					updatedById: userId,
				},
				include: {
					contact: true,
					agent: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			});

			return res.json(purchase);
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
