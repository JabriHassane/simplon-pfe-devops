import { Request, Response } from 'express';
import { prisma } from '../index';
import {
	CreateClientDtoType,
	UpdateClientDtoType,
} from '../../../shared/dtos/client.dto';
import { getPaginationCondition } from '../utils/pagination';

export const ClientController = {
	async getPage(req: Request, res: Response) {
		try {
			const { page, limit, skip, whereClause } = getPaginationCondition(req, [
				'name',
				'ref',
				'phone',
			]);

			// Get total count for pagination
			const total = await prisma.client.count({ where: whereClause });

			// Get paginated results
			const clients = await prisma.client.findMany({
				where: whereClause,
				orderBy: { createdAt: 'desc' },
				skip,
				take: limit,
			});

			res.json({
				data: clients,
				pagination: {
					page,
					limit,
					total,
					totalPages: Math.ceil(total / limit),
				},
			});
		} catch (error) {
			console.error('Error in ClientController.getPage', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async getById(req: Request, res: Response) {
		try {
			const { id } = req.params;

			const client = await prisma.client.findUnique({
				where: { id },
			});

			if (!client) {
				return res.status(404).json({ message: 'Client not found' });
			}

			res.json(client);
		} catch (error) {
			console.error('Error in ClientController.getById', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async create(req: Request, res: Response) {
		try {
			const { userId } = req.user!;
			const body = req.body as CreateClientDtoType;

			// Check if client with same phone already exists
			const existingClient = await prisma.client.findFirst({
				where: {
					phone: body.phone,
					deletedAt: null,
				},
			});

			if (existingClient) {
				return res
					.status(400)
					.json({ message: 'Client with this phone number already exists' });
			}

			const client = await prisma.client.create({
				data: {
					name: body.name,
					phone: body.phone,
					address: body.address,
					ref: `CLI-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
					createdById: userId,
				},
			});

			res.status(201).json(client);
		} catch (error) {
			console.error('Error in ClientController.create', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async update(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const { userId } = req.user!;
			const body = req.body as UpdateClientDtoType;

			// Check if client exists
			const existingClient = await prisma.client.findUnique({
				where: { id },
			});

			if (!existingClient) {
				return res.status(404).json({ message: 'Client not found' });
			}

			// Check if phone already exists (if phone is being updated)
			if (body?.phone && body.phone !== existingClient.phone) {
				const duplicateClient = await prisma.client.findFirst({
					where: {
						phone: body.phone,
						deletedAt: null,
						NOT: { id },
					},
				});

				if (duplicateClient) {
					return res
						.status(400)
						.json({ message: 'Client with this phone number already exists' });
				}
			}

			const client = await prisma.client.update({
				where: { id },
				data: {
					...(body?.name && { name: body.name }),
					...(body?.phone && { phone: body.phone }),
					...(body?.address && { address: body.address }),
					updatedAt: new Date(),
					updatedById: userId,
				},
			});

			res.json(client);
		} catch (error) {
			console.error('Error in ClientController.update', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async delete(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const { userId } = req.user!;

			// Check if client exists
			const existingClient = await prisma.client.findUnique({
				where: { id },
			});

			if (!existingClient) {
				return res.status(404).json({ message: 'Client not found' });
			}

			// Check if client has sales
			const hasSales = await prisma.sale.findFirst({
				where: { clientId: id },
			});

			if (hasSales) {
				return res.status(400).json({
					message: 'Cannot delete client with existing sales',
				});
			}

			// Soft delete
			await prisma.client.update({
				where: { id },
				data: {
					deletedAt: new Date(),
					deletedById: userId,
				},
			});

			res.json({ message: 'Client deleted successfully' });
		} catch (error) {
			console.error('Error in ClientController.delete', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},
};
