import { useState } from 'react';

function usePagination(
	initialPage: number = 0,
	initialRowsPerPage: number = 10
) {
	const [page, setPage] = useState(initialPage);
	const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
	};

	const handleRowsPerPageChange = (value: number) => {
		setRowsPerPage(value);
		setPage(0);
	};

	return {
		page,
		rowsPerPage,
		handlePageChange,
		handleRowsPerPageChange,
	};
}

export default usePagination;
