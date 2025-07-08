import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { verifyToken, extractTokenFromHeader, JWTPayload } from '../utils/jwt';

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
		const authHeader = req.headers.authorization;
		if (!authHeader) {
			return res.status(401).json({ message: 'Authorization header required' });
		}

		const token = extractTokenFromHeader(authHeader);
		const payload = verifyToken(token);

		// Verify user still exists in database
		const user = await prisma.user.findUnique({
			where: { id: payload.userId },
			select: {
				id: true,
				username: true,
				email: true,
				role: true,
				deletedAt: true,
			},
		});

		if (!user || user.deletedAt) {
			return res.status(401).json({ message: 'User not found or deleted' });
		}

		req.user = payload;
		next();
	} catch (error) {
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

export const requireSuperAdmin = requireRole(['SUPER_ADMIN']);
export const requireAdmin = requireRole(['SUPER_ADMIN', 'ADMIN']);
export const requireAgent = requireRole(['SUPER_ADMIN', 'ADMIN', 'AGENT']);
