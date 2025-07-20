import { Router } from 'express';
import { authenticate, requireAgent } from '../middlewares/auth.middleware';
import { SaleController } from '../controllers/sale.controller';
import { validate } from '../middlewares/validation.middleware';
import { CreateSaleDto, UpdateSaleDto } from '../../../shared/dtos/sale.dto';

const router = Router();

// All routes require authentication and agent role
router.use(authenticate);
router.use(requireAgent);

// CRUD operations
router.get('/', SaleController.getPage);
router.get('/:id', SaleController.getById);
router.get('/:id/transactions', SaleController.getTransactions);
router.post('/', validate(CreateSaleDto), SaleController.create);
router.put('/:id', validate(UpdateSaleDto), SaleController.update);
router.delete('/:id', SaleController.delete);

export default router;
