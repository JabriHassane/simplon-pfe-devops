import { useState } from 'react';

function useCrud<T>() {
	const [openFormPopup, setOpenFormPopup] = useState(false);
	const [openDeletePopup, setOpenDeletePopup] = useState(false);
	const [selectedResource, setSelectedResource] = useState<T | null>(null);

	const handleOpenFormPopup = (resource: T | null) => {
		setSelectedResource(resource);
		setOpenFormPopup(true);
	};

	const handleOpenDeletePopup = (resource: T) => {
		setSelectedResource(resource);
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
		handleOpenFormPopup,
		handleOpenDeletePopup,
		handleClosePopup,
	};
}

export default useCrud;
