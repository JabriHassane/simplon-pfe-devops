import { Dialog, DialogTitle, DialogContent, Typography } from '@mui/material';

interface ResourceFormPopupProps {
	open: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
}

function ResourceFormPopup({
	open,
	onClose,
	title,
	children,
}: ResourceFormPopupProps) {
	if (!open) return null;

	return (
		<Dialog open={true} onClose={onClose} maxWidth='sm' fullWidth>
			<DialogTitle>
				<Typography variant='h6' sx={{ fontWeight: 600 }}>
					{title}
				</Typography>
			</DialogTitle>

			<DialogContent sx={{ p: 0 }}>{children}</DialogContent>
		</Dialog>
	);
}

export default ResourceFormPopup;
