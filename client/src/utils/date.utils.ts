export const formatDate = (dateString: string) => {
	return new Date(dateString).toLocaleDateString();
};

export const formatDateTime = (dateString: string) => {
	return new Date(dateString).toLocaleString();
};