import { Request, Response } from 'express';
import { prisma } from '../index';
import { CreateUserDtoType } from '../../../shared/dtos/user.dto';
import bcrypt from 'bcryptjs';

export class UserController {
	static async getAll(req: Request, res: Response) {
		try {
			const users = await prisma.user.findMany({
				where: { deletedAt: null },
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
	}

	static async create(req: Request, res: Response) {
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

			// Hash password
			const saltRounds = 12;
			const hashedPassword = await bcrypt.hash(body.password, saltRounds);

			// Create user
			const user = await prisma.user.create({
				data: {
					name: body.name,
					password: hashedPassword,

					role: body.role,
					ref: `USER-${Date.now()}`,
					createdBy: {
						connect: {
							id: userId,
						},
					},
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
			const { id } = req.params;
			const body = req.body as CreateUserDtoType;

			// Check if user exists
			const isExist = await prisma.user.findUnique({
				where: { id },
			});

			if (!isExist) {
				return res.status(404).json({ message: 'User not found' });
			}

			const user = await prisma.user.update({
				where: { id },
				data: {
					...body,
					updatedAt: new Date(),
					updatedById: req.user?.userId,
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
			const { id } = req.params;

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
					deletedById: req.user?.userId,
				},
			});

			res.json({ message: 'User deleted successfully' });
		} catch (error) {
			console.error('Error in UserController.delete', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	}
}
