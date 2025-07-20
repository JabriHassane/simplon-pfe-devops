import { Router } from 'express';
import { authenticate, requireAgent } from '../middlewares/auth.middleware';
import { TransactionController } from '../controllers/transaction.controller';
import { validate } from '../middlewares/validation.middleware';
import {
	CreateTransactionDto,
	UpdateTransactionDto,
} from '../../../shared/dtos/transaction.dto';

const router = Router();

// All routes require authentication and agent role
router.use(authenticate);
router.use(requireAgent);

// CRUD operations
router.get('/', TransactionController.getPage);
router.get('/:id', TransactionController.getById);
router.post('/', validate(CreateTransactionDto), TransactionController.create);
router.put(
	'/:id',
	validate(UpdateTransactionDto),
	TransactionController.update
);
router.delete('/:id', TransactionController.delete);

export default router;
