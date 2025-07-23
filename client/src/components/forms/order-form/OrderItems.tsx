import { useFormContext } from 'react-hook-form';
import { Box, Typography, Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import type {
	CreateOrderDtoType,
	OrderItemDtoType,
} from '../../../../../shared/dtos/order.dto';
import { useEffect, useState } from 'react';
import useCrud from '../../../hooks/useCrud';
import ResourceTable from '../../shared/ResourceTable';
import { formatPrice } from '../../../utils/price.utils';
import ResourceDeleteConfirmation from '../../shared/ResourceDeleteConfirmation';
import OrderItemFormPopup from './OrderItemFormPopup';
interface OrderItemsProps {
	init?: OrderItemDtoType[];
}

export const OrderItems = ({ init }: OrderItemsProps) => {
	const { setValue } = useFormContext<CreateOrderDtoType>();

	const {
		openFormPopup,
		openDeletePopup,
		selectedResource: selectedItem,
		selectedIndex,
		handleOpenFormPopup,
		handleOpenDeletePopup,
		handleClosePopup,
	} = useCrud<OrderItemDtoType>();

	const [items, setItems] = useState<OrderItemDtoType[]>(init || []);

	const handleSubmit = (item: OrderItemDtoType) => {
		const newItems = [...items];
		if (selectedItem) {
			newItems[selectedIndex] = item;
		} else {
			newItems.push(item);
		}
		setItems(newItems);
		handleClosePopup();
	};

	const handleRemove = () => {
		const newItems = [...items];
		newItems.splice(selectedIndex, 1);
		setItems(newItems);
	};

	useEffect(() => {
		setValue('items', items);
	}, [items]);

	return (
		<>
			<Box
				display='flex'
				gap={2}
				alignItems='center'
				justifyContent='space-between'
				my={2}
			>
				<Typography variant='h6'>Articles</Typography>

				<Button
					onClick={() => handleOpenFormPopup(null)}
					variant='contained'
					disableElevation
					startIcon={<Add />}
				>
					Ajouter
				</Button>
			</Box>

			<ResourceTable
				headers={[
					{ id: 'article', name: 'Article' },
					{ id: 'quantity', name: 'Quantité' },
					{ id: 'price', name: 'Prix' },
				]}
				rows={items.map((item) => ({
					item: item,
					data: {
						article: item.article?.name || '',
						quantity: item.quantity,
						price: formatPrice(item.price),
					},
				}))}
				onEdit={handleOpenFormPopup}
				onDelete={handleOpenDeletePopup}
			/>

			{openFormPopup && (
				<OrderItemFormPopup
					init={selectedItem}
					onSubmit={handleSubmit}
					onClose={handleClosePopup}
				/>
			)}

			{openDeletePopup && (
				<ResourceDeleteConfirmation
					onClose={handleClosePopup}
					title={`Supprimer ${selectedItem?.article?.ref}`}
					description='Voulez-vous vraiment supprimer cet article ?'
					onDelete={handleRemove}
				/>
			)}
		</>
	);
};
