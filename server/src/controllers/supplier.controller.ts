import { Request, Response } from 'express';
import { prisma } from '../index';
import { getPaginationCondition } from '../utils/pagination';
import { getNextRef } from '../utils/db.utils';
import {
	CreateSupplierDtoType,
	UpdateSupplierDtoType,
} from '../../../shared/dtos/supplier.dto';

export const SupplierController = {
	async getPage(req: Request, res: Response) {
		try {
			const { page, limit, skip, whereClause } = getPaginationCondition(req, [
				'name',
				'ref',
				'phone',
			]);

			// Get total count for pagination
			const total = await prisma.supplier.count({ where: whereClause });

			// Get paginated results
			const suppliers = await prisma.supplier.findMany({
				where: whereClause,
				orderBy: { createdAt: 'desc' },
				skip,
				take: limit,
			});

			res.json({
				data: suppliers,
				pagination: {
					page,
					limit,
					total,
					totalPages: Math.ceil(total / limit),
				},
			});
		} catch (error) {
			console.error('Error in SupplierController.getPage', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async getById(req: Request, res: Response) {
		try {
			const { id } = req.params;

			const supplier = await prisma.supplier.findUnique({
				where: { id },
			});

			if (!supplier) {
				return res.status(404).json({ message: 'Supplier not found' });
			}

			res.json(supplier);
		} catch (error) {
			console.error('Error in SupplierController.getById', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async create(req: Request, res: Response) {
		try {
			const { userId } = req.user!;
			const body = req.body as CreateSupplierDtoType;

			const supplier = await prisma.supplier.create({
				data: {
					name: body.name,
					phone: body.phone,
					address: body.address,
					ref: await getNextRef('suppliers'),
					createdById: userId,
				},
			});

			res.status(201).json(supplier);
		} catch (error) {
			console.error('Error in SupplierController.create', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async update(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const { userId } = req.user!;
			const body = req.body as UpdateSupplierDtoType;

			// Check if supplier exists
			const existingSupplier = await prisma.supplier.findUnique({
				where: { id },
			});

			if (!existingSupplier) {
				return res.status(404).json({ message: 'Supplier not found' });
			}

			const supplier = await prisma.supplier.update({
				where: { id },
				data: {
					name: body.name,
					phone: body.phone,
					address: body.address,
					updatedAt: new Date(),
					updatedById: userId,
				},
			});

			res.json(supplier);
		} catch (error) {
			console.error('Error in SupplierController.update', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},

	async delete(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const { userId } = req.user!;

			// Check if supplier exists
			const existingSupplier = await prisma.supplier.findUnique({
				where: { id },
			});

			if (!existingSupplier) {
				return res.status(404).json({ message: 'Supplier not found' });
			}

			// Check if supplier has purchases
			const hasPurchases = await prisma.purchase.findFirst({
				where: { supplierId: id },
			});

			if (hasPurchases) {
				return res.status(400).json({
					message: 'Cannot delete supplier with existing purchases',
				});
			}

			// Soft delete
			await prisma.supplier.update({
				where: { id },
				data: {
					deletedAt: new Date(),
					deletedById: userId,
				},
			});

			res.json({ message: 'Supplier deleted successfully' });
		} catch (error) {
			console.error('Error in SupplierController.delete', error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},
};
