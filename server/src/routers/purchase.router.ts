import { Router } from 'express';
import { authenticate, requireAgent } from '../middlewares/auth.middleware';
import {
	getAllPurchases,
	getPurchaseById,
	createPurchase,
	updatePurchase,
	deletePurchase,
} from '../controllers/purchase.controller';
import { validate } from '../middlewares/validation.middleware';
import {
	CreatePurchaseDto,
	UpdatePurchaseDto,
	PurchaseIdDto,
} from '../../../shared/dtos/purchase.dto';

const router = Router();

// All routes require authentication and agent role
router.use(authenticate);
router.use(requireAgent);

// CRUD operations
router.get('/', getAllPurchases);
router.get('/:id', validate(PurchaseIdDto), getPurchaseById);
router.post('/', validate(CreatePurchaseDto), createPurchase);
router.put('/:id', validate(UpdatePurchaseDto), updatePurchase);
router.delete('/:id', validate(PurchaseIdDto), deletePurchase);

export default router;
