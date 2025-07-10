import { Router } from 'express';
import { authenticate, requireAgent } from '../middlewares/auth.middleware';
import {
	getAllProductCategories,
	getProductCategoryById,
	createProductCategory,
	updateProductCategory,
	deleteProductCategory,
} from '../controllers/product-category.controller';
import { validate } from '../middlewares/validation.middleware';
import { CreateProductCategoryDto, UpdateProductCategoryDto } from '../../../shared/dtos/product-category.dto';

const router = Router();

// All routes require authentication and agent role
router.use(authenticate);
router.use(requireAgent);

// CRUD operations
router.get('/', getAllProductCategories);
router.get('/:id', getProductCategoryById);
router.post('/', validate(CreateProductCategoryDto), createProductCategory);
router.put('/:id', validate(UpdateProductCategoryDto), updateProductCategory);
router.delete('/:id', deleteProductCategory);

export default router;
