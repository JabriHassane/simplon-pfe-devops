import { Router } from 'express';
import { authenticate, requireAgent } from '../middlewares/auth.middleware';
import { ArticleController } from '../controllers/article.controller';
import { validate } from '../middlewares/validation.middleware';
import {
	CreateArticleDto,
	UpdateArticleDto,
} from '../../../shared/dtos/article.dto';

const router = Router();

// All routes require authentication and agent role
router.use(authenticate);
router.use(requireAgent);

// CRUD operations
router.get('/', ArticleController.getPage);
router.get('/:id', ArticleController.getById);
router.post('/', validate(CreateArticleDto), ArticleController.create);
router.put('/:id', validate(UpdateArticleDto), ArticleController.update);
router.delete('/:id', ArticleController.delete);

export default router;
