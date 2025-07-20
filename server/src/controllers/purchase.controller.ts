import { Request, Response } from 'express';
import { prisma } from '../index';
import { getPaginationCondition } from '../utils/pagination';
import { UpdatePurchaseDtoType } from '../../../shared/dtos/purchase.dto';

type PurchaseItemInput = { productId: string; price: number; quantity: number };

export const getAllPurchases = async (req: Request, res: Response) => {
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
		console.error('Get all purchases error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const getPurchaseById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const purchase = await prisma.purchase.findUnique({
			where: { id },
			include: {
				supplier: true,
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

		if (!purchase) {
			return res.status(404).json({ message: 'Purchase not found' });
		}

		res.json(purchase);
	} catch (error) {
		console.error('Get purchase by ID error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const createPurchase = async (req: Request, res: Response) => {
	try {
		const { userId } = req.user!;
		const {
			date,
			supplierId,
			receiptNumber,
			invoiceNumber,
			items,
			status = 'pending',
			discountAmount = 0,
			discountType = 'fixed',
			note,
		} = req.body;

		// Check if supplier exists
		const supplier = await prisma.supplier.findUnique({
			where: { id: supplierId },
		});

		if (!supplier) {
			return res.status(400).json({ message: 'Supplier not found' });
		}

		// Validate all products exist
		for (const item of items) {
			const product = await prisma.product.findUnique({
				where: { id: item.productId },
			});

			if (!product) {
				return res
					.status(400)
					.json({ message: `Product ${item.productId} not found` });
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
				discountAmount,
				discountType,
				note: note || '',
				agentId: userId,
				ref: `PUR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
				createdById: userId,
				items: {
					create: items.map((item: PurchaseItemInput) => ({
						productId: item.productId,
						price: item.price,
						quantity: item.quantity,
						ref: `PI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
						createdById: userId,
					})),
				},
			},
			include: {
				supplier: true,
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

		// Update product inventory (purchases increase inventory)
		for (const item of items) {
			await prisma.product.update({
				where: { id: item.productId },
				data: {
					inventory: {
						increment: item.quantity,
					},
				},
			});
		}

		res.status(201).json(purchase);
	} catch (error) {
		console.error('Create purchase error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const updatePurchase = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { userId } = req.user!;
		const body = req.body as UpdatePurchaseDtoType;

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

		// Check if supplier exists (if supplierId is being updated)
		if (body.supplierId) {
			const supplier = await prisma.supplier.findUnique({
				where: { id: body.supplierId },
			});

			if (!supplier) {
				return res.status(400).json({ message: 'Supplier not found' });
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
			}
		}

		// Calculate new totals if items or discount changed
		let totalPrice = existingPurchase.totalPrice;
		if (
			body.items ||
			body.discountAmount !== undefined ||
			body.discountType !== undefined
		) {
			const currentItems = body.items || existingPurchase.items;
			const currentDiscountAmount =
				body.discountAmount ?? existingPurchase.discountAmount;
			const currentDiscountType =
				body.discountType ?? existingPurchase.discountType;

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

		// Update purchase
		const { items, ...updateData } = body;
		const purchase = await prisma.purchase.update({
			where: { id },
			data: {
				...updateData,
				...(totalPrice !== existingPurchase.totalPrice && { totalPrice }),
				...(totalPrice !== existingPurchase.totalPaid && {
					totalDue: totalPrice - existingPurchase.totalPaid,
				}),
				updatedAt: new Date(),
				updatedById: userId,
			},
			include: {
				supplier: true,
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
			await prisma.purchaseItem.deleteMany({
				where: { purchaseId: id },
			});

			// Create new items
			await prisma.purchaseItem.createMany({
				data: body.items.map((item) => ({
					purchaseId: id,
					productId: item.productId,
					price: item.price,
					quantity: item.quantity,
					ref: `PI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
					createdById: userId,
				})),
			});

			// Update product inventory
			for (const item of body.items) {
				const currentPurchaseItem = existingPurchase.items.find(
					(pi) => pi.productId === item.productId
				);
				const currentQuantity = currentPurchaseItem
					? currentPurchaseItem.quantity
					: 0;
				const quantityDifference = item.quantity - currentQuantity;

				if (quantityDifference !== 0) {
					await prisma.product.update({
						where: { id: item.productId },
						data: {
							inventory: {
								increment: quantityDifference,
							},
						},
					});
				}
			}
		}

		res.json(purchase);
	} catch (error) {
		console.error('Update purchase error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const deletePurchase = async (req: Request, res: Response) => {
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

		// Reduce product inventory (purchases increase inventory, so deletion reduces it)
		for (const item of existingPurchase.items) {
			await prisma.product.update({
				where: { id: item.productId },
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
		console.error('Delete purchase error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};
