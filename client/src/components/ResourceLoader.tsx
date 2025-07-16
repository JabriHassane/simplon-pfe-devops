import { Box, CircularProgress } from '@mui/material'

function ResourceLoader() {
  return (
    <Box
				display='flex'
				justifyContent='center'
				alignItems='center'
				height='100%'
				width='100%'
			>
				<CircularProgress size={80}  />
			</Box>
  )
}

export default ResourceLoader