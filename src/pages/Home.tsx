import { useEffect, useState } from 'react'
import { Box, Container, Typography, Card, CardActionArea, CardContent, TextField, Button, Stack, Paper, CircularProgress, Skeleton, Snackbar, Alert } from '@mui/material'
import Grid from '@mui/material/Grid'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

interface Company { id: string; display_name: string }

export default function Home() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingCards, setLoadingCards] = useState(true)
  const [companyName, setCompanyName] = useState('')
  const [keywords, setKeywords] = useState('')
  const [snack, setSnack] = useState<string | null>(null)
  const navigate = useNavigate()

  const fetchCompanies = async () => {
    try {
      setLoadingCards(true)
      const res = await fetch('/api/companies')
      const data = await res.json()
      setCompanies(data)
    } catch (e) {
      console.error(e); setSnack('Failed to load companies')
    } finally { setLoadingCards(false) }
  }

  useEffect(() => { fetchCompanies() }, [])

  const startAnalysis = async () => {
    if (!companyName.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_name: companyName.trim(), keywords })
      })
      if (!res.ok) throw new Error('Failed to start analysis')
      const data = await res.json()
      await fetchCompanies()
      const companyId = data.company_id
      const start = Date.now(); const timeout = 180000
      const poll = async () => {
        try {
          const r = await fetch(`/api/analysis_status/${encodeURIComponent(companyId)}`)
          const j = await r.json()
          if (j && j.status === 'complete') { navigate(`/dashboard/${encodeURIComponent(companyId)}`); return }
        } catch { }
        if (Date.now() - start < timeout) setTimeout(poll, 5000)
        else { setLoading(false); setSnack('Analysis started. Check the dashboard shortly.') }
      }
      poll()
    } catch (e) {
      console.error(e)
      setLoading(false)
      setSnack('Something went wrong starting analysis')
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Brand Reputation Analyzer</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Explore Existing Dashboards</Typography>
            <Grid container spacing={2}>
              {loadingCards &&
                Array.from({ length: 6 }).map((_, i) => (
                  <Grid item key={i} xs={12} sm={6} md={4}>
                    <Skeleton variant="rounded" height={90} />
                  </Grid>
                ))}
              {!loadingCards && companies.map((c, idx) => (
                <Grid item key={c.id} xs={12} sm={6} md={4}>
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                    <Card>
                      <CardActionArea onClick={() => navigate(`/dashboard/${encodeURIComponent(c.id)}`)}>
                        <CardContent>
                          <Typography fontWeight={600}>{c.display_name}</Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
              {!loadingCards && companies.length === 0 && (
                <Grid item xs={12}>
                  <Typography color="text.secondary">No companies yet.</Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Analyze a New Company</Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField label="Company Name" fullWidth value={companyName} onChange={e => setCompanyName(e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Related Keywords (comma-separated)" fullWidth value={keywords} onChange={e => setKeywords(e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" onClick={startAnalysis} disabled={loading}>Start Analysis</Button>
              </Grid>
              {loading && (
                <Grid item xs={12}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <CircularProgress size={20} />
                    <Typography color="text.secondary">Running analysis... this may take a couple of minutes.</Typography>
                  </Stack>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="info" variant="filled" onClose={() => setSnack(null)}>{snack}</Alert>
      </Snackbar>
    </Container>
  )
}
