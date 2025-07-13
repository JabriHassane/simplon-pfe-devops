import { Router } from 'express';
import { authenticate, requireAgent } from '../middlewares/auth.middleware';
import {
	login,
	getConnectedUser,
	logout,
	refresh,
} from '../controllers/auth.controller';
import { validate } from '../middlewares/validation.middleware';
import { LoginDto } from '../../../shared/dtos/auth.dto';

const router = Router();

// Public routes (no authentication required)
router.post('/login', validate(LoginDto), login);
router.post('/refresh', refresh);

// Protected routes (require authentication and agent role)
router.use(authenticate);
router.use(requireAgent);

router.get('/me', getConnectedUser);
router.post('/logout', logout);

export default router;
