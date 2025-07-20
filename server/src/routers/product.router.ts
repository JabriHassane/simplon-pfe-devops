import { Router } from 'express';
import { authenticate, requireAgent } from '../middlewares/auth.middleware';
import { ProductController } from '../controllers/product.controller';
import { validate } from '../middlewares/validation.middleware';
import {
	CreateProductDto,
	UpdateProductDto,
} from '../../../shared/dtos/product.dto';

const router = Router();

// All routes require authentication and agent role
router.use(authenticate);
router.use(requireAgent);

// CRUD operations
router.get('/', ProductController.getPage);
router.get('/:id', ProductController.getById);
router.post('/', validate(CreateProductDto), ProductController.create);
router.put('/:id', validate(UpdateProductDto), ProductController.update);
router.delete('/:id', ProductController.delete);

export default router;
