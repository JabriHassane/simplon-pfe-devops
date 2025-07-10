import { Router } from 'express';
import { authenticate, requireAgent } from '../middlewares/auth.middleware';
import {
	getAllTransactions,
	getTransactionById,
	createTransaction,
	updateTransaction,
	deleteTransaction,
} from '../controllers/transaction.controller';
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
router.get('/', getAllTransactions);
router.get('/:id', getTransactionById);
router.post('/', validate(CreateTransactionDto), createTransaction);
router.put('/:id', validate(UpdateTransactionDto), updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
