import { z } from 'zod';
import { CreateOrderDto, OrderDto } from './order.dto';
import { ContactDto } from './contact.dto';

export const CreateSaleDto = CreateOrderDto.extend({
	contactId: z.string().optional(),
});

export const UpdateSaleDto = CreateSaleDto;

export const SaleDto = OrderDto.extend({
	contact: ContactDto.optional(),
});

export type CreateSaleDtoType = z.infer<typeof CreateSaleDto>;
export type UpdateSaleDtoType = z.infer<typeof UpdateSaleDto>;
export type SaleDtoType = z.infer<typeof SaleDto>;
