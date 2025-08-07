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
router.get('/balances', TransactionController.getBalances);
router.get('/:id', TransactionController.getById);
router.post('/', validate(CreateTransactionDto), TransactionController.create);
router.put(
	'/:id',
	validate(UpdateTransactionDto),
	TransactionController.update
);
router.delete('/:id', TransactionController.delete);

// Payment management operations
router.post('/:id/cash', TransactionController.cashPayment);
router.post('/:id/undo-cashing', TransactionController.undoPaymentCashing);
router.post('/:id/deposit', TransactionController.depositPaymentToBank);
router.post('/:id/undo-deposit', TransactionController.undoPaymentDeposit);

export default router;
