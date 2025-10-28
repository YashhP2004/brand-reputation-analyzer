import { CssBaseline, ThemeProvider, createTheme, AppBar, Toolbar, Typography, Container, Box, IconButton, TextField, InputAdornment } from '@mui/material'
import { BrowserRouter, Routes, Route, Navigate, Link as RouterLink, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import SearchIcon from '@mui/icons-material/Search'
import { useEffect, useMemo, useState } from 'react'

const theme = createTheme({
  typography: { fontFamily: 'Poppins, sans-serif' },
  palette: {
    mode: 'dark',
    primary: { main: '#4A90E2' },
    secondary: { main: '#50E3C2' },
    background: { default: '#0b0e14', paper: '#121723' }
  },
  shape: { borderRadius: 14 },
  components: {
    MuiPaper: { styleOverrides: { root: { backdropFilter: 'blur(10px)', backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.06)' } } }
  }
})

function Shell() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    const companyId = query.trim().toLowerCase().replace(/\s+/g, '_')
    navigate(`/dashboard/${encodeURIComponent(companyId)}`)
  }

  return (
    <>
      <AppBar position="sticky" color="transparent" elevation={0} sx={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Toolbar sx={{ gap: 2 }}>
          <Typography component={RouterLink} to="/" variant="h6" sx={{ color: '#fff', textDecoration: 'none', fontWeight: 700 }}>BrandRep</Typography>
          <Box component="form" onSubmit={onSubmit} sx={{ flexGrow: 1 }}>
            <TextField size="small" fullWidth placeholder="Search or jump to company (e.g., tesla)" value={query} onChange={e => setQuery(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.disabled' }} /></InputAdornment> }} />
          </Box>
          <IconButton color="inherit" size="small"><Brightness4Icon /></IconButton>
        </Toolbar>
      </AppBar>
      <Box sx={{ minHeight: '100vh', background: 'radial-gradient(1200px 600px at 10% -20%, rgba(74,144,226,0.25), transparent 50%), radial-gradient(1000px 600px at 110% 0%, rgba(80,227,194,0.18), transparent 40%), #0b0e14' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard/:companyId" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Container>
      </Box>
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </ThemeProvider>
  )
}
