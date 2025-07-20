import { Request, Response } from 'express';
import { prisma } from '../index';
import { getPaginationCondition } from '../utils/pagination';

export const getAllProductCategories = async (req: Request, res: Response) => {
	try {
		const { page, limit, skip, whereClause } = getPaginationCondition(req, [
			'name',
			'ref',
		]);

		const [categories, total] = await Promise.all([
			prisma.productCategory.findMany({
				where: whereClause,
				orderBy: { name: 'asc' },
				skip,
				take: limit,
			}),
			prisma.productCategory.count({
				where: whereClause,
			}),
		]);

		const totalPages = Math.ceil(total / limit);

		res.json({
			data: categories,
			pagination: {
				page,
				limit,
				total,
				totalPages,
			},
		});
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
		const { userId } = req.user!;
		const { name } = req.body;

		const category = await prisma.productCategory.create({
			data: {
				name,
				ref: `CAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
				createdById: userId,
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
		const { userId } = req.user!;
		const { name } = req.body;

		// Check if category exists
		const existingCategory = await prisma.productCategory.findUnique({
			where: { id },
		});

		if (!existingCategory) {
			return res.status(404).json({ message: 'Product category not found' });
		}

		const category = await prisma.productCategory.update({
			where: { id },
			data: {
				name,
				updatedAt: new Date(),
				updatedById: userId,
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
		const { userId } = req.user!;

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
				deletedById: userId,
			},
		});

		res.json({ message: 'Product category deleted successfully' });
	} catch (error) {
		console.error('Delete product category error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};
