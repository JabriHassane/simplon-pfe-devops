import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../index';
import { generateToken, generateRefreshToken } from '../utils/jwt.utils';
import ms from 'ms';

export const login = async (req: Request, res: Response) => {
	try {
		const { name, password } = req.body;

		// Find user by name
		const user = await prisma.user.findUnique({
			where: { name },
		});

		if (!user) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}

		// Check if user is deleted
		if (user.deletedAt) {
			return res.status(401).json({ message: 'Account has been deleted' });
		}

		// Verify password
		const isValidPassword = await bcrypt.compare(password, user.password || '');
		if (!isValidPassword) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}

		// Generate tokens
		const accessToken = generateToken(user);
		const refreshToken = generateRefreshToken();
		const expiresAt = new Date(Date.now() + ms('7D'));

		// Store refresh token in database
		await prisma.refreshToken.create({
			data: {
				token: refreshToken,
				userId: user.id,
				expiresAt,
			},
		});

		// Set tokens in cookies
		res.cookie('accessToken', accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: ms('15m'),
		});

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: ms('7D'),
		});

		// Return user data (without password)
		const { password: _, ...userWithoutPassword } = user;

		res.json(userWithoutPassword);
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const refresh = async (req: Request, res: Response) => {
	try {
		const refreshToken = req.cookies.refreshToken;

		if (!refreshToken) {
			return res.status(401).json({ message: 'Refresh token required' });
		}

		// Find refresh token in database
		const tokenRecord = await prisma.refreshToken.findUnique({
			where: { token: refreshToken },
			include: { user: true },
		});

		if (
			!tokenRecord ||
			tokenRecord.revokedAt ||
			tokenRecord.expiresAt < new Date()
		) {
			return res
				.status(401)
				.json({ message: 'Invalid or expired refresh token' });
		}

		// Generate new access token
		const accessToken = generateToken(tokenRecord.user);

		// Set new access token in cookie
		res.cookie('accessToken', accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: ms('15m'),
		});

		res.json({ message: 'Token refreshed successfully' });
	} catch (error) {
		console.error('Refresh token error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const logout = async (req: Request, res: Response) => {
	try {
		const refreshToken = req.cookies.refreshToken;

		// Revoke refresh token if it exists
		if (refreshToken) {
			await prisma.refreshToken.updateMany({
				where: { token: refreshToken },
				data: { revokedAt: new Date() },
			});
		}

		// Clear cookies
		res.clearCookie('accessToken');
		res.clearCookie('refreshToken');
		res.json({ message: 'Logged out successfully' });
	} catch (error) {
		console.error('Logout error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const getConnectedUser = async (req: Request, res: Response) => {
	try {
		const { userId } = req.user!;
		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		const { password: _, ...userWithoutPassword } = user;

		res.json(userWithoutPassword);
	} catch (error) {
		console.error('Get profile error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};
