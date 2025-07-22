import { useState } from 'react';

function useCrud<T>() {
	const [openFormPopup, setOpenFormPopup] = useState(false);
	const [openDeletePopup, setOpenDeletePopup] = useState(false);
	const [selectedResource, setSelectedResource] = useState<T | null>(null);
	const [selectedIndex, setSelectedIndex] = useState<number>(-1);

	const handleOpenFormPopup = (resource: T | null, index = -1) => {
		setSelectedResource(resource);
		setSelectedIndex(index);
		setOpenFormPopup(true);
	};

	const handleOpenDeletePopup = (resource: T, index = -1) => {
		setSelectedResource(resource);
		setSelectedIndex(index);
		setOpenDeletePopup(true);
	};

	const handleClosePopup = () => {
		setSelectedResource(null);
		setOpenFormPopup(false);
		setOpenDeletePopup(false);
	};

	return {
		openFormPopup,
		openDeletePopup,
		selectedResource,
		selectedIndex,
		handleOpenFormPopup,
		handleOpenDeletePopup,
		handleClosePopup,
	};
}

export default useCrud;
