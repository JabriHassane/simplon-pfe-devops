import { Request, Response } from 'express';
import { prisma } from '../index';
import {
	CreateSaleDtoType,
	UpdateSaleDtoType,
} from '../../../shared/dtos/sale.dto';
import { getPaginationCondition } from '../utils/pagination';

type SaleItemInput = { productId: string; price: number; quantity: number };

export const SaleController = {
	async getPage(req: Request, res: Response) {
		try {
			const { page, limit, skip, whereClause } = getPaginationCondition(req, [
				'ref',
				'receiptNumber',
				'invoiceNumber',
			]);

			const salesPromise = prisma.sale.findMany({
				where: whereClause,
				include: {
					client: true,
					items: {
						include: {
							product: true,
						},
					},
					payments: {
						include: {
							from: true,
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

			console.log(sales[0].payments);

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
							product: true,
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

			// Validate all products exist and have sufficient inventory
			for (const item of body.items) {
				const product = await prisma.product.findUnique({
					where: { id: item.productId },
				});

				if (!product) {
					return res
						.status(400)
						.json({ message: `Product ${item.productId} not found` });
				}

				if (product.inventory < item.quantity) {
					return res.status(400).json({
						message: `Insufficient inventory for product ${product.name}`,
					});
				}
			}

			// Calculate totals
			const subtotal = body.items.reduce(
				(sum: number, item: { price: number; quantity: number }) =>
					sum + item.price * item.quantity,
				0
			);
			const discount =
				body.discountType === 'percentage'
					? (subtotal * body.discountAmount) / 100
					: body.discountAmount;
			const totalPrice = subtotal - discount;

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
					discountAmount: body.discountAmount,
					discountType: body.discountType,
					note: body.note || '',
					agentId: userId,
					ref: `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
					createdById: userId,
					items: {
						create: body.items.map((item: SaleItemInput) => ({
							productId: item.productId,
							price: item.price,
							quantity: item.quantity,
							ref: `OI-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
							createdById: userId,
						})),
					},
				},
				include: {
					client: true,
					items: {
						include: {
							product: true,
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

			// Update product inventory
			for (const item of body.items) {
				await prisma.product.update({
					where: { id: item.productId },
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
					const product = await prisma.product.findUnique({
						where: { id: item.productId },
					});

					if (!product) {
						return res
							.status(400)
							.json({ message: `Product ${item.productId} not found` });
					}

					// Check inventory (considering current sale items)
					const currentSaleItem = existingSale.items.find(
						(si) => si.productId === item.productId
					);
					const currentQuantity = currentSaleItem
						? currentSaleItem.quantity
						: 0;
					const availableInventory = product.inventory + currentQuantity;

					if (availableInventory < item.quantity) {
						return res.status(400).json({
							message: `Insufficient inventory for product ${product.name}`,
						});
					}
				}
			}

			// Calculate new totals if items or discount changed
			let totalPrice = existingSale.totalPrice;
			if (
				body.items ||
				body.discountAmount !== undefined ||
				body.discountType !== undefined
			) {
				const currentItems = body.items || existingSale.items;
				const currentDiscountAmount =
					body.discountAmount ?? existingSale.discountAmount;
				const currentDiscountType =
					body.discountType ?? existingSale.discountType;

				const subtotal = currentItems.reduce(
					(sum: number, item: { price: number; quantity: number }) =>
						sum + item.price * item.quantity,
					0
				);
				const discount =
					currentDiscountType === 'percentage'
						? (subtotal * currentDiscountAmount) / 100
						: currentDiscountAmount;
				totalPrice = subtotal - discount;
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
							product: true,
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
						productId: item.productId,
						price: item.price,
						quantity: item.quantity,
						ref: `OI-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
						createdById: userId,
					})),
				});

				// Update product inventory
				for (const item of body.items) {
					const currentSaleItem = existingSale.items.find(
						(si) => si.productId === item.productId
					);
					const currentQuantity = currentSaleItem
						? currentSaleItem.quantity
						: 0;
					const quantityDifference = item.quantity - currentQuantity;

					if (quantityDifference !== 0) {
						await prisma.product.update({
							where: { id: item.productId },
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

			// Restore product inventory
			for (const item of existingSale.items) {
				await prisma.product.update({
					where: { id: item.productId },
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
