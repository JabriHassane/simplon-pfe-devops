import { Request, Response } from 'express';
import { prisma } from '../index';
import { CreateUserDtoType } from '../../../shared/dtos/user.dto';
import { getPaginationCondition } from '../utils/pagination';
import { hashPassword } from '../utils/auth.utils';
import { getNextRef } from '../utils/db.utils';

export const UserController = {
	async getPage(req: Request, res: Response) {
		try {
			const { page, pageSize, skip, whereClause } = getPaginationCondition(
				req,
				['name', 'ref']
			);

			// Get total count for pagination
			const total = await prisma.user.count({ where: whereClause });

			// Get paginated results
			const users = await prisma.user.findMany({
				where: whereClause,
				orderBy: { createdAt: 'desc' },
				skip,
				take: pageSize,
			});

			res.json({
				data: users,
				pagination: {
					page,
					pageSize,
					total,
					totalPages: Math.ceil(total / pageSize),
				},
			});
		} catch (error) {
			console.error('Error in UserController.getPage', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async getById(req: Request, res: Response) {
		try {
			const { id } = req.params;

			const user = await prisma.user.findUnique({
				where: { id },
			});

			if (!user) {
				return res.status(404).json({ message: 'User not found' });
			}

			res.json(user);
		} catch (error) {
			console.error('Error in UserController.getById', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async create(req: Request, res: Response) {
		try {
			const body = req.body as CreateUserDtoType;
			const { userId } = req.user!;

			// Check if user already exists
			const isExist = await prisma.user.findFirst({
				where: { name: body.name },
			});

			if (isExist) {
				return res
					.status(400)
					.json({ message: "Nom d'utilisateur déjà existant" });
			}

			const hashedPassword = await hashPassword(body.password);

			const ref = await getNextRef('users');

			// Create user
			const user = await prisma.user.create({
				data: {
					name: body.name,
					password: hashedPassword,
					role: body.role,
					ref,
					createdById: userId,
				},
			});

			res.status(201).json(user);
		} catch (error) {
			console.error('Error in UserController.create', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async update(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const { userId } = req.user!;
			const body = req.body as CreateUserDtoType;

			// Check if user exists
			const isExist = await prisma.user.findUnique({
				where: { id },
			});

			if (!isExist) {
				return res.status(404).json({ message: 'User not found' });
			}

			const hashedPassword = body.password
				? await hashPassword(body.password)
				: undefined;

			const user = await prisma.user.update({
				where: { id },
				data: {
					...body,
					password: hashedPassword,
					updatedAt: new Date(),
					updatedById: userId,
				},
			});

			res.json(user);
		} catch (error) {
			console.error('Error in UserController.update', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async delete(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const { userId } = req.user!;

			// Check if user exists
			const isExist = await prisma.user.findUnique({
				where: { id },
			});

			if (!isExist) {
				return res.status(404).json({ message: 'User not found' });
			}

			// Soft delete
			await prisma.user.update({
				where: { id },
				data: {
					deletedAt: new Date(),
					deletedById: userId,
				},
			});

			res.json({ message: 'User deleted successfully' });
		} catch (error) {
			console.error('Error in UserController.delete', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},
};
