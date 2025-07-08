import { Router } from 'express';
import { authenticate, requireAgent } from '../middlewares/auth.middleware';
import {
	getAllSuppliers,
	getSupplierById,
	createSupplier,
	updateSupplier,
	deleteSupplier,
} from '../controllers/supplier.controller';
import { validate } from '../middlewares/validation.middleware';
import {
	CreateSupplierDto,
	UpdateSupplierDto,
	SupplierIdDto,
} from '../../../shared/dtos/supplier.dto';

const router = Router();

// All routes require authentication and agent role
router.use(authenticate);
router.use(requireAgent);

// CRUD operations
router.get('/', getAllSuppliers);
router.get('/:id', validate(SupplierIdDto), getSupplierById);
router.post('/', validate(CreateSupplierDto), createSupplier);
router.put('/:id', validate(UpdateSupplierDto), updateSupplier);
router.delete('/:id', validate(SupplierIdDto), deleteSupplier);

export default router;
