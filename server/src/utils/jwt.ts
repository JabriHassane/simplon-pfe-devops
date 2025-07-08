import jwt from 'jsonwebtoken';
import { Role, User } from '@prisma/client';
import ms from 'ms';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7D') as ms.StringValue;

export interface JWTPayload {
	userId: string;
	username: string;
	email: string;
	role: Role;
}

export const generateToken = (user: User): string => {
	const payload: JWTPayload = {
		userId: user.id,
		username: user.username,
		email: user.email,
		role: user.role,
	};

	return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): JWTPayload => {
	try {
		return jwt.verify(token, JWT_SECRET) as JWTPayload;
	} catch (error) {
		throw new Error('Invalid token');
	}
};

export const extractTokenFromHeader = (authHeader: string): string => {
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		throw new Error('Invalid authorization header');
	}
	return authHeader.substring(7);
};
