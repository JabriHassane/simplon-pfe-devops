import { Router } from 'express';
import { authenticate, requireAgent } from '../middlewares/auth.middleware';
import { OrderController } from '../controllers/order.controller';
import { validate } from '../middlewares/validation.middleware';
import { CreateOrderDto, UpdateOrderDto } from '../../../shared/dtos/order.dto';

const router = Router();

// All routes require authentication and agent role
router.use(authenticate);
router.use(requireAgent);

// CRUD operations
router.get('/', OrderController.getAll);
router.get('/:id', OrderController.getById);
router.post('/', validate(CreateOrderDto), OrderController.create);
router.put('/:id', validate(UpdateOrderDto), OrderController.update);
router.delete('/:id', OrderController.delete);

export default router;
