import { Request, Response } from 'express';
import { prisma } from '../index';

export const getAllProductCategories = async (req: Request, res: Response) => {
	try {
		const categories = await prisma.productCategory.findMany({
			where: { deletedAt: null },
			orderBy: { name: 'asc' },
		});

		res.json(categories);
	} catch (error) {
		console.error('Get all product categories error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const getProductCategoryById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const category = await prisma.productCategory.findUnique({
			where: { id },
		});

		if (!category) {
			return res.status(404).json({ message: 'Product category not found' });
		}

		res.json(category);
	} catch (error) {
		console.error('Get product category by ID error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const createProductCategory = async (req: Request, res: Response) => {
	try {
		const { name } = req.body;

		// Check if category with same name already exists
		const existingCategory = await prisma.productCategory.findFirst({
			where: {
				name: {
					equals: name,
					mode: 'insensitive',
				},
				deletedAt: null,
			},
		});

		if (existingCategory) {
			return res
				.status(400)
				.json({ message: 'Product category with this name already exists' });
		}

		const category = await prisma.productCategory.create({
			data: {
				name,
				ref: `CAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
				createdBy: req.user?.userId,
			},
		});

		res.status(201).json(category);
	} catch (error) {
		console.error('Create product category error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const updateProductCategory = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { name } = req.body;

		// Check if category exists
		const existingCategory = await prisma.productCategory.findUnique({
			where: { id },
		});

		if (!existingCategory) {
			return res.status(404).json({ message: 'Product category not found' });
		}

		// Check if name already exists (if name is being updated)
		if (name && name !== existingCategory.name) {
			const duplicateCategory = await prisma.productCategory.findFirst({
				where: {
					name: {
						equals: name,
						mode: 'insensitive',
					},
					deletedAt: null,
					NOT: { id },
				},
			});

			if (duplicateCategory) {
				return res
					.status(400)
					.json({ message: 'Product category with this name already exists' });
			}
		}

		const category = await prisma.productCategory.update({
			where: { id },
			data: {
				name,
				updatedAt: new Date(),
				updatedBy: req.user?.userId,
			},
		});

		res.json(category);
	} catch (error) {
		console.error('Update product category error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const deleteProductCategory = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		// Check if category exists
		const existingCategory = await prisma.productCategory.findUnique({
			where: { id },
		});

		if (!existingCategory) {
			return res.status(404).json({ message: 'Product category not found' });
		}

		// Check if category has products
		const hasProducts = await prisma.product.findFirst({
			where: { categoryId: id },
		});

		if (hasProducts) {
			return res.status(400).json({
				message: 'Cannot delete category with existing products',
			});
		}

		// Soft delete
		await prisma.productCategory.update({
			where: { id },
			data: {
				deletedAt: new Date(),
				deletedBy: req.user?.userId,
			},
		});

		res.json({ message: 'Product category deleted successfully' });
	} catch (error) {
		console.error('Delete product category error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};
