import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Paper, Typography, Tabs, Tab, Alert } from '@mui/material'

export default function Dashboard() {
  const { companyId } = useParams<{ companyId: string }>()
  const [tab, setTab] = useState(0)

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Dashboard</Typography>
      {companyId && (
        <Alert severity="info" sx={{ mb: 2 }}>Viewing {decodeURIComponent(companyId)}</Alert>
      )}
      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 3 }}>
        <Tab label="Overview" value={0} />
        <Tab label="Sentiment" value={1} />
        <Tab label="Trends" value={2} />
      </Tabs>
      <Paper sx={{ p: 3 }}>
        <Typography>Content coming soon.</Typography>
      </Paper>
    </Container>
  )
}
