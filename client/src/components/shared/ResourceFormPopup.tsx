import { Dialog, DialogTitle, DialogContent, Typography } from '@mui/material';

interface ResourceFormPopupProps {
	onClose: () => void;
	title: string;
	children: React.ReactNode;
	description?: string;
}

function ResourceFormPopup({
	onClose,
	title,
	children,
	description,
}: ResourceFormPopupProps) {
	return (
		<Dialog open onClose={onClose} maxWidth='sm' fullWidth>
			<DialogTitle>
				<Typography variant='h6' sx={{ fontWeight: 600 }}>
					{title}
				</Typography>
				{description && <Typography variant='body1'>{description}</Typography>}
			</DialogTitle>

			<DialogContent sx={{ p: 0 }}>{children}</DialogContent>
		</Dialog>
	);
}

export default ResourceFormPopup;
