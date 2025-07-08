import { Request, Response } from 'express';
import { prisma } from '../index';
import {
	CreateClientDtoType,
	UpdateClientDtoType,
	ClientIdDtoType,
} from '../../../shared/dtos/client.dto';

export class ClientController {
	static async getAll(req: Request, res: Response) {
		try {
			const clients = await prisma.client.findMany({
				where: { deletedAt: null },
				orderBy: { createdAt: 'desc' },
			});

			res.json(clients);
		} catch (error) {
			console.error('Error in ClientController.getAll', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	}

	static async getById(req: Request, res: Response) {
		try {
			const { id } = req.params as ClientIdDtoType['params'];

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
	}

	static async create(req: Request, res: Response) {
		try {
			const { name, phone, address } = req.body
				.body as CreateClientDtoType['body'];

			// Check if client with same phone already exists
			const existingClient = await prisma.client.findFirst({
				where: {
					phone,
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
					name,
					phone,
					address,
					ref: `CLI-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
					createdBy: req.user?.userId || 'system',
				},
			});

			res.status(201).json(client);
		} catch (error) {
			console.error('Error in ClientController.create', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	}

	static async update(req: Request, res: Response) {
		try {
			const { id } = req.params as ClientIdDtoType['params'];
			const body = req.body.body;

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
					updatedBy: req.user?.userId || 'system',
				},
			});

			res.json(client);
		} catch (error) {
			console.error('Error in ClientController.update', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	}

	static async delete(req: Request, res: Response) {
		try {
			const { id } = req.params as ClientIdDtoType['params'];

			// Check if client exists
			const existingClient = await prisma.client.findUnique({
				where: { id },
			});

			if (!existingClient) {
				return res.status(404).json({ message: 'Client not found' });
			}

			// Check if client has orders
			const hasOrders = await prisma.order.findFirst({
				where: { clientId: id },
			});

			if (hasOrders) {
				return res.status(400).json({
					message: 'Cannot delete client with existing orders',
				});
			}

			// Soft delete
			await prisma.client.update({
				where: { id },
				data: {
					deletedAt: new Date(),
					deletedBy: req.user?.userId || 'system',
				},
			});

			res.json({ message: 'Client deleted successfully' });
		} catch (error) {
			console.error('Error in ClientController.delete', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	}
}
