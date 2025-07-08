import { Router } from 'express';
import { authenticate, requireAgent } from '../middlewares/auth.middleware';
import { AccountController } from '../controllers/account.controller';
import { validate } from '../middlewares/validation.middleware';
import {
	CreateAccountDto,
	UpdateAccountDto,
	AccountIdDto,
} from '../../../shared/dtos/account.dto';

const router = Router();

// All routes require authentication and agent role
router.use(authenticate);
router.use(requireAgent);

// CRUD operations
router.get('/', AccountController.getAll);
router.get('/:id', validate(AccountIdDto), AccountController.getById);
router.post('/', validate(CreateAccountDto), AccountController.create);
router.put('/:id', validate(UpdateAccountDto), AccountController.update);
router.delete('/:id', validate(AccountIdDto), AccountController.delete);

export default router;
