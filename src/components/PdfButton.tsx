import { useState } from 'react'
import { Button, CircularProgress } from '@mui/material'
import { toast } from 'sonner'
import jsPDF from 'jspdf'

export default function PdfButton({ companyId }: { companyId: string }) {
  const [loading, setLoading] = useState(false)
  const download = async () => {
    setLoading(true)
    try {
      const [sent, kws, th] = await Promise.all([
        fetch(`/api/live_sentiment/?company_id=${encodeURIComponent(companyId)}`).then(r => r.json()),
        fetch(`/api/keywords/${encodeURIComponent(companyId)}`).then(r => r.json()),
        fetch(`/api/themes/${encodeURIComponent(companyId)}`).then(r => r.json()),
      ])
      const doc = new jsPDF()
      doc.text(`Report: ${companyId}`, 14, 20)
      doc.text(`Sentiment: +${sent.positive} / ~${sent.neutral} / -${sent.negative}`, 14, 32)
      doc.text(`Top Keywords: ${(kws?.slice(0,10).map((k:any)=>k.keyword)||[]).join(', ')}`, 14, 44)
      doc.text(`Themes: ${th?.slice(0,10).join(', ')}`, 14, 56)
      doc.save(`${companyId}_report.pdf`)
      toast.success('Report downloaded')
    } catch (e) {
      toast.error('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }
  return (
    <Button variant="outlined" onClick={download} aria-label="Download PDF report" disabled={loading}>
      {loading ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
      Download PDF
    </Button>
  )
}
