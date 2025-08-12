import { useState } from 'react';
import { PAGE_SIZE } from '../../../shared/constants';

function usePagination(initialRowsPerPage = PAGE_SIZE) {
	const [page, setPage] = useState(0);
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
