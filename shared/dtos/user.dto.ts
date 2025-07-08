import { z } from 'zod';

export const CreateUserDto = z.object({
	body: z.object({
		username: z
			.string()
			.min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
			.regex(
				/^[a-zA-Z0-9_]+$/,
				"Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores"
			),
		email: z.string().email('Email invalide'),
		password: z
			.string()
			.min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
		role: z.enum(['SUPER_ADMIN', 'ADMIN', 'AGENT']),
	}),
});

export const UpdateUserDto = z.object({
	params: z.object({
		id: z.string(),
	}),
	body: CreateUserDto.shape.body.omit({ password: true }).partial(),
});

export const UserIdDto = z.object({
	params: z.object({
		id: z.string().min(1, 'ID utilisateur requis'),
	}),
});

export type CreateUserDtoType = z.infer<typeof CreateUserDto>;
export type UpdateUserDtoType = z.infer<typeof UpdateUserDto>;
export type UserIdDtoType = z.infer<typeof UserIdDto>;
