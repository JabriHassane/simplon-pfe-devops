import { z } from 'zod';

export const ContactType = z.enum(['client', 'supplier']);
export type ContactTypeType = z.infer<typeof ContactType>;

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

export type CreateContactDtoType = z.infer<typeof CreateContactDto>;
export type UpdateContactDtoType = z.infer<typeof UpdateContactDto>;
export type ContactDtoType = z.infer<typeof ContactDto>;
