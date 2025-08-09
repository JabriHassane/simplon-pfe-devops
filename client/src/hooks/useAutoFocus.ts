import { useEffect, useRef } from 'react';

function useAutoFocus(condition = true) {
	const ref = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (condition) {
			ref.current?.focus();
		}
	}, [condition]);

	return ref;
}

export default useAutoFocus;
