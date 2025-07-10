import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../index';
import { generateToken } from '../utils/jwt';
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

		// Generate JWT token
		const token = generateToken(user);
		// Set token in cookie
		res.cookie('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: ms('7D'),
		});

		// Return user data (without password) and token
		const { password: _, ...userWithoutPassword } = user;

		res.json(userWithoutPassword);
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const logout = async (req: Request, res: Response) => {
	res.clearCookie('token');
	res.json({ message: 'Logged out successfully' });
};

export const getConnectedUser = async (req: Request, res: Response) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id: req.user?.userId },
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
