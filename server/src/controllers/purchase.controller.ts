import { Request, Response } from 'express';
import { prisma } from '../index';

type PurchaseItemInput = { productId: string; price: number; quantity: number };

export const getAllPurchases = async (req: Request, res: Response) => {
	try {
		const purchases = await prisma.purchase.findMany({
			where: { deletedAt: null },
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
						username: true,
					},
				},
			},
			orderBy: { date: 'desc' },
		});

		res.json(purchases);
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
						username: true,
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
				agentId: req.user?.userId || 'system',
				ref: `PUR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
				createdBy: req.user?.userId || 'system',
				items: {
					create: items.map((item: PurchaseItemInput) => ({
						productId: item.productId,
						price: item.price,
						quantity: item.quantity,
						ref: `PI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
						createdBy: req.user?.userId || 'system',
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
						username: true,
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
		const {
			date,
			supplierId,
			receiptNumber,
			invoiceNumber,
			items,
			status,
			discountAmount,
			discountType,
			note,
		} = req.body;

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
		if (supplierId) {
			const supplier = await prisma.supplier.findUnique({
				where: { id: supplierId },
			});

			if (!supplier) {
				return res.status(400).json({ message: 'Supplier not found' });
			}
		}

		// If items are being updated, validate them
		if (items) {
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
		}

		// Calculate new totals if items or discount changed
		let totalPrice = existingPurchase.totalPrice;
		if (items || discountAmount !== undefined || discountType !== undefined) {
			const currentItems = items || existingPurchase.items;
			const currentDiscountAmount =
				discountAmount ?? existingPurchase.discountAmount;
			const currentDiscountType = discountType ?? existingPurchase.discountType;

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
		const purchase = await prisma.purchase.update({
			where: { id },
			data: {
				...(date && { date }),
				...(supplierId && { supplierId }),
				...(receiptNumber && { receiptNumber }),
				...(invoiceNumber && { invoiceNumber }),
				...(status && { status }),
				...(discountAmount !== undefined && { discountAmount }),
				...(discountType && { discountType }),
				...(note !== undefined && { note }),
				...(totalPrice !== existingPurchase.totalPrice && {
					totalPrice,
					totalDue: totalPrice - existingPurchase.totalPaid,
				}),
				updatedAt: new Date(),
				updatedBy: req.user?.userId || 'system',
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
						username: true,
					},
				},
			},
		});

		// Update items if provided
		if (items) {
			// Delete existing items
			await prisma.purchaseItem.deleteMany({
				where: { purchaseId: id },
			});

			// Create new items
			await prisma.purchaseItem.createMany({
				data: (
					items as { productId: string; price: number; quantity: number }[]
				).map(
					(item: { productId: string; price: number; quantity: number }) => ({
						purchaseId: id,
						productId: item.productId,
						price: item.price,
						quantity: item.quantity,
						ref: `PI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
						createdBy: req.user?.userId || 'system',
					})
				),
			});

			// Update product inventory
			for (const item of items) {
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
				deletedBy: req.user?.userId || 'system',
			},
		});

		res.json({ message: 'Purchase deleted successfully' });
	} catch (error) {
		console.error('Delete purchase error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};
