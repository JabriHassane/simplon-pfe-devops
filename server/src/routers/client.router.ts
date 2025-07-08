import { Router } from 'express';
import { authenticate, requireAgent } from '../middlewares/auth.middleware';
import { ClientController } from '../controllers/client.controller';
import { validate } from '../middlewares/validation.middleware';
import {
	CreateClientDto,
	UpdateClientDto,
	ClientIdDto,
} from '../../../shared/dtos/client.dto';

const router = Router();

// All routes require authentication and agent role
router.use(authenticate);
router.use(requireAgent);

// CRUD operations
router.get('/', ClientController.getAll);
router.get('/:id', validate(ClientIdDto), ClientController.getById);
router.post('/', validate(CreateClientDto), ClientController.create);
router.put('/:id', validate(UpdateClientDto), ClientController.update);
router.delete('/:id', validate(ClientIdDto), ClientController.delete);

export default router;
