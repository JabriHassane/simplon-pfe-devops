import { Dialog, DialogTitle, DialogContent, Typography } from '@mui/material';

interface ResourceFormPopupProps {
	onClose: () => void;
	title: string;
	children: React.ReactNode;
	description?: string;
	width?: 'sm' | 'md' | 'lg';
}

function ResourceFormPopup({
	onClose,
	title,
	children,
	description,
	width = 'sm',
}: ResourceFormPopupProps) {
	return (
		<Dialog open onClose={onClose} maxWidth={width} fullWidth>
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
