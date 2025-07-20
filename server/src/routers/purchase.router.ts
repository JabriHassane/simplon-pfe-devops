import { Router } from 'express';
import { authenticate, requireAgent } from '../middlewares/auth.middleware';
import { PurchaseController } from '../controllers/purchase.controller';
import { validate } from '../middlewares/validation.middleware';
import {
	CreatePurchaseDto,
	UpdatePurchaseDto,
} from '../../../shared/dtos/purchase.dto';

const router = Router();

// All routes require authentication and agent role
router.use(authenticate);
router.use(requireAgent);

// CRUD operations
router.get('/', PurchaseController.getPage);
router.get('/:id', PurchaseController.getById);
router.get('/:id/transactions', PurchaseController.getTransactions);
router.post('/', validate(CreatePurchaseDto), PurchaseController.create);
router.put('/:id', validate(UpdatePurchaseDto), PurchaseController.update);
router.delete('/:id', PurchaseController.delete);

export default router;
