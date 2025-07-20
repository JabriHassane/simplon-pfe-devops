import { Router } from 'express';
import { authenticate, requireAgent } from '../middlewares/auth.middleware';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validation.middleware';
import { LoginDto } from '../../../shared/dtos/auth.dto';

const router = Router();

// Public routes (no authentication required)
router.post('/login', validate(LoginDto), AuthController.login);
router.post('/refresh', AuthController.refresh);

// Protected routes (require authentication and agent role)
router.use(authenticate);
router.use(requireAgent);

router.get('/me', AuthController.getConnectedUser);
router.post('/logout', AuthController.logout);

export default router;
