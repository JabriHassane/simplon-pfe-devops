import { Request, Response } from 'express';
import { prisma } from '../index';
import { getPaginationCondition } from '../utils/pagination';

export const CategoryController = {
	async getPage(req: Request, res: Response) {
		try {
			const { page, limit, skip, whereClause } = getPaginationCondition(req, [
				'name',
				'ref',
			]);

			const [categories, total] = await Promise.all([
				prisma.category.findMany({
					where: whereClause,
					orderBy: { name: 'asc' },
					skip,
					take: limit,
				}),
				prisma.category.count({
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
			console.error('Error in CategoryController.getPage', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async getById(req: Request, res: Response) {
		try {
			const { id } = req.params;

			const category = await prisma.category.findUnique({
				where: { id },
			});

			if (!category) {
				return res.status(404).json({ message: 'Article category not found' });
			}

			res.json(category);
		} catch (error) {
			console.error('Error in CategoryController.getById', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async create(req: Request, res: Response) {
		try {
			const { userId } = req.user!;
			const { name } = req.body;

			const category = await prisma.category.create({
				data: {
					name,
					ref: `CAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
					createdById: userId,
				},
			});

			res.status(201).json(category);
		} catch (error) {
			console.error('Error in CategoryController.create', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async update(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const { userId } = req.user!;
			const { name } = req.body;

			// Check if category exists
			const existingCategory = await prisma.category.findUnique({
				where: { id },
			});

			if (!existingCategory) {
				return res.status(404).json({ message: 'Article category not found' });
			}

			const category = await prisma.category.update({
				where: { id },
				data: {
					name,
					updatedAt: new Date(),
					updatedById: userId,
				},
			});

			res.json(category);
		} catch (error) {
			console.error('Error in CategoryController.update', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async delete(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const { userId } = req.user!;

			// Check if category exists
			const existingCategory = await prisma.category.findUnique({
				where: { id },
			});

			if (!existingCategory) {
				return res.status(404).json({ message: 'Article category not found' });
			}

			// Check if category has articles
			const hasArticles = await prisma.article.findFirst({
				where: { categoryId: id },
			});

			if (hasArticles) {
				return res.status(400).json({
					message: 'Cannot delete category with existing articles',
				});
			}

			// Soft delete
			await prisma.category.update({
				where: { id },
				data: {
					deletedAt: new Date(),
					deletedById: userId,
				},
			});

			res.json({ message: 'Article category deleted successfully' });
		} catch (error) {
			console.error('Error in CategoryController.delete', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},
};
