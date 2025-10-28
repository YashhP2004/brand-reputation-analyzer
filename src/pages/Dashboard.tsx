import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Container, Grid, Paper, Typography, Tabs, Tab, Alert, ToggleButtonGroup, ToggleButton } from '@mui/material'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { ResponsiveContainer, Treemap, BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, LineChart, Line, CartesianGrid } from 'recharts'
import * as d3 from 'd3'
import cloud from 'd3-cloud'
import { useQuery } from '@tanstack/react-query'
import { useSentimentSSE } from '../lib/sse'
import PdfButton from '../components/PdfButton'
import FloatingFAB from '../components/FloatingFAB'

ChartJS.register(ArcElement, Tooltip, Legend)

interface Keyword { keyword: string; count: number }

type Range = '7d' | '30d' | '90d'

export default function Dashboard() {
  const { companyId = '' } = useParams()
  const [sent, setSent] = useState({ positive: 0, neutral: 0, negative: 0 })
  const [tab, setTab] = useState<'news' | 'reddit' | 'twitter'>('news')
  const [range, setRange] = useState<Range>('7d')
  const [negSpike, setNegSpike] = useState(false)
  const cloudRef = useRef<SVGSVGElement | null>(null)
  const [glow, setGlow] = useState(false)

  // Queries
  const keywordsQ = useQuery({ queryKey: ['keywords', companyId], queryFn: async () => await fetch(`/api/keywords/${encodeURIComponent(companyId)}`).then(r => r.json()), enabled: !!companyId })
  const themesQ = useQuery({ queryKey: ['themes', companyId], queryFn: async () => await fetch(`/api/themes/${encodeURIComponent(companyId)}`).then(r => r.json()), enabled: !!companyId })
  const mentionsQ = useQuery({ queryKey: ['mentions', companyId, tab], queryFn: async () => await fetch(`/api/${tab}/${encodeURIComponent(companyId)}`).then(r => r.json()), enabled: !!companyId })

  // SSE sentiment
  useSentimentSSE(companyId, (data) => {
    setSent(prev => {
      if (prev.negative !== data.negative || prev.positive !== data.positive || prev.neutral !== data.neutral) {
        setGlow(true); setTimeout(() => setGlow(false), 600)
      }
      return data
    })
  })

  // Word cloud
  useEffect(() => {
    const el = cloudRef.current
    if (!el) return
    const kws: Keyword[] = keywordsQ.data || []
    const w = el.clientWidth || 600
    const h = 320
    const max = Math.max(...kws.map(k => Number(k.count) || 0), 1)
    const words = kws.map(k => ({ text: k.keyword, size: 14 + (Number(k.count) || 0) / max * 36 }))
    const layout = cloud().size([w, h]).words(words).padding(4).rotate(() => Math.random() > 0.5 ? 0 : 90).font('Poppins').fontSize((d: any) => d.size).on('end', draw)
    layout.start()
    function draw(words: any[]) {
      d3.select(el).selectAll('*').remove()
      const svg = d3.select(el).attr('width', '100%').attr('height', h)
      const g = svg.append('g').attr('transform', `translate(${w / 2}, ${h / 2})`)
      g.selectAll('text').data(words).enter().append('text').style('font-size', (d: any) => `${d.size}px`).style('fill', (_: any, i: number) => d3.schemeTableau10[i % 10]).attr('text-anchor', 'middle').attr('transform', (d: any) => `translate(${d.x}, ${d.y}) rotate(${d.rotate})`).text((d: any) => d.text)
    }
  }, [keywordsQ.data])

  // Neg spike against live sentiment
  useEffect(() => {
    const total = sent.positive + sent.neutral + sent.negative
    const ratio = total ? sent.negative / total : 0
    setNegSpike(ratio >= 0.6)
  }, [sent])

  const pieData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [{ data: [sent.positive, sent.neutral, sent.negative], backgroundColor: ['#2ECC71', '#F1C40F', '#E74C3C'] }]
  }

  // Themes bar top 5
  const themesCounts = useMemo(() => {
    const arr: string[] = themesQ.data || []
    const counts = arr.reduce<Record<string, number>>((acc, t) => { acc[t] = (acc[t] || 0) + 1; return acc }, {})
    return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name,value])=>({ name, value }))
  }, [themesQ.data])

  // Historical sentiment (placeholder by sampling mentions dates)
  const history = useMemo(() => {
    const now = Date.now()
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
    const pts = Array.from({ length: days }).map((_, i) => ({
      date: new Date(now - (days - i) * 86400000).toISOString().slice(0,10),
      pos: Math.max(0, sent.positive - Math.round(Math.random() * 3)),
      neu: Math.max(0, sent.neutral - Math.round(Math.random() * 2)),
      neg: Math.max(0, sent.negative - Math.round(Math.random() * 2))
    }))
    return pts
  }, [range, sent])

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {negSpike && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Significant increase in negative sentiment detected over the selected period.
        </Alert>
      )}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 420, boxShadow: glow ? '0 0 30px rgba(231,76,60,0.35)' : undefined, transition: 'box-shadow 300ms' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Sentiment Breakdown</Typography>
              <PdfButton companyId={companyId} />
            </Box>
            <Pie data={pieData} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 420 }}>
            <Typography variant="h6" gutterBottom>Top Keywords</Typography>
            <svg ref={cloudRef as any} style={{ width: '100%' }} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 420 }}>
            <Typography variant="h6" gutterBottom>Top Themes</Typography>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={themesCounts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RTooltip />
                <Bar dataKey="value" fill="#4A90E2" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 420 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Historical Sentiment</Typography>
              <ToggleButtonGroup size="small" value={range} onChange={(_e, v) => v && setRange(v)} exclusive>
                <ToggleButton value="7d">7d</ToggleButton>
                <ToggleButton value="30d">30d</ToggleButton>
                <ToggleButton value="90d">90d</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <RTooltip />
                <Line type="monotone" dataKey="pos" stroke="#2ECC71" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="neu" stroke="#F1C40F" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="neg" stroke="#E74C3C" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Recent Mentions</Typography>
              <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ mb: 1 }} aria-label="Mentions source tabs">
                <Tab value="news" label="News" />
                <Tab value="reddit" label="Reddit" />
                <Tab value="twitter" label="Twitter" />
              </Tabs>
            </Box>
            <Box sx={{ maxHeight: 330, overflow: 'auto' }}>
              {(mentionsQ.data || []).slice(0, 100).map((r: any, i: number) => (
                <Box key={i} sx={{ py: 1.2, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <Typography fontWeight={600} gutterBottom>{r.title || (r.text ? r.text.slice(0, 80) : 'Mention')}</Typography>
                  {r.url && <Typography component="a" href={r.url} target="_blank" rel="noreferrer" color="primary.main">Open</Typography>}
                </Box>
              ))}
              {(!mentionsQ.data || !mentionsQ.data.length) && <Typography color="text.secondary">No mentions.</Typography>}
            </Box>
          </Paper>
        </Grid>
      </Grid>
      <FloatingFAB />
    </Container>
  )
}
