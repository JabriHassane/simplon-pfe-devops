import { Request, Response } from 'express';
import { prisma } from '../index';
import { getOrderPaginationCondition } from '../utils/pagination';
import {
	CreateSaleDtoType,
	SaleDtoType,
	UpdateSaleDtoType,
} from '../../../shared/dtos/sale.dto';
import { getNextRef } from '../utils/db.utils';
import { TransactionMethod, TransactionType } from '../../../shared/constants';

export const SaleController = {
	async getPage(req: Request, res: Response) {
		try {
			const { page, limit, skip, whereClause } =
				getOrderPaginationCondition(req);

			const salesPromise = prisma.sale.findMany({
				where: whereClause,
				include: {
					client: true,
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

			const salesCountPromise = prisma.sale.count({
				where: whereClause,
			});

			const [sales, total] = await Promise.all([salesPromise, salesCountPromise]);

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
			console.error('Error in saleController.getPage', error);
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
				return res.status(400).json({ message: 'Supplier not found' });
			}

			const sale = await prisma.sale.create({
				data: {
					ref: await getNextRef('sales'),
					date: body.date,
					agentId: body.agentId,
					clientId: body.clientId,
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
					client: true,
					agent: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			});

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

			const updatedSale = await prisma.$transaction(async (tx) => {
				// Check if sale exists
				const isExists = await tx.sale.findUnique({
					where: { id },
				});

				if (!isExists) {
					throw new Error('Sale not found');
				}

				// Check if client exists
				const client = await tx.client.findUnique({
					where: { id: body.clientId },
				});

				if (!client) {
					throw new Error('Supplier not found');
				}

				// Update sale
				const { ...updateData } = body;
				const updated = await tx.sale.update({
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
										ref: await getNextRef('sales'),
										amount: item.amount,
										date: item.date,
										method: item.method as TransactionMethod,
										type: 'sale' as TransactionType,
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
						client: true,
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

			return res.json(updatedSale);
		} catch (error: any) {
			console.error('Error in SaleController.update', error);
			return res
				.status(500)
				.json({ message: error.message || 'Internal server error' });
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
					payments: true,
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
