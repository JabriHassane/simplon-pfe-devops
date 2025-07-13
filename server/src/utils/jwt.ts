import jwt from 'jsonwebtoken';
import { Role, User } from '@prisma/client';
import ms from 'ms';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '15m') as ms.StringValue;
const REFRESH_TOKEN_EXPIRES_IN = (process.env.REFRESH_TOKEN_EXPIRES_IN || '7D') as ms.StringValue;

export interface JWTPayload {
	userId: string;
	name: string;
	role: Role;
}

export const generateToken = (user: User): string => {
	const payload: JWTPayload = {
		userId: user.id,
		name: user.name,
		role: user.role,
	};

	return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const generateRefreshToken = (): string => {
	return crypto.randomBytes(40).toString('hex');
};

export const verifyToken = (token: string): JWTPayload => {
	try {
		return jwt.verify(token, JWT_SECRET) as JWTPayload;
	} catch (error) {
		throw new Error('Invalid token');
	}
};
