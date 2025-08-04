import { Router } from 'express';
import { authenticate, requireAgent } from '../middlewares/auth.middleware';
import { ContactController } from '../controllers/contact.controller';
import { validate } from '../middlewares/validation.middleware';
import {
	CreateContactDto,
	UpdateContactDto,
} from '../../../shared/dtos/contact.dto';

const router = Router();

// All routes require authentication and agent role
router.use(authenticate);
router.use(requireAgent);

// CRUD operations
router.get('/', ContactController.getPage);
router.get('/:id', ContactController.getById);
router.post('/', validate(CreateContactDto), ContactController.create);
router.put('/:id', validate(UpdateContactDto), ContactController.update);
router.delete('/:id', ContactController.delete);

export default router;
