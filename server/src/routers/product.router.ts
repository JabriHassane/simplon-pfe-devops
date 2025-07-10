import { Router } from 'express';
import { authenticate, requireAgent } from '../middlewares/auth.middleware';
import {
	getAllProducts,
	getProductById,
	createProduct,
	updateProduct,
	deleteProduct,
} from '../controllers/product.controller';
import { validate } from '../middlewares/validation.middleware';
import { CreateProductDto, UpdateProductDto } from '../../../shared/dtos/product.dto';

const router = Router();

// All routes require authentication and agent role
router.use(authenticate);
router.use(requireAgent);

// CRUD operations
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', validate(CreateProductDto), createProduct);
router.put('/:id', validate(UpdateProductDto), updateProduct);
router.delete('/:id', deleteProduct);

export default router;
