import { Request, Response } from 'express';
import { prisma } from '../index';
import { getPaginationCondition } from '../utils/pagination';
import { UpdatePurchaseDtoType } from '../../../shared/dtos/purchase.dto';
import { getNextRef } from '../utils/db.utils';

type PurchaseItemInput = { articleId: string; price: number; quantity: number };

export const PurchaseController = {
	async getPage(req: Request, res: Response) {
		try {
			const { page, limit, skip, whereClause } = getPaginationCondition(req, [
				'ref',
				'receiptNumber',
				'invoiceNumber',
			]);

			const [purchases, total] = await Promise.all([
				prisma.purchase.findMany({
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
								from: true,
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
				}),
				prisma.purchase.count({
					where: whereClause,
				}),
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

			// Update article inventory (purchases increase inventory)
			for (const item of items) {
				await prisma.article.update({
					where: { id: item.articleId },
					data: {
						inventory: {
							increment: item.quantity,
						},
					},
				});
			}

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
				const articleIds = body.items.map((item) => item.articleId);
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

				// Delete old items
				await tx.purchaseItem.deleteMany({
					where: { purchaseId: id },
				});

				// Create new items
				await tx.purchaseItem.createMany({
					data: body.items.map((item) => ({
						purchaseId: id,
						articleId: item.articleId,
						price: item.price,
						quantity: item.quantity,
						createdById: userId,
					})),
				});

				// Update article inventory
				for (const item of body.items) {
					const oldItem = existingPurchase.items.find(
						(pi) => pi.articleId === item.articleId
					);
					const oldQty = oldItem ? oldItem.quantity : 0;
					const diff = item.quantity - oldQty;

					if (diff !== 0) {
						await tx.article.update({
							where: { id: item.articleId },
							data: {
								inventory: {
									increment: diff,
								},
							},
						});
					}
				}

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

			// Reduce article inventory (purchases increase inventory, so deletion reduces it)
			for (const item of existingPurchase.items) {
				await prisma.article.update({
					where: { id: item.articleId },
					data: {
						inventory: {
							decrement: item.quantity,
						},
					},
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
