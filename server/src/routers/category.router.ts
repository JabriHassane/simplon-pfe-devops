import { Router } from 'express';
import { authenticate, requireAgent } from '../middlewares/auth.middleware';
import { CategoryController } from '../controllers/category.controller';
import { validate } from '../middlewares/validation.middleware';
import {
	CreateCategoryDto,
	UpdateCategoryDto,
} from '../../../shared/dtos/category.dto';

const router = Router();

// All routes require authentication and agent role
router.use(authenticate);
router.use(requireAgent);

// CRUD operations
router.get('/', CategoryController.getPage);
router.get('/:id', CategoryController.getById);
router.post('/', validate(CreateCategoryDto), CategoryController.create);
router.put('/:id', validate(UpdateCategoryDto), CategoryController.update);
router.delete('/:id', CategoryController.delete);

export default router;
