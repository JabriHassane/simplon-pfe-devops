import { Request, Response } from 'express';
import { prisma } from '../index';
import { getOrderPaginationCondition } from '../utils/pagination';
import {
	CreateOrderDto,
	OrderDto,
	UpdateOrderDto,
} from '../../../shared/dtos/order.dto';
import { getNextRef } from '../utils/db.utils';
import { TransactionMethod, TransactionType } from '../../../shared/constants';

export const OrderController = {
	async getPage(req: Request, res: Response) {
		try {
			const { page, pageSize, skip, whereClause } =
				getOrderPaginationCondition(req);

			// Add type filter if provided
			const type = req.query.type as string;
			const finalWhereClause = {
				...whereClause,
				...(type && { type }),
			};

			const ordersPromise = prisma.order.findMany({
				where: finalWhereClause,
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
				take: pageSize,
			});

			const ordersCountPromise = prisma.order.count({
				where: finalWhereClause,
			});

			const [orders, total] = await Promise.all([
				ordersPromise,
				ordersCountPromise,
			]);

			const totalPages = Math.ceil(total / pageSize);

			res.json({
				data: orders,
				pagination: {
					page,
					pageSize,
					total,
					totalPages,
				},
			});
		} catch (error) {
			console.error('Error in orderController.getPage', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async getById(req: Request, res: Response) {
		try {
			const { id } = req.params;

			const order = await prisma.order.findUnique({
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

			if (!order) {
				return res.status(404).json({ message: 'Order not found' });
			}

			res.json(order);
		} catch (error) {
			console.error('Error in OrderController.getById', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async getTransactions(req: Request, res: Response) {
		try {
			const { id } = req.params;

			const transactions = await prisma.transaction.findMany({
				where: {
					orderId: id,
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
			console.error('Error in OrderController.getTransactions', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async create(req: Request, res: Response) {
		try {
			const { userId } = req.user!;
			const body = req.body as CreateOrderDto;

			if (body.contactId) {
				// Check if contact exists
				const contact = await prisma.contact.findUnique({
					where: { id: body.contactId },
				});

				if (!contact) {
					return res.status(400).json({ message: 'Contact not found' });
				}
			}

			const paymentRefs = await Promise.all(
				body.payments.map(() => getNextRef('transactions'))
			);

			const order = await prisma.order.create({
				data: {
					ref: await getNextRef(body.type === 'sale' ? 'sales' : 'purchases'),
					type: body.type,
					date: body.date,
					agentId: body.agentId,
					contactId: body.contactId,
					receiptNumber: body.receiptNumber,
					invoiceNumber: body.invoiceNumber,
					totalPrice: body.totalPrice,
					totalPaid: body.totalPaid,
					payments: {
						createMany: {
							data: body.payments.map((item, index) => ({
								ref: paymentRefs[index],
								amount: item.amount,
								date: item.date,
								method: item.method as TransactionMethod,
								type: body.type as TransactionType,
								agentId: item.agentId,
								createdById: userId,
							})),
						},
					},
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

			res.status(201).json(order);
		} catch (error) {
			console.error('Error in OrderController.create', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async update(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const { userId } = req.user!;
			const body = req.body as UpdateOrderDto;

			// Check if order exists
			const order = await prisma.order.findUnique({
				where: { id },
				include: {
					payments: true,
				},
			});

			if (!order) {
				throw new Error('Order not found');
			}

			if (body.contactId) {
				// Check if contact exists
				const contact = await prisma.contact.findUnique({
					where: { id: body.contactId },
				});

				if (!contact) {
					throw new Error('Contact not found');
				}
			}

			const existingPayments = order.payments;
			const newPayments = body.payments.filter(
				(payment) => !existingPayments.some((p) => p.ref === payment.ref)
			);
			const updatedPayments = body.payments.filter((payment) =>
				existingPayments.some((p) => p.ref === payment.ref)
			);
			const deletedPaymentsIds = existingPayments
				.filter((payment) => !body.payments.some((p) => p.ref === payment.ref))
				.map((p) => p.id);

			console.log('--------------------------------');
			console.log('newPayments', newPayments);
			console.log('--------------------------------');
			console.log('updatedPayments', updatedPayments);
			console.log('--------------------------------');
			console.log('deletedPaymentsIds', deletedPaymentsIds);
			console.log('--------------------------------');

			// Generate refs for new payments
			const newRefs: string[] = [];
			for (const _ of newPayments) {
				newRefs.push(await getNextRef('transactions'));
			}

			const newOrder = await prisma.order.update({
				where: { id },
				data: {
					...body,
					totalPrice: body.totalPrice,
					totalPaid: body.totalPaid,

					payments: {
						deleteMany: {
							id: { in: deletedPaymentsIds },
						},
						createMany: {
							data: newPayments.map((item, index) => ({
								ref: newRefs[index] || item.ref!,
								amount: item.amount,
								date: item.date,
								method: item.method as TransactionMethod,
								type: body.type as TransactionType,
								agentId: item.agentId,
								createdById: userId,
							})),
						},
						updateMany: updatedPayments.map((item) => ({
							where: { ref: item.ref! },
							data: {
								amount: item.amount,
								date: item.date,
								method: item.method as TransactionMethod,
								type: body.type as TransactionType,
								agentId: item.agentId,
								updatedById: userId,
							},
						})),
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

			return res.json(newOrder);
		} catch (error: any) {
			console.error('Error in OrderController.update', error);
			return res
				.status(500)
				.json({ message: error.message || 'Internal server error' });
		}
	},

	async delete(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const { userId } = req.user!;

			// Check if order exists
			const existingOrder = await prisma.order.findUnique({
				where: { id },
				include: {
					payments: true,
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
	},
};
