import { z } from 'zod';

export const ContactType = z.enum(['client', 'supplier']);
export type ContactType = z.infer<typeof ContactType>;

export const CreateContactDto = z.object({
	name: z.string().min(1, 'Le nom du contact ne doit pas être vide'),
	phone: z.string().optional(),
	address: z.string().optional(),
	type: ContactType,
});

export const UpdateContactDto = CreateContactDto;

export const ContactDto = z.object({
	id: z.string(),
	ref: z.string(),
	...CreateContactDto.shape,
});

export type CreateContactDto = z.infer<typeof CreateContactDto>;
export type UpdateContactDto = z.infer<typeof UpdateContactDto>;
export type ContactDto = z.infer<typeof ContactDto>;
