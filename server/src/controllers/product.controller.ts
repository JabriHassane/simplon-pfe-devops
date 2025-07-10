import { Request, Response } from 'express';
import { prisma } from '../index';

export const getAllProducts = async (req: Request, res: Response) => {
	try {
		const products = await prisma.product.findMany({
			where: { deletedAt: null },
			include: {
				category: true,
			},
			orderBy: { createdAt: 'desc' },
		});

		res.json(products);
	} catch (error) {
		console.error('Get all products error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const getProductById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const product = await prisma.product.findUnique({
			where: { id },
			include: {
				category: true,
			},
		});

		if (!product) {
			return res.status(404).json({ message: 'Product not found' });
		}

		res.json(product);
	} catch (error) {
		console.error('Get product by ID error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const createProduct = async (req: Request, res: Response) => {
	try {
		const { name, image, categoryId, price, inventory } = req.body;

		// Check if category exists
		const category = await prisma.productCategory.findUnique({
			where: { id: categoryId },
		});

		if (!category) {
			return res.status(400).json({ message: 'Invalid category' });
		}

		// Check if product with same name already exists
		const existingProduct = await prisma.product.findFirst({
			where: {
				name: {
					equals: name,
					mode: 'insensitive',
				},
				deletedAt: null,
			},
		});

		if (existingProduct) {
			return res
				.status(400)
				.json({ message: 'Product with this name already exists' });
		}

		const product = await prisma.product.create({
			data: {
				name,
				image: image || '',
				categoryId,
				price: parseFloat(price),
				inventory: parseInt(inventory),
				ref: `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
				createdBy: req.user?.userId,
			},
			include: {
				category: true,
			},
		});

		res.status(201).json(product);
	} catch (error) {
		console.error('Create product error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const updateProduct = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { name, image, categoryId, price, inventory } = req.body;

		// Check if product exists
		const existingProduct = await prisma.product.findUnique({
			where: { id },
		});

		if (!existingProduct) {
			return res.status(404).json({ message: 'Product not found' });
		}

		// Check if category exists (if categoryId is being updated)
		if (categoryId) {
			const category = await prisma.productCategory.findUnique({
				where: { id: categoryId },
			});

			if (!category) {
				return res.status(400).json({ message: 'Invalid category' });
			}
		}

		// Check if name already exists (if name is being updated)
		if (name && name !== existingProduct.name) {
			const duplicateProduct = await prisma.product.findFirst({
				where: {
					name: {
						equals: name,
						mode: 'insensitive',
					},
					deletedAt: null,
					NOT: { id },
				},
			});

			if (duplicateProduct) {
				return res
					.status(400)
					.json({ message: 'Product with this name already exists' });
			}
		}

		const product = await prisma.product.update({
			where: { id },
			data: {
				...(name && { name }),
				...(image !== undefined && { image }),
				...(categoryId && { categoryId }),
				...(price !== undefined && { price: parseFloat(price) }),
				...(inventory !== undefined && { inventory: parseInt(inventory) }),
				updatedAt: new Date(),
				updatedBy: req.user?.userId,
			},
			include: {
				category: true,
			},
		});

		res.json(product);
	} catch (error) {
		console.error('Update product error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const deleteProduct = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		// Check if product exists
		const existingProduct = await prisma.product.findUnique({
			where: { id },
		});

		if (!existingProduct) {
			return res.status(404).json({ message: 'Product not found' });
		}

		// Check if product has orders
		const hasOrders = await prisma.orderItem.findFirst({
			where: { productId: id },
		});

		if (hasOrders) {
			return res.status(400).json({
				message: 'Cannot delete product with existing orders',
			});
		}

		// Soft delete
		await prisma.product.update({
			where: { id },
			data: {
				deletedAt: new Date(),
				deletedBy: req.user?.userId,
			},
		});

		res.json({ message: 'Product deleted successfully' });
	} catch (error) {
		console.error('Delete product error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};
