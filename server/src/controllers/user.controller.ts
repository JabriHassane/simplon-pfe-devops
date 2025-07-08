import { Request, Response } from 'express';
import { prisma } from '../index';
import {
	CreateUserDtoType,
	UpdateUserDtoType,
	UserIdDtoType,
} from '../../../shared/dtos/user.dto';

export class UserController {
	static async getAll(req: Request, res: Response) {
		try {
			const users = await prisma.user.findMany({
				where: { deletedAt: null },
				select: {
					id: true,
					ref: true,
					username: true,
					email: true,
					role: true,
					createdAt: true,
					updatedAt: true,
				},
				orderBy: { createdAt: 'desc' },
			});

			res.json(users);
		} catch (error) {
			console.error('Error in UserController.getAll', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	}

	static async getById(req: Request, res: Response) {
		try {
			const { id } = req.params as UserIdDtoType['params'];

			const user = await prisma.user.findUnique({
				where: { id },
				select: {
					id: true,
					ref: true,
					username: true,
					email: true,
					role: true,
					createdAt: true,
					updatedAt: true,
				},
			});

			if (!user) {
				return res.status(404).json({ message: 'User not found' });
			}

			res.json(user);
		} catch (error) {
			console.error('Error in UserController.getById', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	}

	static async create(req: Request, res: Response) {
		try {
			const {
				username,
				email,
				password,
				role = 'AGENT',
			} = req.body.body as CreateUserDtoType['body'];

			// Check if user already exists
			const existingUser = await prisma.user.findFirst({
				where: {
					OR: [{ username }, { email }],
				},
			});

			if (existingUser) {
				return res
					.status(400)
					.json({ message: 'Username or email already exists' });
			}

			const user = await prisma.user.create({
				data: {
					username,
					email,
					password,
					role,
					ref: `USER-${Date.now()}`,
					createdBy: req.user?.userId || 'system',
				},
				select: {
					id: true,
					ref: true,
					username: true,
					email: true,
					role: true,
					createdAt: true,
					updatedAt: true,
				},
			});

			res.status(201).json(user);
		} catch (error) {
			console.error('Error in UserController.create', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	}

	static async update(req: Request, res: Response) {
		try {
			const { params, body } = req.body as UpdateUserDtoType;

			// Check if user exists
			const existingUser = await prisma.user.findUnique({
				where: { id: params.id },
			});

			if (!existingUser) {
				return res.status(404).json({ message: 'User not found' });
			}

			// Check if username or email already exists
			if (body.username || body.email) {
				const duplicateUser = await prisma.user.findFirst({
					where: {
						OR: [
							...(body.username ? [{ username: body.username }] : []),
							...(body.email ? [{ email: body.email }] : []),
						],
						NOT: { id: params.id },
					},
				});

				if (duplicateUser) {
					return res
						.status(400)
						.json({ message: 'Username or email already exists' });
				}
			}

			const user = await prisma.user.update({
				where: { id: params.id },
				data: {
					...(body.username && { username: body.username }),
					...(body.email && { email: body.email }),
					...(body.role && { role: body.role }),
					updatedAt: new Date(),
					updatedBy: req.user?.userId || 'system',
				},
				select: {
					id: true,
					ref: true,
					username: true,
					email: true,
					role: true,
					createdAt: true,
					updatedAt: true,
				},
			});

			res.json(user);
		} catch (error) {
			console.error('Error in UserController.update', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	}

	static async delete(req: Request, res: Response) {
		try {
			const { id } = req.params as UserIdDtoType['params'];

			// Check if user exists
			const existingUser = await prisma.user.findUnique({
				where: { id },
			});

			if (!existingUser) {
				return res.status(404).json({ message: 'User not found' });
			}

			// Soft delete
			await prisma.user.update({
				where: { id },
				data: {
					deletedAt: new Date(),
					deletedBy: req.user?.userId || 'system',
				},
			});

			res.json({ message: 'User deleted successfully' });
		} catch (error) {
			console.error('Error in UserController.delete', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	}
}
