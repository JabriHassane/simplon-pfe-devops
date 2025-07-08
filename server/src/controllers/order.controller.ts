import { Request, Response } from 'express';
import { prisma } from '../index';
import {
	CreateOrderDtoType,
	UpdateOrderDtoType,
	OrderIdDtoType,
} from '../../../shared/dtos/order.dto';

type OrderItemInput = { productId: string; price: number; quantity: number };

export class OrderController {
	static async getAll(req: Request, res: Response) {
		try {
			const orders = await prisma.order.findMany({
				where: { deletedAt: null },
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
							username: true,
						},
					},
				},
				orderBy: { date: 'desc' },
			});

			res.json(orders);
		} catch (error) {
			console.error('Error in OrderController.getAll', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	}

	static async getById(req: Request, res: Response) {
		try {
			const { id } = req.params as OrderIdDtoType['params'];

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
							username: true,
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
			const {
				date,
				clientId,
				receiptNumber,
				invoiceNumber,
				items,
				status = 'pending',
				discountAmount = 0,
				discountType = 'fixed',
				note,
			} = req.body.body as CreateOrderDtoType['body'];

			// Check if client exists
			const client = await prisma.client.findUnique({
				where: { id: clientId },
			});

			if (!client) {
				return res.status(400).json({ message: 'Client not found' });
			}

			// Validate all products exist and have sufficient inventory
			for (const item of items) {
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
			const subtotal = items.reduce(
				(sum: number, item: { price: number; quantity: number }) =>
					sum + item.price * item.quantity,
				0
			);
			const discount =
				discountType === 'percentage'
					? (subtotal * discountAmount) / 100
					: discountAmount;
			const totalPrice = subtotal - discount;

			const order = await prisma.order.create({
				data: {
					date,
					clientId,
					receiptNumber,
					invoiceNumber,
					totalPrice,
					totalPaid: 0,
					totalDue: totalPrice,
					status,
					discountAmount,
					discountType,
					note: note || '',
					agentId: req.user?.userId || 'system',
					ref: `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
					createdBy: req.user?.userId || 'system',
					items: {
						create: items.map((item: OrderItemInput) => ({
							productId: item.productId,
							price: item.price,
							quantity: item.quantity,
							ref: `OI-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
							createdBy: req.user?.userId || 'system',
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
							username: true,
						},
					},
				},
			});

			// Update product inventory
			for (const item of items) {
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
			const { params, body } = req.body as UpdateOrderDtoType;

			// Check if order exists
			const existingOrder = await prisma.order.findUnique({
				where: { id: params.id },
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
			const order = await prisma.order.update({
				where: { id: params.id },
				data: {
					...(totalPrice !== existingOrder.totalPrice && {
						totalPrice,
						totalDue: totalPrice - existingOrder.totalPaid,
					}),
					updatedAt: new Date(),
					updatedBy: req.user?.userId || 'system',

					items: body.items
						? {
								deleteMany: {},
								createMany: {
									data: body.items.map((item) => ({
										...item,
										createdBy: req.user?.userId || 'system',
									})),
								},
						  }
						: undefined,
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
							username: true,
						},
					},
				},
			});

			// Update items if provided
			if (body.items) {
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
			const { id } = req.params as OrderIdDtoType['params'];

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
					deletedBy: req.user?.userId || 'system',
				},
			});

			res.json({ message: 'Order deleted successfully' });
		} catch (error) {
			console.error('Error in OrderController.delete', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	}
}
