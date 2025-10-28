import { Fab } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useNavigate } from 'react-router-dom'

export default function FloatingFAB() {
  const navigate = useNavigate()
  return (
    <Fab color="primary" aria-label="Analyze new company" onClick={() => navigate('/')}
      sx={{ position: 'fixed', bottom: 24, right: 24, boxShadow: 6 }}>
      <AddIcon />
    </Fab>
  )
}
