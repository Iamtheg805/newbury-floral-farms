'use client'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../useAuth'

declare global {
  interface Window {
    ZXing: {
      BrowserMultiFormatReader: new () => {
        decodeFromVideoDevice: (deviceId: undefined, videoElementId: string, callback: (result: { getText: () => string } | undefined, err: unknown) => void) => Promise<void>
        reset: () => void
      }
    }
  }
}

const STAGES = [
  { key: 'packed', label: 'Packed', icon: '📦', color: '#185FA5' },
  { key: 'out_for_delivery', label: 'Out to Logistics', icon: '🚚', color: '#854F0B' },
  { key: 'delivered', label: 'Delivered to Logistics', icon: '✓', color: '#3B6D11' },
]

type ResultEntry = { order_number: string; customer?: string; success: boolean; message: string }

export default function ScanStation() {
  const authReady = useAuth()
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('')
  const [stage, setStage] = useState('packed')
  const [scanning, setScanning] = useState(false)
  const [libraryLoaded, setLibraryLoaded] = useState(false)
  const [queue, setQueue] = useState<string[]>([])
  const [results, setResults] = useState<ResultEntry[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [justScanned, setJustScanned] = useState('')
  const readerRef = useRef<InstanceType<Window['ZXing']['BrowserMultiFormatReader']> | null>(null)
  const lastScanRef = useRef<{ code: string; time: number }>({ code: '', time: 0 })
  const queueRef = useRef<string[]>([])

  useEffect(() => {
    const name = localStorage.getItem('user_name') || ''
    const role = localStorage.getItem('user_role') || ''
    setUserName(name)
    setUserRole(role)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/@zxing/library@0.21.3/umd/index.min.js'
    script.async = true
    script.onload = () => setLibraryLoaded(true)
    document.body.appendChild(script)
    return () => {
      if (readerRef.current) {
        try { readerRef.current.reset() } catch {}
      }
      document.body.removeChild(script)
    }
  }, [])

  if (!authReady) return null

  function handleDetected(code: string) {
    const now = Date.now()
    if (code === lastScanRef.current.code && now - lastScanRef.current.time < 2000) return
    lastScanRef.current = { code, time: now }

    if (queueRef.current.includes(code)) {
      setJustScanned(`${code} already in list`)
      setTimeout(() => setJustScanned(''), 1500)
      return
    }

    queueRef.current = [...queueRef.current, code]
    setQueue([...queueRef.current])
    setJustScanned(`Added ${code}`)
    setTimeout(() => setJustScanned(''), 1500)
  }

  function removeFromQueue(code: string) {
    queueRef.current = queueRef.current.filter(c => c !== code)
    setQueue([...queueRef.current])
  }

  function startScanning() {
    if (!libraryLoaded || !window.ZXing) {
      setCameraError('Scanner library still loading, try again in a second.')
      return
    }
    setCameraError('')
    setScanning(true)
    const reader = new window.ZXing.BrowserMultiFormatReader()
    readerRef.current = reader
    reader.decodeFromVideoDevice(undefined, 'scan-video', (result) => {
      if (result) handleDetected(result.getText())
    }).catch(() => {
      setCameraError('Could not access camera. Check that you allowed camera permission for this site.')
      setScanning(false)
    })
  }

  function stopScanning() {
    if (readerRef.current) {
      try { readerRef.current.reset() } catch {}
    }
    setScanning(false)
  }

  async function submitAll() {
    if (queue.length === 0) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/orders/scan-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_numbers: queue, stage }),
      })
      const data = await res.json()
      setResults(data.results || [])
      queueRef.current = []
      setQueue([])
    } catch {
      setResults([{ order_number: 'all', success: false, message: 'Network error, please try again' }])
    }
    setSubmitting(false)
  }

  const stageMeta = STAGES.find(s => s.key === stage)!
  const backHref = userRole === 'manager' ? '/manager' : '/dashboard'

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f8', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div style={{ background: 'white', borderBottom: '0.5px solid #e5e5e3', padding: '12px 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="logo" style={{ height: '28px', width: 'auto' }} />
          <div style={{ fontSize: '13px', fontWeight: '500', color: '#111' }}>Scan Station</div>
        </div>
        <a href={backHref} style={{ fontSize: '12px', color: '#185FA5', textDecoration: 'none' }}>Back to {userRole === 'manager' ? 'Manager' : 'Dashboard'}</a>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '1.25rem 1rem' }}>
        <div style={{ fontSize: '12px', color: '#888', marginBottom: '1rem' }}>Hi {userName} -- pick a stage, scan all your packages, then submit them together.</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '1rem' }}>
          {STAGES.map(s => (
            <button key={s.key} onClick={() => setStage(s.key)} style={{ padding: '12px 6px', borderRadius: '10px', border: stage === s.key ? `2px solid ${s.color}` : '1px solid #e5e5e3', background: stage === s.key ? `${s.color}15` : 'white', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>{s.icon}</div>
              <div style={{ fontSize: '11px', fontWeight: stage === s.key ? '600' : '500', color: stage === s.key ? s.color : '#444' }}>{s.label}</div>
            </button>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid #e5e5e3', padding: '1rem', marginBottom: '1rem' }}>
          {!scanning ? (
            <button onClick={startScanning} style={{ width: '100%', padding: '14px', background: '#185FA5', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
              Start scanning
            </button>
          ) : (
            <>
              <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', background: '#000', marginBottom: '10px' }}>
                <video id="scan-video" style={{ width: '100%', display: 'block' }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '80%', height: '35%', border: '2px solid #fff', borderRadius: '8px', boxShadow: '0 0 0 999px rgba(0,0,0,0.35)' }} />
                {justScanned && (
                  <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px', background: 'rgba(0,0,0,0.75)', color: 'white', fontSize: '12px', padding: '6px 10px', borderRadius: '6px', textAlign: 'center' }}>
                    {justScanned}
                  </div>
                )}
              </div>
              <button onClick={stopScanning} style={{ width: '100%', padding: '10px', background: '#FCEBEB', color: '#A32D2D', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
                Stop scanning
              </button>
            </>
          )}
          {cameraError && <div style={{ marginTop: '10px', fontSize: '12px', color: '#A32D2D' }}>{cameraError}</div>}
        </div>

        <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid #e5e5e3', padding: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ready to submit ({queue.length})</div>
            {queue.length > 0 && <button onClick={() => { queueRef.current = []; setQueue([]) }} style={{ border: 'none', background: 'transparent', color: '#A32D2D', fontSize: '11px', cursor: 'pointer' }}>Clear all</button>}
          </div>
          {queue.length === 0 ? (
            <div style={{ fontSize: '12px', color: '#888' }}>Scan a label to add it here.</div>
          ) : (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                {queue.map(code => (
                  <div key={code} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f9f9f8', border: '0.5px solid #e5e5e3', borderRadius: '99px', padding: '5px 10px' }}>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#111' }}>{code}</span>
                    <button onClick={() => removeFromQueue(code)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '13px', color: '#888' }}>x</button>
                  </div>
                ))}
              </div>
              <button onClick={submitAll} disabled={submitting} style={{ width: '100%', padding: '12px', background: submitting ? '#aaa' : stageMeta.color, color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: submitting ? 'not-allowed' : 'pointer' }}>
                {submitting ? 'Submitting...' : `Submit ${queue.length} as "${stageMeta.label}"`}
              </button>
            </>
          )}
        </div>

        {results.length > 0 && (
          <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid #e5e5e3', padding: '1rem' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Last submission results</div>
            {results.map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < results.length - 1 ? '0.5px solid #f0f0ee' : 'none' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '500', color: '#111', fontFamily: 'monospace' }}>{r.order_number}</div>
                  <div style={{ fontSize: '11px', color: r.success ? '#3B6D11' : '#A32D2D' }}>{r.message}{r.customer ? ` -- ${r.customer}` : ''}</div>
                </div>
                <div style={{ fontSize: '14px' }}>{r.success ? '✅' : '⚠️'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}