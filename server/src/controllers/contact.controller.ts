import { Request, Response } from 'express';
import { prisma } from '../index';
import {
	CreateContactDtoType,
	UpdateContactDtoType,
} from '../../../shared/dtos/contact.dto';
import { getPaginationCondition } from '../utils/pagination';
import { getNextRef } from '../utils/db.utils';

export const ContactController = {
	async getPage(req: Request, res: Response) {
		try {
			const { page, pageSize, skip, whereClause } = getPaginationCondition(
				req,
				['name', 'ref', 'phone']
			);

			// Add type filter if provided
			const type = req.query.type as string;
			const finalWhereClause = {
				...whereClause,
				...(type && { type }),
			};

			// Get total count for pagination
			const total = await prisma.contact.count({ where: finalWhereClause });

			// Get paginated results
			const contacts = await prisma.contact.findMany({
				where: finalWhereClause,
				orderBy: { createdAt: 'desc' },
				skip,
				take: pageSize,
			});

			res.json({
				data: contacts,
				pagination: {
					page,
					pageSize,
					total,
					totalPages: Math.ceil(total / pageSize),
				},
			});
		} catch (error) {
			console.error('Error in ContactController.getPage', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async getById(req: Request, res: Response) {
		try {
			const { id } = req.params;

			const contact = await prisma.contact.findUnique({
				where: { id },
			});

			if (!contact) {
				return res.status(404).json({ message: 'Contact not found' });
			}

			res.json(contact);
		} catch (error) {
			console.error('Error in ContactController.getById', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async create(req: Request, res: Response) {
		try {
			const { userId } = req.user!;
			const body = req.body as CreateContactDtoType;

			const contact = await prisma.contact.create({
				data: {
					name: body.name,
					phone: body.phone,
					address: body.address,
					type: body.type,
					ref: await getNextRef(
						body.type === 'client' ? 'clients' : 'suppliers'
					),
					createdById: userId,
				},
			});

			res.status(201).json(contact);
		} catch (error) {
			console.error('Error in ContactController.create', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async update(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const { userId } = req.user!;
			const body = req.body as UpdateContactDtoType;

			// Check if contact exists
			const existingContact = await prisma.contact.findUnique({
				where: { id },
			});

			if (!existingContact) {
				return res.status(404).json({ message: 'Contact not found' });
			}

			const contact = await prisma.contact.update({
				where: { id },
				data: {
					name: body.name,
					phone: body.phone,
					address: body.address,
					type: body.type,
					updatedAt: new Date(),
					updatedById: userId,
				},
			});

			res.json(contact);
		} catch (error) {
			console.error('Error in ContactController.update', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async delete(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const { userId } = req.user!;

			// Check if contact exists
			const existingContact = await prisma.contact.findUnique({
				where: { id },
			});

			if (!existingContact) {
				return res.status(404).json({ message: 'Contact not found' });
			}

			// Check if contact has sales or purchases
			const hasSales = await prisma.sale.findFirst({
				where: { contactId: id },
			});

			const hasPurchases = await prisma.purchase.findFirst({
				where: { contactId: id },
			});

			if (hasSales || hasPurchases) {
				return res.status(400).json({
					message: 'Cannot delete contact with existing sales or purchases',
				});
			}

			// Soft delete
			await prisma.contact.update({
				where: { id },
				data: {
					deletedAt: new Date(),
					deletedById: userId,
				},
			});

			res.json({ message: 'Contact deleted successfully' });
		} catch (error) {
			console.error('Error in ContactController.delete', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},
};
