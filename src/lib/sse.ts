import { useEffect, useRef } from 'react'

const timers: Record<string, NodeJS.Timeout> = {}

export function useSentimentSSE(companyId: string, onData: (data: any) => void) {
  const esRef = useRef<EventSource | null>(null)
  const onDataRef = useRef(onData)
  onDataRef.current = onData

  useEffect(() => {
    if (!companyId) return
    // Singleton: one poller per company, clear old if switching
    const k = companyId
    if (timers[k]) clearInterval(timers[k])
    const poll = async () => {
      try {
        const r = await fetch(`/api/live_sentiment/?company_id=${encodeURIComponent(companyId)}`)
        const j = await r.json()
        onDataRef.current(j)
      } catch {}
    }
    poll() // immediate
    const tid = setInterval(poll, 5000)
    timers[k] = tid
    return () => {
      clearInterval(tid)
      delete timers[k]
    }
  }, [companyId])
}
