import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt';

// Extend Express Request interface to include user
declare global {
	namespace Express {
		interface Request {
			user?: JWTPayload;
		}
	}
}

export const authenticate = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const token = req.cookies.accessToken;
		if (!token) {
			return res.status(401).json({ message: 'Access token required' });
		}

		const payload = verifyToken(token);

		req.user = payload;
		next();
	} catch (error) {
		console.error(error);
		return res.status(401).json({ message: 'Invalid token' });
	}
};

export const requireRole = (roles: string[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) {
			return res.status(401).json({ message: 'Authentication required' });
		}

		if (!roles.includes(req.user.role)) {
			return res.status(403).json({ message: 'Insufficient permissions' });
		}

		next();
	};
};

export const requireSuperAdmin = requireRole(['super_admin']);
export const requireAdmin = requireRole(['super_admin', 'admin']);
export const requireAgent = requireRole(['super_admin', 'admin', 'agent']);
