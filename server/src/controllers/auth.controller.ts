import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../index';
import { generateToken } from '../utils/jwt';

export const login = async (req: Request, res: Response) => {
	try {
		const { username, password } = req.body;

		// Find user by username
		const user = await prisma.user.findUnique({
			where: { username },
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

		// Return user data (without password) and token
		const { password: _, ...userWithoutPassword } = user;

		res.json({
			message: 'Login successful',
			user: userWithoutPassword,
			token,
		});
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const register = async (req: Request, res: Response) => {
	try {
		const { username, email, password, role = 'AGENT' } = req.body;

		// Check if user already exists
		const existingUser = await prisma.user.findFirst({
			where: {
				OR: [{ username }, { email }],
			},
		});

		if (existingUser) {
			return res
				.status(400)
				.json({ message: 'Username or email already exists' });
		}

		// Hash password
		const saltRounds = 12;
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		// Create user
		const user = await prisma.user.create({
			data: {
				username,
				email,
				password: hashedPassword,
				role,
				ref: `USER-${Date.now()}`,
				createdBy: req.user?.userId || 'system',
			},
		});

		// Generate JWT token
		const token = generateToken(user);

		// Return user data (without password) and token
		const { password: _, ...userWithoutPassword } = user;

		res.status(201).json({
			message: 'User created successfully',
			user: userWithoutPassword,
			token,
		});
	} catch (error) {
		console.error('Register error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const getProfile = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({ message: 'Authentication required' });
		}

		const user = await prisma.user.findUnique({
			where: { id: req.user.userId },
			select: {
				id: true,
				ref: true,
				username: true,
				email: true,
				role: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		res.json(user);
	} catch (error) {
		console.error('Get profile error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const updateProfile = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({ message: 'Authentication required' });
		}

		const { username, email } = req.body;

		// Check if username or email already exists
		if (username || email) {
			const existingUser = await prisma.user.findFirst({
				where: {
					OR: [
						...(username ? [{ username }] : []),
						...(email ? [{ email }] : []),
					],
					NOT: { id: req.user.userId },
				},
			});

			if (existingUser) {
				return res
					.status(400)
					.json({ message: 'Username or email already exists' });
			}
		}

		const user = await prisma.user.update({
			where: { id: req.user.userId },
			data: {
				...(username && { username }),
				...(email && { email }),
				updatedAt: new Date(),
				updatedBy: req.user.userId,
			},
			select: {
				id: true,
				ref: true,
				username: true,
				email: true,
				role: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		res.json(user);
	} catch (error) {
		console.error('Update profile error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};
