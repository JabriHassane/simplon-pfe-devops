import { Router } from 'express';
import { authenticate, requireAgent } from '../middlewares/auth.middleware';
import { ProductCategoryController } from '../controllers/product-category.controller';
import { validate } from '../middlewares/validation.middleware';
import {
	CreateProductCategoryDto,
	UpdateProductCategoryDto,
} from '../../../shared/dtos/product-category.dto';

const router = Router();

// All routes require authentication and agent role
router.use(authenticate);
router.use(requireAgent);

// CRUD operations
router.get('/', ProductCategoryController.getPage);
router.get('/:id', ProductCategoryController.getById);
router.post(
	'/',
	validate(CreateProductCategoryDto),
	ProductCategoryController.create
);
router.put(
	'/:id',
	validate(UpdateProductCategoryDto),
	ProductCategoryController.update
);
router.delete('/:id', ProductCategoryController.delete);

export default router;
