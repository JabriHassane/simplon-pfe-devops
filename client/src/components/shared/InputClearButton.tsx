import { IconButton, InputAdornment } from '@mui/material';
import { Clear } from '@mui/icons-material';

interface Props {
	onClick: (e?: any) => void;
	position?: 'start' | 'end';
}

function InputClearButton({ onClick, position = 'start' }: Props) {
	return (
		<InputAdornment position={position}>
			<IconButton
				size='small'
				onClick={onClick}
				edge={position === 'start' ? 'start' : 'end'}
			>
				<Clear />
			</IconButton>
		</InputAdornment>
	);
}

export default InputClearButton;
