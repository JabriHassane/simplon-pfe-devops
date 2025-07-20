import { Router } from 'express';
import { authenticate, requireAgent } from '../middlewares/auth.middleware';
import { SupplierController } from '../controllers/supplier.controller';
import { validate } from '../middlewares/validation.middleware';
import {
	CreateSupplierDto,
	UpdateSupplierDto,
} from '../../../shared/dtos/supplier.dto';

const router = Router();

// All routes require authentication and agent role
router.use(authenticate);
router.use(requireAgent);

// CRUD operations
router.get('/', SupplierController.getPage);
router.get('/:id', SupplierController.getById);
router.post('/', validate(CreateSupplierDto), SupplierController.create);
router.put('/:id', validate(UpdateSupplierDto), SupplierController.update);
router.delete('/:id', SupplierController.delete);

export default router;
