import jwt from 'jsonwebtoken';
import { Role, User } from '@prisma/client';
import ms from 'ms';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export interface JWTPayload {
	userId: string;
	name: string;
	role: Role;
}

export const generateToken = (user: User) => {
	const payload: JWTPayload = {
		userId: user.id,
		name: user.name,
		role: user.role,
	};

	return jwt.sign(payload, process.env.JWT_SECRET!, {
		expiresIn: '15m' as ms.StringValue,
	});
};

export const generateRefreshToken = () => {
	return crypto.randomBytes(40).toString('hex');
};

export const verifyToken = (token: string): JWTPayload => {
	try {
		return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
	} catch (error) {
		throw new Error('Invalid token');
	}
};

export const hashPassword = async (password: string) => {
	return await bcrypt.hash(password, 12);
};
