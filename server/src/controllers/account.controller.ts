import { Request, Response } from 'express';
import { prisma } from '../index';
import {
	CreateAccountDtoType,
	UpdateAccountDtoType,
} from '../../../shared/dtos/account.dto';
import { getPaginationCondition } from '../utils/pagination';

export const AccountController = {
	async getPage(req: Request, res: Response) {
		try {
			const { page, limit, skip, whereClause } = getPaginationCondition(req, [
				'name',
				'ref',
			]);

			// Get total count for pagination
			const total = await prisma.account.count({ where: whereClause });

			// Get paginated results
			const accounts = await prisma.account.findMany({
				where: whereClause,
				orderBy: { createdAt: 'desc' },
				skip,
				take: limit,
			});

			res.json({
				data: accounts,
				pagination: {
					page,
					limit,
					total,
					totalPages: Math.ceil(total / limit),
				},
			});
		} catch (error) {
			console.error('Error in AccountController.getPage', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async getById(req: Request, res: Response) {
		try {
			const { id } = req.params;

			const account = await prisma.account.findUnique({
				where: { id },
			});

			if (!account) {
				return res.status(404).json({ message: 'Account not found' });
			}

			res.json(account);
		} catch (error) {
			console.error('Error in AccountController.getById', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async create(req: Request, res: Response) {
		try {
			const body = req.body as CreateAccountDtoType;
			const { userId } = req.user!;
			// Check if account with same name already exists
			const existingAccount = await prisma.account.findFirst({
				where: {
					name: body.name,
					deletedAt: null,
				},
			});

			if (existingAccount) {
				return res
					.status(400)
					.json({ message: 'Account with this name already exists' });
			}

			const account = await prisma.account.create({
				data: {
					...body,
					balance: 0,
					ref: `COM-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
					createdById: userId,
				},
			});

			res.status(201).json(account);
		} catch (error) {
			console.error('Error in AccountController.create', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async update(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const body = req.body as UpdateAccountDtoType;
			const { userId } = req.user!;

			// Check if account exists
			const existingAccount = await prisma.account.findUnique({
				where: { id },
			});

			if (!existingAccount) {
				return res.status(404).json({ message: 'Account not found' });
			}

			// Check if name already exists (if name is being updated)
			if (body.name && body.name !== existingAccount.name) {
				const duplicateAccount = await prisma.account.findFirst({
					where: {
						name: body.name,
						deletedAt: null,
						NOT: { id },
					},
				});

				if (duplicateAccount) {
					return res
						.status(400)
						.json({ message: 'Account with this name already exists' });
				}
			}

			const account = await prisma.account.update({
				where: { id },
				data: {
					...body,
					updatedAt: new Date(),
					updatedById: userId,
				},
			});

			res.json(account);
		} catch (error) {
			console.error('Error in AccountController.update', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async delete(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const { userId } = req.user!;

			// Check if account exists
			const existingAccount = await prisma.account.findUnique({
				where: { id },
			});

			if (!existingAccount) {
				return res.status(404).json({ message: 'Account not found' });
			}

			// Check if account has transactions
			const hasTransactions = await prisma.transaction.findFirst({
				where: {
					OR: [{ fromId: id }, { toId: id }],
				},
			});

			if (hasTransactions) {
				return res.status(400).json({
					message: 'Cannot delete account with existing transactions',
				});
			}

			// Soft delete
			await prisma.account.update({
				where: { id },
				data: {
					deletedAt: new Date(),
					deletedById: userId,
				},
			});

			res.json({ message: 'Account deleted successfully' });
		} catch (error) {
			console.error('Error in AccountController.delete', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async getBalance(req: Request, res: Response) {
		try {
			const { id } = req.params;

			const account = await prisma.account.findUnique({
				where: { id },
			});

			if (!account) {
				return res.status(404).json({ message: 'Account not found' });
			}

			res.json(account);
		} catch (error) {
			console.error('Error in AccountController.getBalance', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},
};
