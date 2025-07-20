import { Request, Response } from 'express';
import { prisma } from '../index';
import {
	CreateOrderDtoType,
	UpdateOrderDtoType,
} from '../../../shared/dtos/order.dto';
import { getPaginationCondition } from '../utils/pagination';

type OrderItemInput = { productId: string; price: number; quantity: number };

export class OrderController {
	static async getAll(req: Request, res: Response) {
		try {
			const { page, limit, skip, whereClause } = getPaginationCondition(req, [
				'ref',
				'receiptNumber',
				'invoiceNumber',
			]);

			const [orders, total] = await Promise.all([
				prisma.order.findMany({
					where: whereClause,
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
					orderBy: { date: 'desc' },
					skip,
					take: limit,
				}),
				prisma.order.count({
					where: whereClause,
				}),
			]);

			const totalPages = Math.ceil(total / limit);

			res.json({
				data: orders,
				pagination: {
					page,
					limit,
					total,
					totalPages,
				},
			});
		} catch (error) {
			console.error('Error in OrderController.getAll', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	}

	static async getById(req: Request, res: Response) {
		try {
			const { id } = req.params;

			const order = await prisma.order.findUnique({
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

			if (!order) {
				return res.status(404).json({ message: 'Order not found' });
			}

			res.json(order);
		} catch (error) {
			console.error('Error in OrderController.getById', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	}

	static async create(req: Request, res: Response) {
		try {
			const { userId } = req.user!;
			const body = req.body as CreateOrderDtoType;

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

			const order = await prisma.order.create({
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
						create: body.items.map((item: OrderItemInput) => ({
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

			res.status(201).json(order);
		} catch (error) {
			console.error('Error in OrderController.create', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	}

	static async update(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const { userId } = req.user!;
			const body = req.body as UpdateOrderDtoType;

			// Check if order exists
			const existingOrder = await prisma.order.findUnique({
				where: { id },
				include: {
					items: true,
				},
			});

			if (!existingOrder) {
				return res.status(404).json({ message: 'Order not found' });
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

					// Check inventory (considering current order items)
					const currentOrderItem = existingOrder.items.find(
						(oi) => oi.productId === item.productId
					);
					const currentQuantity = currentOrderItem
						? currentOrderItem.quantity
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
			let totalPrice = existingOrder.totalPrice;
			if (
				body.items ||
				body.discountAmount !== undefined ||
				body.discountType !== undefined
			) {
				const currentItems = body.items || existingOrder.items;
				const currentDiscountAmount =
					body.discountAmount ?? existingOrder.discountAmount;
				const currentDiscountType =
					body.discountType ?? existingOrder.discountType;

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

			// Update order
			const { items, ...updateData } = body;
			const order = await prisma.order.update({
				where: { id },
				data: {
					...updateData,
					...(totalPrice !== existingOrder.totalPrice && {
						totalPrice,
						totalDue: totalPrice - existingOrder.totalPaid,
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
				await prisma.orderItem.deleteMany({
					where: { orderId: id },
				});

				// Create new items
				await prisma.orderItem.createMany({
					data: body.items.map((item) => ({
						orderId: id,
						productId: item.productId,
						price: item.price,
						quantity: item.quantity,
						ref: `OI-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
						createdById: userId,
					})),
				});

				// Update product inventory
				for (const item of body.items) {
					const currentOrderItem = existingOrder.items.find(
						(oi) => oi.productId === item.productId
					);
					const currentQuantity = currentOrderItem
						? currentOrderItem.quantity
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

			res.json(order);
		} catch (error) {
			console.error('Error in OrderController.update', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	}

	static async delete(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const { userId } = req.user!;

			// Check if order exists
			const existingOrder = await prisma.order.findUnique({
				where: { id },
				include: {
					items: true,
				},
			});

			if (!existingOrder) {
				return res.status(404).json({ message: 'Order not found' });
			}

			// Check if order has transactions
			const hasTransactions = await prisma.transaction.findFirst({
				where: { orderId: id },
			});

			if (hasTransactions) {
				return res.status(400).json({
					message: 'Cannot delete order with existing transactions',
				});
			}

			// Restore product inventory
			for (const item of existingOrder.items) {
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
			await prisma.order.update({
				where: { id },
				data: {
					deletedAt: new Date(),
					deletedById: userId,
				},
			});

			res.json({ message: 'Order deleted successfully' });
		} catch (error) {
			console.error('Error in OrderController.delete', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	}
}
