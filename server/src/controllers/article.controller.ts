import { Request, Response } from 'express';
import { prisma } from '../index';
import { getPaginationCondition } from '../utils/pagination';

export const ArticleController = {
	async getPage(req: Request, res: Response) {
		try {
			const { page, limit, skip, whereClause } = getPaginationCondition(req, [
				'name',
				'ref',
			]);

			// Get total count for pagination
			const total = await prisma.article.count({ where: whereClause });

			// Get paginated results
			const articles = await prisma.article.findMany({
				where: whereClause,
				include: {
					category: true,
				},
				orderBy: { createdAt: 'desc' },
				skip,
				take: limit,
			});

			res.json({
				data: articles,
				pagination: {
					page,
					limit,
					total,
					totalPages: Math.ceil(total / limit),
				},
			});
		} catch (error) {
			console.error('Error in ArticleController.getPage', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async getById(req: Request, res: Response) {
		try {
			const { id } = req.params;

			const article = await prisma.article.findUnique({
				where: { id },
				include: {
					category: true,
				},
			});

			if (!article) {
				return res.status(404).json({ message: 'Article not found' });
			}

			res.json(article);
		} catch (error) {
			console.error('Error in ArticleController.getById', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async create(req: Request, res: Response) {
		try {
			const { userId } = req.user!;
			const { name, image, categoryId, price } = req.body;

			// Check if category exists
			const category = await prisma.category.findUnique({
				where: { id: categoryId },
			});

			if (!category) {
				return res.status(400).json({ message: 'Invalid category' });
			}

			const article = await prisma.article.create({
				data: {
					name,
					image: image || '',
					categoryId,
					price: parseFloat(price),
					ref: `ART-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
					createdById: userId,
				},
				include: {
					category: true,
				},
			});

			res.status(201).json(article);
		} catch (error) {
			console.error('Error in ArticleController.create', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async update(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const { userId } = req.user!;
			const { name, image, categoryId, price } = req.body;

			// Check if article exists
			const existingArticle = await prisma.article.findUnique({
				where: { id },
			});

			if (!existingArticle) {
				return res.status(404).json({ message: 'Article not found' });
			}

			// Check if category exists (if categoryId is being updated)
			if (categoryId) {
				const category = await prisma.category.findUnique({
					where: { id: categoryId },
				});

				if (!category) {
					return res.status(400).json({ message: 'Invalid category' });
				}
			}

			const article = await prisma.article.update({
				where: { id },
				data: {
					...(name && { name }),
					...(image !== undefined && { image }),
					...(categoryId && { categoryId }),
					...(price !== undefined && { price: parseFloat(price) }),
					updatedAt: new Date(),
					updatedById: userId,
				},
				include: {
					category: true,
				},
			});

			res.json(article);
		} catch (error) {
			console.error('Error in ArticleController.update', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async delete(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const { userId } = req.user!;

			// Check if article exists
			const existingArticle = await prisma.article.findUnique({
				where: { id },
			});

			if (!existingArticle) {
				return res.status(404).json({ message: 'Article not found' });
			}

			// Check if article has sales
			const hasSales = await prisma.saleItem.findFirst({
				where: { articleId: id },
			});

			if (hasSales) {
				return res.status(400).json({
					message: 'Cannot delete article with existing sales',
				});
			}

			// Soft delete
			await prisma.article.update({
				where: { id },
				data: {
					deletedAt: new Date(),
					deletedById: userId,
				},
			});

			res.json({ message: 'Article deleted successfully' });
		} catch (error) {
			console.error('Error in ArticleController.delete', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},
};
