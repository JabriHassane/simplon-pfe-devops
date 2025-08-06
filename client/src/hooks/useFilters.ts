import { useState } from 'react';

function useFilters<T>(onChange?: () => void) {
	const [filters, setFilters] = useState<Record<string, any>>({});

	const handleFiltersChange = (newFilters: Partial<T>) => {
		setFilters({
			...filters,
			...newFilters,
		});
		onChange?.();
	};

	return {
		filters,
		handleFiltersChange,
	};
}

export default useFilters;
