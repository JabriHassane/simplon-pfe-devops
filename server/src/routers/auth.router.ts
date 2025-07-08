import { Router } from 'express';
import { authenticate, requireAgent } from '../middlewares/auth.middleware';
import {
	login,
	register,
	getProfile,
	updateProfile,
} from '../controllers/auth.controller';
import { validate } from '../middlewares/validation.middleware';
import {
	LoginDto,
	RegisterDto,
	UpdateProfileDto,
} from '../../../shared/dtos/auth.dto';

const router = Router();

// Public routes (no authentication required)
router.post('/login', validate(LoginDto), login);
router.post('/register', validate(RegisterDto), register);

// Protected routes (require authentication and agent role)
router.use(authenticate);
router.use(requireAgent);

router.get('/profile', getProfile);
router.put('/profile', validate(UpdateProfileDto), updateProfile);

export default router;
