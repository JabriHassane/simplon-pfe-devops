import { Router } from 'express';
import { authenticate, requireAgent } from '../middlewares/auth.middleware';
import { UserController } from '../controllers/user.controller';
import { validate } from '../middlewares/validation.middleware';
import { CreateUserDto, UpdateUserDto } from '../../../shared/dtos/user.dto';

const router = Router();

// All routes require authentication and agent role
router.use(authenticate);
router.use(requireAgent);

// CRUD operations
router.get('/', UserController.getPage);
router.get('/:id', UserController.getById);
router.post('/', validate(CreateUserDto), UserController.create);
router.put('/:id', validate(UpdateUserDto), UserController.update);
router.delete('/:id', UserController.delete);

export default router;
