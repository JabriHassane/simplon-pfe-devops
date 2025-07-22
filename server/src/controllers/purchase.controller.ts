import { Request, Response } from 'express';
import { prisma } from '../index';
import { getOrderPaginationCondition } from '../utils/pagination';
import { UpdatePurchaseDtoType } from '../../../shared/dtos/purchase.dto';
import { getNextRef } from '../utils/db.utils';
import { PaymentMethod, TransactionType } from '../../../shared/constants';

type PurchaseItemInput = { articleId: string; price: number; quantity: number };

export const PurchaseController = {
	async getPage(req: Request, res: Response) {
		try {
			const { page, limit, skip, whereClause } =
				getOrderPaginationCondition(req);

			const purchasesPromise = prisma.purchase.findMany({
				where: whereClause,
				include: {
					supplier: true,
					items: {
						include: {
							article: true,
						},
					},
					payments: {
						include: {
							to: true,
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

			const purchasesCountPromise = prisma.purchase.count({
				where: whereClause,
			});

			const [purchases, total] = await Promise.all([
				purchasesPromise,
				purchasesCountPromise,
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
			console.error('Error in purchaseController.getPage', error);
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
					items: {
						include: {
							article: true,
						},
					},
					agent: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			});

			if (!purchase) {
				return res.status(404).json({ message: 'Purchase not found' });
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
			const {
				date,
				supplierId,
				receiptNumber,
				invoiceNumber,
				items,
				status = 'pending',
				note,
			} = req.body;

			// Check if supplier exists
			const supplier = await prisma.supplier.findUnique({
				where: { id: supplierId },
			});

			if (!supplier) {
				return res.status(400).json({ message: 'Supplier not found' });
			}

			// Validate all articles exist
			for (const item of items) {
				const article = await prisma.article.findUnique({
					where: { id: item.articleId },
				});

				if (!article) {
					return res
						.status(400)
						.json({ message: `Article ${item.articleId} not found` });
				}
			}

			// Calculate totals
			const subtotal = items.reduce(
				(sum: number, item: { price: number; quantity: number }) =>
					sum + item.price * item.quantity,
				0
			);
			const totalPrice = subtotal;

			const purchase = await prisma.purchase.create({
				data: {
					date,
					supplierId,
					receiptNumber,
					invoiceNumber,
					totalPrice,
					totalPaid: 0,
					totalDue: totalPrice,
					status,
					note: note || '',
					agentId: userId,
					ref: await getNextRef('purchases'),
					createdById: userId,
					items: {
						create: items.map((item: PurchaseItemInput) => ({
							articleId: item.articleId,
							price: item.price,
							quantity: item.quantity,
							createdById: userId,
						})),
					},
				},
				include: {
					supplier: true,
					items: {
						include: {
							article: true,
						},
					},
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
					include: { items: true },
				});

				if (!isExists) {
					throw new Error('Purchase not found');
				}

				// Check if supplier exists
				const supplier = await tx.supplier.findUnique({
					where: { id: body.supplierId },
				});

				if (!supplier) {
					throw new Error('Supplier not found');
				}

				// Validate all articles
				const articleIds = body.items
					.map((item) => item.articleId)
					.filter((item) => !!item) as string[];

				const articles = await tx.article.findMany({
					where: { id: { in: articleIds } },
				});

				if (articles.length !== articleIds.length) {
					throw new Error('One or more articles not found');
				}

				// Calculate total price
				const totalPrice = body.items.reduce((sum, item) => {
					return sum + item.price * item.quantity;
				}, 0);

				const totalPaid = body.payments.reduce((sum, payment) => {
					return sum + payment.amount;
				}, 0);

				const totalDue = totalPrice - totalPaid;

				// Update purchase
				const { items, ...updateData } = body;
				const updated = await tx.purchase.update({
					where: { id },
					data: {
						...updateData,

						items: {
							deleteMany: {},
							createMany: {
								data: body.items.map((item) => ({
									articleId: item.articleId,
									articleName: item.articleName,
									price: item.price,
									quantity: item.quantity,
									createdById: userId,
								})),
							},
						},

						payments: {
							deleteMany: {},
							createMany: {
								data: await Promise.all(
									body.payments.map(async (item) => ({
										ref: await getNextRef('purchases'),
										amount: item.amount,
										date: item.date,
										paymentMethod: item.paymentMethod as PaymentMethod,
										type: 'purchase' as TransactionType,
										agentId: item.agentId,
										fromId: item.accountId,
										createdById: userId,
									}))
								),
							},
						},

						totalPrice,
						totalDue,
						updatedAt: new Date(),
						updatedById: userId,
					},
					include: {
						supplier: true,
						items: {
							include: {
								article: true,
							},
						},
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
					items: true,
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
					message: 'Cannot delete purchase with existing transactions',
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
