import { Request, Response } from 'express';
import { prisma } from '../index';
import { getPaginationCondition } from '../utils/pagination';

export const getPageSuppliers = async (req: Request, res: Response) => {
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
		console.error('Get page suppliers error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const getSupplierById = async (req: Request, res: Response) => {
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
		console.error('Get supplier by ID error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const createSupplier = async (req: Request, res: Response) => {
	try {
		const { name, phone, address } = req.body;

		// Check if supplier with same phone already exists
		const existingSupplier = await prisma.supplier.findFirst({
			where: {
				phone,
				deletedAt: null,
			},
		});

		if (existingSupplier) {
			return res
				.status(400)
				.json({ message: 'Supplier with this phone number already exists' });
		}

		const supplier = await prisma.supplier.create({
			data: {
				name,
				phone,
				address,
				ref: `SUP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
				createdBy: req.user?.userId,
			},
		});

		res.status(201).json(supplier);
	} catch (error) {
		console.error('Create supplier error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const updateSupplier = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { name, phone, address } = req.body;

		// Check if supplier exists
		const existingSupplier = await prisma.supplier.findUnique({
			where: { id },
		});

		if (!existingSupplier) {
			return res.status(404).json({ message: 'Supplier not found' });
		}

		// Check if phone already exists (if phone is being updated)
		if (phone && phone !== existingSupplier.phone) {
			const duplicateSupplier = await prisma.supplier.findFirst({
				where: {
					phone,
					deletedAt: null,
					NOT: { id },
				},
			});

			if (duplicateSupplier) {
				return res
					.status(400)
					.json({ message: 'Supplier with this phone number already exists' });
			}
		}

		const supplier = await prisma.supplier.update({
			where: { id },
			data: {
				...(name && { name }),
				...(phone && { phone }),
				...(address && { address }),
				updatedAt: new Date(),
				updatedBy: req.user?.userId,
			},
		});

		res.json(supplier);
	} catch (error) {
		console.error('Update supplier error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const deleteSupplier = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

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
				deletedBy: req.user?.userId,
			},
		});

		res.json({ message: 'Supplier deleted successfully' });
	} catch (error) {
		console.error('Delete supplier error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};
