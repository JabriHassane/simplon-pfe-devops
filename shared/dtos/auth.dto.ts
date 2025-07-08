import { z } from 'zod';
import { BaseRoleEnum } from './base.dto';

export const LoginDto = z.object({
	body: z.object({
		username: z.string().min(1, "Nom d'utilisateur requis"),
		password: z.string().min(1, 'Mot de passe requis'),
	}),
});

export const RegisterDto = z.object({
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
		role: BaseRoleEnum.optional().default('AGENT'),
	}),
});

export const UpdateProfileDto = z.object({
	body: z.object({
		username: z
			.string()
			.min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
			.regex(
				/^[a-zA-Z0-9_]+$/,
				"Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores"
			)
			.optional(),
		email: z.string().email('Email invalide').optional(),
	}),
});

export type LoginDtoType = z.infer<typeof LoginDto>;
export type RegisterDtoType = z.infer<typeof RegisterDto>;
export type UpdateProfileDtoType = z.infer<typeof UpdateProfileDto>;
