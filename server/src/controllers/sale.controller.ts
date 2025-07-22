import { Request, Response } from 'express';
import { prisma } from '../index';
import {
	CreateSaleDtoType,
	UpdateSaleDtoType,
} from '../../../shared/dtos/sale.dto';
import { getSalePaginationCondition } from '../utils/pagination';
import { getNextRef } from '../utils/db.utils';
import { TransactionType } from '../../../shared/constants';
import { Transaction } from '@prisma/client';

export const SaleController = {
	async getPage(req: Request, res: Response) {
		try {
			const { page, limit, skip, whereClause } =
				getSalePaginationCondition(req);

			const salesPromise = prisma.sale.findMany({
				where: whereClause,
				include: {
					client: true,
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

			const salesCountPromise = prisma.sale.count({
				where: whereClause,
			});

			const [sales, total] = await Promise.all([
				salesPromise,
				salesCountPromise,
			]);

			const totalPages = Math.ceil(total / limit);

			res.json({
				data: sales,
				pagination: {
					page,
					limit,
					total,
					totalPages,
				},
			});
		} catch (error) {
			console.error('Error in SaleController.getPage', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async getById(req: Request, res: Response) {
		try {
			const { id } = req.params;

			const sale = await prisma.sale.findUnique({
				where: { id },
				include: {
					client: true,
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

			if (!sale) {
				return res.status(404).json({ message: 'Sale not found' });
			}

			res.json(sale);
		} catch (error) {
			console.error('Error in SaleController.getById', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async getTransactions(req: Request, res: Response) {
		try {
			const { id } = req.params;

			const transactions = await prisma.transaction.findMany({
				where: {
					saleId: id,
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
			console.error('Error in SaleController.getTransactions', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async create(req: Request, res: Response) {
		try {
			const { userId } = req.user!;
			const body = req.body as CreateSaleDtoType;

			// Check if client exists
			const client = await prisma.client.findUnique({
				where: { id: body.clientId },
			});

			if (!client) {
				return res.status(400).json({ message: 'Client not found' });
			}

			// Validate all articles exist and have sufficient inventory
			for (const item of body.items) {
				const article = await prisma.article.findUnique({
					where: { id: item.articleId },
				});

				if (!article) {
					return res
						.status(400)
						.json({ message: `Article ${item.articleId} not found` });
				}

				if (article.inventory < item.quantity) {
					return res.status(400).json({
						message: `Insufficient inventory for article ${article.name}`,
					});
				}
			}

			// Calculate totals
			const subtotal = body.items.reduce(
				(sum: number, item: { price: number; quantity: number }) =>
					sum + item.price * item.quantity,
				0
			);
			const totalPrice = subtotal;

			const sale = await prisma.sale.create({
				data: {
					date: body.date,
					clientId: body.clientId,
					receiptNumber: body.receiptNumber,
					invoiceNumber: body.invoiceNumber,
					totalPrice,
					totalPaid: 0,
					totalDue: totalPrice,
					status: body.status,
					note: body.note || '',
					agentId: userId,
					ref: await getNextRef('sales'),
					createdById: userId,
					items: {
						create: body.items.map((item) => ({
							articleId: item.articleId,
							articleName: item.articleName,
							price: item.price,
							quantity: item.quantity,
							createdById: userId,
						})),
					},
					payments: {
						create: await Promise.all(
							body.payments.map(async (payment) => ({
								ref: await getNextRef('transactions'),
								date: payment.date,
								type: 'sale' as TransactionType,
								paymentMethod: payment.paymentMethod,
								amount: payment.amount,
								agentId: payment.agentId,
								toId: payment.accountId,
								createdById: userId,
							}))
						),
					},
				},
				include: {
					client: true,
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

			// Update article inventory
			for (const item of body.items) {
				await prisma.article.update({
					where: { id: item.articleId },
					data: {
						inventory: {
							decrement: item.quantity,
						},
					},
				});
			}

			res.status(201).json(sale);
		} catch (error) {
			console.error('Error in SaleController.create', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async update(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const { userId } = req.user!;
			const body = req.body as UpdateSaleDtoType;

			// Check if sale exists
			const existingSale = await prisma.sale.findUnique({
				where: { id },
				include: {
					items: true,
				},
			});

			if (!existingSale) {
				return res.status(404).json({ message: 'Sale not found' });
			}

			// Check if client exists (if clientId is being updated)
			if (body.clientId) {
				const client = await prisma.client.findUnique({
					where: { id: body.clientId },
				});

				if (!client) {
					return res.status(400).json({ message: 'Client not found' });
				}
			}

			// If items are being updated, validate them
			if (body.items) {
				for (const item of body.items) {
					const article = await prisma.article.findUnique({
						where: { id: item.articleId },
					});

					if (!article) {
						return res
							.status(400)
							.json({ message: `Article ${item.articleId} not found` });
					}

					// Check inventory (considering current sale items)
					const currentSaleItem = existingSale.items.find(
						(si) => si.articleId === item.articleId
					);
					const currentQuantity = currentSaleItem
						? currentSaleItem.quantity
						: 0;
					const availableInventory = article.inventory + currentQuantity;

					if (availableInventory < item.quantity) {
						return res.status(400).json({
							message: `Insufficient inventory for article ${article.name}`,
						});
					}
				}
			}

			// Calculate new totals if items changed
			let totalPrice = existingSale.totalPrice;
			if (body.items) {
				const currentItems = body.items || existingSale.items;

				totalPrice = currentItems.reduce(
					(sum: number, item: { price: number; quantity: number }) =>
						sum + item.price * item.quantity,
					0
				);
			}

			// Update sale
			const { items, ...updateData } = body;
			const sale = await prisma.sale.update({
				where: { id },
				data: {
					...updateData,
					...(totalPrice !== existingSale.totalPrice && {
						totalPrice,
						totalDue: totalPrice - existingSale.totalPaid,
					}),
					updatedAt: new Date(),
					updatedById: userId,
				},
				include: {
					client: true,
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

			// Update items if provided
			if (body.items) {
				// Delete existing items
				await prisma.saleItem.deleteMany({
					where: { saleId: id },
				});

				// Create new items
				await prisma.saleItem.createMany({
					data: body.items.map((item) => ({
						saleId: id,
						articleId: item.articleId,
						price: item.price,
						quantity: item.quantity,
						ref: `OI-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
						createdById: userId,
					})),
				});

				// Update article inventory
				for (const item of body.items) {
					const currentSaleItem = existingSale.items.find(
						(si) => si.articleId === item.articleId
					);
					const currentQuantity = currentSaleItem
						? currentSaleItem.quantity
						: 0;
					const quantityDifference = item.quantity - currentQuantity;

					if (quantityDifference !== 0) {
						await prisma.article.update({
							where: { id: item.articleId },
							data: {
								inventory: {
									decrement: quantityDifference,
								},
							},
						});
					}
				}
			}

			res.json(sale);
		} catch (error) {
			console.error('Error in SaleController.update', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async delete(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const { userId } = req.user!;

			// Check if sale exists
			const existingSale = await prisma.sale.findUnique({
				where: { id },
				include: {
					items: true,
				},
			});

			if (!existingSale) {
				return res.status(404).json({ message: 'Sale not found' });
			}

			// Check if sale has transactions
			const hasTransactions = await prisma.transaction.findFirst({
				where: { saleId: id },
			});

			if (hasTransactions) {
				return res.status(400).json({
					message: 'Cannot delete sale with existing transactions',
				});
			}

			// Restore article inventory
			for (const item of existingSale.items) {
				await prisma.article.update({
					where: { id: item.articleId },
					data: {
						inventory: {
							increment: item.quantity,
						},
					},
				});
			}

			// Soft delete
			await prisma.sale.update({
				where: { id },
				data: {
					deletedAt: new Date(),
					deletedById: userId,
				},
			});

			res.json({ message: 'Sale deleted successfully' });
		} catch (error) {
			console.error('Error in SaleController.delete', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},
};
